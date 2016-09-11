$.assign($, {
	// timing data
	levelStartTime: null,
	levelGameTime: null,
	levelLastLoopTime: null,
	// enemy data
	levelEnemies: null,
	_activeEnemyIndexes: Array(100).fill(0),
	_activeEnemyPositions: Array(200).fill(0),
	_activeEnemyCount: 0,
	// projectile data
	enemyProjectiles: null,
	_activeEnemyProjectilePositions: new Float32Array(Array(2000).fill(0)),
	_activeEnemyProjectileIndex: Array(1000).fill(0),
	_activeEnemyProjectileCount: 0,
	// player data
	playerXVelocity: 0,
	playerYVelocity: 0,
	playerShapes: null,
	playerBoundingBox: null,
	playerPosition: [],
	playerHealth: [],
	playerProjectilePath: null,
	playerProjectiles: null,
	playerChrono: PlayerConst.MAX_CHRONO_METER,
	_activePlayerProjectilePositions: new Float32Array(Array(2000).fill(0)),
	_activePlayerProjectileIndex: Array(1000).fill(0),
	_activePlayerProjectileCount: 0,

	speedMultiplier: 1,

	// first index of visible projectiles, for optimization purposes
	_firstEnemyProjectileIdx: 0,
	_firstPlayerProjectileIdx: 0,

	// Game state
	gameWon: false,

	setTimeMultiplier: (tm) => {$.speedMultiplier = tm; return 1},

	checkEnemyProjectileCollisions: () => {
		let count = 0;
		const projectiles = $.enemyProjectiles;
		for (let i = $._firstEnemyProjectileIdx; i < projectiles.length; i++){
			let xIdx = count++, yIdx = count++;
			const playerPosition = $.getCurrentPlayerPosition();
			if ($.checkCollision(
				$.playerShapes,
				$.playerBoundingBox,
				playerPosition[0],
				playerPosition[1],
				$._activeEnemyProjectilePositions[xIdx],
				$._activeEnemyProjectilePositions[yIdx],
				10 // Radius
				)) {
				// "Destroy" the projectile.
				projectiles[i][1] = $.levelGameTime;
				// Reduce player health.
				let currHealth = $.playerHealth[$.playerHealth.length - 1][1],
					projectileDamage = 1;
				$.setPlayerHealth(currHealth - projectileDamage);
			}
		}
	},

	checkPlayerProjectileCollisions: () => {
		let count = 0;
		const projectiles = $.playerProjectiles;
		for (let i = $._firstPlayerProjectileIdx; i < projectiles.length; i++){
			let xIdx = count++, yIdx = count++;
			for (let j = 0; j < $._activeEnemyCount; j++){
				let posIdx = j * 2;
				let enemy = $.levelEnemies[$._activeEnemyIndexes[j]];
				let paths = enemy[LevelShipIndex.PATH_DATA];

				if ($.checkCollision(
					enemy[LevelShipIndex.SHAPES],
					enemy[LevelShipIndex.BOUNDING_BOX],
					$._activeEnemyPositions[posIdx],
					$._activeEnemyPositions[posIdx+1],
					$._activePlayerProjectilePositions[xIdx],
					$._activePlayerProjectilePositions[yIdx],
					10 // Radius
					)) {
					// "Destroy" the projectile.
					projectiles[i][1] = $.levelGameTime;

					if ($.inBossLevel) {
						// Currently special casing boss levels.
						if ($.bossHealth > 0) $.bossHealth--;
						else enemy[LevelShipIndex.KILL_TIME] = $.levelGameTime;
					} else {
						// Destroy the ship.
						enemy[LevelShipIndex.KILL_TIME] = $.levelGameTime;
					}
				}
			}
		}
	},

	initializeBoss: (seed=1, idealProjectileWaves=3, idealProjectilesPerPath=8,
			idealProjectilePaths=8, idealTimeBetweenProjectiles=1000,
			projectileSpeed=100) => {

		let r = $.getRandomNumberGenerator(seed),
			waves = [],
			path = $.generateBossPath(r),

			// Fake end time for now for bosses.
			endTime = 99999999,

			bossWidth = GameConst.SHIP_WIDTH * 2,

			bossHeight = GameConst.SHIP_HEIGHT * 2,

			boss = $.getRandomFromArray(r, $.enemySpec),

			bossR = $.getRandomNumberGenerator(boss[ObjectIndex.SEED]),

			bossShapes = $.getRandomShapes(bossR, bossWidth, bossHeight, boss[ObjectIndex.SEED_SHAPE_STR]),

			bossBoundingBox = $.getContainingBoundingBox(bossShapes),

			timeBetweenProjectiles = $.floor($.randBetween(bossR, idealTimeBetweenProjectiles*.75, idealTimeBetweenProjectiles*1.25)),

			// the projectile pattern to use
			projectilePattern = $.generateProjectilePaths(
				bossR,
				ProjectilePathDirectionConst.LEFT,
				0, 0, 0, idealProjectileWaves-1, idealProjectileWaves+1,
				idealProjectilesPerPath-1, idealProjectilesPerPath+1,
				idealProjectilePaths-1, idealProjectilePaths+1, 2000, projectileSpeed),

			times = [];

		// For bosses, push a single projectile path, and replay it.
		for (var j = timeBetweenProjectiles; j < timeBetweenProjectiles + 10000; j += 200) {
			let pos = $.getPositionAtTime(path, j);
			let projectilePaths = $.offsetProjectilePaths(
				projectilePattern,
				pos[0] + bossWidth / 2,
				pos[1] + bossHeight / 2,
				j
			).map(pp => [j, undefined, pp])
			times.push([j, projectilePaths]);
		}

		waves.push([0, endTime, undefined, bossShapes, path, projectilePattern, times, 0, bossBoundingBox])

		$.levelEnemies = waves;
	},

	initializeLevel: (seed=1, numWaves=10, idealMsBetweenWaves=5000,
			idealProjectileWaves=3, idealProjectilesPerPath=3,
			idealProjectilePaths=4, idealTimeBetweenProjectiles=3000,
			projectileSpeed=200) => {
		$.levelEnemies =
		$.levelStartTime = $.levelLastLoopTime = Date.now();
		$.playerHealth = [[0, ($.inBossLevel ? $.getCurrentPlayerHealth : PlayerConst.STARTING_HEALTH)]];
		$.playerPosition = [[0, ...$.getCurrentPlayerPosition()]];
		$.levelGameTime = 0;
		$.enemyProjectiles = [];
		$.playerProjectiles = [];
		$.levelGameTime = 0;
		$._firstEnemyProjectileIdx = 0;
		$._firstPlayerProjectileIdx = 0;
		$.enemyProjectiles = [];
		$.playerProjectiles = [];
		$._activeEnemyCount = 0;
		$._activeEnemyProjectileCount = 0;
		$._activePlayerProjectileCount = 0;


		let r = $.getRandomNumberGenerator(seed),
			i, waves = [], delay=0, path, enemy, projectilePattern, start, end, enemyR, timeBetweenProjectiles,
			enamyShapes, enemyBoundingBox, enemyShapes;

	  // generate the timings and paths for each wave of enemies
		for (i = 0; i < numWaves; i++) {
			// create the delay between this and the previous wave
			delay += $.randBetween(r, idealMsBetweenWaves * 0.75, idealMsBetweenWaves*1.25);
			// generate the path for the wave to follow
			path = $.generateRandomPath(r, delay);
			// the time at which the wave starts
			start = delay
			// the time at which the wave ends (for convenience's sake)
			end = delay + $.getTotalPathTime(path[0])
			// the enemy to use for the wave
			enemy = $.getRandomFromArray(r, $.enemySpec)
			enemyR = $.getRandomNumberGenerator(enemy[ObjectIndex.SEED]);
			enemyShapes = $.getRandomShapes(enemyR, GameConst.SHIP_WIDTH, GameConst.SHIP_HEIGHT, enemy[ObjectIndex.SEED_SHAPE_STR])
			enemyBoundingBox = $.getContainingBoundingBox(enemyShapes);

			// the projectile pattern to use
			projectilePattern = $.generateProjectilePaths(
				enemyR,
				ProjectilePathDirectionConst.LEFT,
				0, 0, 0, idealProjectileWaves-1, idealProjectileWaves+1,
			 idealProjectilesPerPath-1, idealProjectilesPerPath+1,
			 idealProjectilePaths-1, idealProjectilePaths+1, 2000, projectileSpeed)
			// time between volleys of projectiles
			timeBetweenProjectiles = $.floor($.randBetween(enemyR, idealTimeBetweenProjectiles*.75, idealTimeBetweenProjectiles*1.25))
			path.forEach(p => {
				let times = [];
				for (let j = start + timeBetweenProjectiles; j <= end; j += timeBetweenProjectiles) {
					let pos = $.getPositionAtTime(p, j);
					let projectilePaths = $.offsetProjectilePaths(
						projectilePattern,
						pos[0] + GameConst.SHIP_WIDTH / 2,
						pos[1] + GameConst.SHIP_HEIGHT / 2,
						j
					).map(pp => [j, undefined, pp])
					times.push([j, projectilePaths]);
				}
				waves.push([start, end, undefined, enemyShapes, p, projectilePattern, times, 0, enemyBoundingBox])
			})
		}

		$._firstPlayerProjectileIdx = $._firstEnemyProjectileIdx = 0;
		$.levelEnemies = waves;
	},

	getCurrentPlayerHealth: () => $.playerHealth[$.playerHealth.length - 1][1],
	getCurrentPlayerPosition: () => {
		let curr = $.playerPosition[$.playerPosition.length - 1];
		return [curr[1], curr[2]];
	},

	setPlayerHealth: (newHealth) => {
		let curr = $.playerHealth[$.playerHealth.length - 1];
		if (curr[0] === $.levelGameTime) {
			curr[1] = newHealth;
		} else {
			$.playerHealth.push([$.levelGameTime, newHealth]);
		}
	},

	restorePlayerHealth: () => {
		let idx = $.playerHealth.length - 1;
		while (idx > 0 && $.playerHealth[idx][0] > $.levelGameTime) {
			idx--;
		}
		if (idx !== $.playerHealth.length - 1) {
			$.playerHealth = $.playerHealth.slice(0, idx + 1);
		}
	},

	initializeGame: () => {
		$.levelStartTime = $.levelLastLoopTime = Date.now();
		let r = $.getRandomNumberGenerator(PlayerConst.SHAPE_SEED);
		$.playerShapes = $.getRandomShapes(r, GameConst.SHIP_WIDTH, GameConst.SHIP_HEIGHT, 'm');
		$.playerBoundingBox = $.getContainingBoundingBox($.playerShapes);
		$.playerPosition = [[0, 290, 235]];
		$.levelGameTime = 0;

		$.playerProjectilePath = $.generateProjectilePaths(
			$.getRandomNumberGenerator(PlayerConst.PROJECTILE_SEED),
			ProjectilePathDirectionConst.RIGHT,
			0, 0, 0)
		$.playerProjectiles = [];
	},

	updateEnemyStates: () => {
		let count = 0;
		let posCount = 0;
		let pos;

		for (let i = 0; i < $.levelEnemies.length; i++) {
			let wave = $.levelEnemies[i];

			if (wave[LevelShipIndex.KILL_TIME] !== undefined && wave[LevelShipIndex.KILL_TIME] > $.levelGameTime) {
				wave[LevelShipIndex.KILL_TIME] = undefined;
			}

			if (wave[LevelShipIndex.KILL_TIME] === undefined &&
					wave[LevelShipIndex.START_TIME] <= $.levelGameTime &&
					wave[LevelShipIndex.END_TIME] >= $.levelGameTime) {
				$._activeEnemyIndexes[count++] = i;
				pos = $.getPositionAtTime(wave[LevelShipIndex.PATH_DATA], $.levelGameTime);
				$._activeEnemyPositions[posCount++] = pos[0];
				$._activeEnemyPositions[posCount++] = pos[1];
			}
		}

		$._activeEnemyCount = count;
	},

	_rewindEnemyProjectileStates: (elapsedTime) => {
		let i, projectile;
		// enemy projectiles
		let shouldDelete = false;
		for (i = 0; i < $.enemyProjectiles.length; i++) {
			projectile = $.enemyProjectiles[i];
			if (projectile[1] && projectile[1] > $.levelGameTime) {
				if (i < $._firstEnemyProjectileIdx) $._firstEnemyProjectileIdx = i;
				projectile[1] = undefined;
			}
			if (projectile[0] > $.levelGameTime) shouldDelete = true;
		}
		if (shouldDelete) $.enemyProjectiles = $.enemyProjectiles.filter(p => p[0] <= $.levelGameTime);

		// player projectiles
		shouldDelete = false;
		for (i = 0; i < $.playerProjectiles.length; i++) {
			projectile = $.playerProjectiles[i];
			if (projectile[1] && projectile[1] > $.levelGameTime) {
				if (i < $._firstPlayerProjectileIdx) $._firstPlayerProjectileIdx = i;
				projectile[1] = undefined;
			}
			if (projectile[0] > $.levelGameTime) shouldDelete = true;
		}
		if (shouldDelete) $.playerProjectiles = $.playerProjectiles.filter(p => p[0] <= $.levelGameTime);
	},

	_spawnPlayerProjectiles: (elapsedTime) => {
		// spawn player projectiles if needed
		let lastProjectileTime = $.playerProjectiles.length === 0 ? 0 :
			$.playerProjectiles[$.playerProjectiles.length - 1][3];
		let nextProjectileTime = lastProjectileTime + PlayerConst.MS_BETWEEN_PROJECTILE_WAVES;
		if ($.levelGameTime >= nextProjectileTime) {
			let pos = $.getCurrentPlayerPosition();
			$.playerProjectiles = $.playerProjectiles.concat(
				$.offsetProjectilePaths($.playerProjectilePath, -1, -1, nextProjectileTime).map(p => [
					p[ProjectilePathIndex.OFFSET_TIME], undefined, p, p[ProjectilePathIndex.OFFSET_TIME] + PlayerConst.MS_BETWEEN_PROJECTILE_WAVES
				])
			);
		}
	},

	updateProjectileStates: (elapsedTime) => {
		if (elapsedTime === 0) return;
		let i, idx = 0, projectile;

		if (elapsedTime < 0) {
			$._rewindEnemyProjectileStates(elapsedTime);
		}

		for (i = 0; i < $._activeEnemyCount; i++) {
			let enemy = $.levelEnemies[$._activeEnemyIndexes[i]];

			if (elapsedTime < 0) {
				// mark enemy projectiles as unspawned
				while(enemy[LevelShipIndex.NEXT_PROJECTILE] > 0 &&
						enemy[LevelShipIndex.PROJECTILE_TIMES][enemy[LevelShipIndex.NEXT_PROJECTILE] - 1][0] > $.levelGameTime) {
					enemy[LevelShipIndex.NEXT_PROJECTILE]--;
				}
			} else if (elapsedTime > 0) {
				// spawn new waves of enemy projectiles
				let nextTime = enemy[LevelShipIndex.NEXT_PROJECTILE];
				let path = enemy[LevelShipIndex.PROJECTILE_TIMES][nextTime];
				if (path && path[0] <= $.levelGameTime) {
					$.enemyProjectiles = $.enemyProjectiles.concat(
						path[1]
					)
					enemy[LevelShipIndex.NEXT_PROJECTILE]++;
				}
			}
		}

		if (elapsedTime > 0) {
			$._spawnPlayerProjectiles(elapsedTime);
		}
	},

	prepareCanvasForProjectiles: (gl, width, height) => {
	    let prog = $.getProjectilesProgram(gl)

	    gl.useProgram(prog)
	    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), width, height)

	    return prog;
	},

	updatePlayerPosition: (elapsedTime, actualElapsedTime) => {
		if (elapsedTime >= 0) {
			// normal movement, apply velocity
			let velocityChange = PlayerConst.ACCELERATION_PER_MS * actualElapsedTime;

			// apply acceleration to player velocity
			if ($.downKeys.ArrowDown === $.downKeys.ArrowUp) {
				if ($.playerYVelocity < 0) {
					$.playerYVelocity = Math.min($.playerYVelocity + velocityChange, 0);
				} else if ($.playerYVelocity > 0){
					$.playerYVelocity = Math.max($.playerYVelocity - velocityChange, 0);
				}
			} else {
				if ($.downKeys.ArrowDown) $.playerYVelocity = Math.min($.playerYVelocity + velocityChange, PlayerConst.MAX_DIST_PER_MS)
				if ($.downKeys.ArrowUp) $.playerYVelocity = Math.max($.playerYVelocity - velocityChange, -PlayerConst.MAX_DIST_PER_MS)
			}

			if ($.downKeys.ArrowLeft === $.downKeys.ArrowRight) {
				if ($.playerXVelocity < 0) {
					$.playerXVelocity = Math.min($.playerXVelocity + velocityChange, 0);
				} else if ($.playerXVelocity > 0){
					$.playerXVelocity = Math.max($.playerXVelocity - velocityChange, 0);
				}
			} else {
				if ($.downKeys.ArrowLeft) $.playerXVelocity = Math.max($.playerXVelocity - velocityChange, -PlayerConst.MAX_DIST_PER_MS)
				if ($.downKeys.ArrowRight) $.playerXVelocity = Math.min($.playerXVelocity + velocityChange, PlayerConst.MAX_DIST_PER_MS)
			}

			if ($.playerXVelocity === 0 && $.playerYVelocity === 0) return;

			// update player position based on velocity
			let curr = $.playerPosition[$.playerPosition.length - 1];
			let posData = [
				$.levelGameTime,
				$.clamp(curr[1] + $.playerXVelocity * actualElapsedTime, 0, GameConst.WIDTH - GameConst.SHIP_WIDTH),
				$.clamp(curr[2] + $.playerYVelocity * actualElapsedTime, 0, GameConst.HEIGHT - GameConst.SHIP_HEIGHT)
			];

			// push the latest position onto the position stack
			if ($.playerPosition[$.playerPosition.length - 1][0] === $.levelGameTime) {
				$.playerPosition[$.playerPosition.length - 1] = posData;
			} else {
				$.playerPosition.push(posData);
			}

		} else if (elapsedTime < 0){
			// rewind the player position
			let idx = $.playerPosition.length - 1;
			while (idx > 0 && $.playerPosition[idx][0] > $.levelGameTime) {
				idx--;
			}
			if (idx !== $.playerPosition.length - 1) {
				$.playerPosition = $.playerPosition.slice(0, idx + 1);
			}
		}
	},

	startGame: () => {
		$.getElementById('pause').addEventListener('click', (e) => $.setTimeMultiplier(SpeedConst.PAUSE) && e.preventDefault())
		$.getElementById('slow').addEventListener('click', (e) => $.setTimeMultiplier(SpeedConst.SLOW) && e.preventDefault())
		$.getElementById('normal').addEventListener('click', (e) => $.setTimeMultiplier(SpeedConst.NORMAL) && e.preventDefault())
		$.getElementById('fast').addEventListener('click', (e) => $.setTimeMultiplier(SpeedConst.FAST_FORWARD) && e.preventDefault())
		$.getElementById('close').addEventListener('click', (e) => {
			e.preventDefault();
			e.target.parentNode.parentNode.style.display = 'none'
		})

		let gameLoop = () => {
			let currentTime = Date.now();
			let actualElapsedTime = (currentTime - $.levelLastLoopTime)
			let elapsedTime = actualElapsedTime * $.speedMultiplier;
			let shouldResumeNormal = false;
			$.levelLastLoopTime = currentTime;

			let lastGameTime = $.levelGameTime;
			$.levelGameTime += elapsedTime;

			if ($.levelGameTime < 0) {
				$.levelGameTime = 0;
				shouldResumeNormal = true;
			}

			// spawn enemies and update their positions
			$.updateEnemyStates();

			// update player position (by player controls if non-negative, by replay if negative)
			$.updatePlayerPosition(elapsedTime, actualElapsedTime);

			// update player health (if negative time, done automatically during collision tests normally)
			if (elapsedTime < 0) $.restorePlayerHealth();

			// spawn and update projectile positions
			$.updateProjectileStates(elapsedTime);

			// check for collision between player and enemy projectiles (if non-negative time)
			$.checkEnemyProjectileCollisions();
			$.checkPlayerProjectileCollisions();

			// initialize the canvas
			let canvas = $.getCanvas();
			let gl = $.get3DContext(canvas);
			$.clear3DCanvas(gl);

			// draw the background
			// $.renderStarfield(gl, gameTime, canvas.width, canvas.height);

			// render shapes
			let shapeProg = $.prepareCanvasForShapes(gl, canvas.width, canvas.height);
			$.renderEnemies(gl, shapeProg);
			let playerPosition = $.getCurrentPlayerPosition();
			$.renderPlayer(gl, shapeProg, playerPosition);

			// render health bar
			$.renderHealth(gl, shapeProg, canvas.width, canvas.height);

			// render chrono bar
			$.renderChrono(gl, shapeProg, canvas.width, canvas.height);

			if ($.inBossLevel) {
				$.renderBossHealth(gl, shapeProg, canvas.width, canvas.height);
			}

			// render projectiles
			let pointProg = $.prepareCanvasForProjectiles(gl, canvas.width, canvas.height);
			$.renderEnemyProjectiles(gl, pointProg, $.enemyProjectiles);
			$.renderPlayerProjectiles(gl, pointProg, $.playerProjectiles, playerPosition);

			// apply effects based on current speed

			// update time multiplier and chrono bar
			if ($.downKeys[' '] && $.playerChrono > 0) {
				// Use chrono bar and rewind time.
				$.setTimeMultiplier(SpeedConst.REWIND);
				$.playerChrono -= Math.abs(elapsedTime * PlayerConst.CHRONO_USE_PER_MS);
			} else if ($.speedMultiplier !== SpeedConst.NORMAL) {
				// Restore to normal time if we're not holding spacebar.
				$.setTimeMultiplier(SpeedConst.NORMAL)
			} else if ($.playerChrono < PlayerConst.MAX_CHRONO_METER) {
				// Recover chrono.
				$.playerChrono += elapsedTime * PlayerConst.CHRONO_RECOVERY_PER_MS;
			}

			// Handle level change.
			let wave = $.levelEnemies[$.levelEnemies.length - 1];
			if (
				// Normal wave
				wave[LevelShipIndex.END_TIME] <= $.levelGameTime ||
				$.inBossLevel && $._activeEnemyCount === 0) {
				$.advanceLevel();
			}

			gl.flush();

			if (shouldResumeNormal) {
				$.setTimeMultiplier(1);
			}

			if ($.gameWon) {
				console.log('game won.');
			} else {
				requestAnimationFrame(gameLoop);
			}
		}

		$.initKeyboard();
		$.initializeGame()
		$.advanceLevel();
		requestAnimationFrame(gameLoop);
	}
})

window.addEventListener('load', $.startGame);
