$.assign($, {
	// timing data
	levelStartTime: null,
	levelGameTime: null,
	levelLastLoopTime: null,
	// enemy data
	levelEnemies: null,
	_activeEnemyIndexes: Array(GameLoopConst.ACTIVE_ENEMY_MAX).fill(0),
	_activeEnemyPositions: Array(GameLoopConst.ACTIVE_ENEMY_MAX * 2).fill(0),
	_activeEnemyCount: 0,
	// boss data
  // projectile data
	// Temporary boss health variable.
	// May consider allowing for rewinding this.
	maxBossHealth: 0,
	bossHealth: [],
	bossIdx: 0,
	bossProjectilePathIdx: 0,
	bossProjectilePaths: null,
	// projectile data
	enemyProjectiles: null,
	_activeEnemyProjectilePositions: new Float32Array(Array(GameLoopConst.ACTIVE_PROJECTILE_MAX * 2).fill(0)),
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
	playerChrono: PlayerConst.STARTING_CHRONO,
	playerLaserSoundsTiming: [],
	playerExplosionAudioPool: [],
	playerProjectileAudioPool: [],
	_activePlayerProjectilePositions: new Float32Array(Array(GameLoopConst.ACTIVE_PROJECTILE_MAX * 2).fill(0)),
	_activePlayerProjectileCount: 0,
	levelDialog: [],

	nextRewindSoundTime: 0,
	speedMultiplier: 1,

	// first index of visible projectiles, for optimization purposes
	_firstEnemyProjectileIdx: 0,
	_firstPlayerProjectileIdx: 0,

	// Game state
	gameState: null,

	setTimeMultiplier: (tm) => {$.speedMultiplier = tm; return 1},

	checkEnemyProjectileCollisions: () => {
		let count = 0;
		const projectiles = $.enemyProjectiles;
		for (let i = $._firstEnemyProjectileIdx; i < projectiles.length; i++){
			let [start, end] = projectiles[i];
			// Only process collisions for projectiles which have spawned.
			if (start > $.levelGameTime || end !== undefined) continue;

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
				// Play the sound.
				$.playerExplosionAudioPool[AudioPoolIndex.PLAY]();
				// Reduce player health.
				let currHealth = $.playerHealth[$.playerHealth.length - 1][1],
					projectileDamage = 10,
					newHealth = currHealth - projectileDamage;
				$.setPlayerHealth(newHealth);
				if (newHealth <= 0) {
					$.gameState = GameStateConst.LOST;
				}
			}
		}
	},

	checkPlayerProjectileCollisions: () => {
		let count = 0;
		const projectiles = $.playerProjectiles;
		for (let i = $._firstPlayerProjectileIdx; i < projectiles.length; i++){
			let xIdx = count++, yIdx = count++;
			for (let j = 0; j < $._activeEnemyCount; j++){
				let posIdx = j * 2, enemyIdx = $._activeEnemyIndexes[j];
				let enemy = $.levelEnemies[enemyIdx];

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

					// Play the enemy explosion audio.
					enemy[LevelShipIndex.EXPLOSION_AUDIO_POOL][AudioPoolIndex.PLAY]();

					if ($.inBossLevel && enemyIdx === $.bossIdx) {
						// Currently special casing boss levels.
						let bossHealth = $.getCurrentBossHealth();
						if (bossHealth > 0) $.setBossHealth(bossHealth - 1);
						else enemy[LevelShipIndex.KILL_TIME] = $.levelGameTime;
					} else {
						// Destroy the ship.
						enemy[LevelShipIndex.KILL_TIME] = $.levelGameTime;
					}
				}
			}
		}
	},

	resetLevel: () => {
		$.levelEnemies = [];
		$.levelStartTime = $.levelLastLoopTime = Date.now();
		$.playerHealth = [[0, ($.inBossLevel ? $.getCurrentPlayerHealth : PlayerConst.STARTING_HEALTH)]];
		$.playerPosition = [[0, ...$.getCurrentPlayerPosition()]];
		$.levelGameTime = 0;
		$.enemyProjectiles = [];
		$.playerProjectiles = [];
		$.levelGameTime = 0;
		$._firstEnemyProjectileIdx = 0;
		$._firstPlayerProjectileIdx = 0;
		$._activeEnemyCount = 0;
		$._activeEnemyProjectileCount = 0;
		$._activePlayerProjectileCount = 0;
	},

	initializeBoss: (dialog=[], seed=1, idealProjectileWaves=3,
			idealProjectilePaths=8, idealTimeBetweenProjectiles=1000,
			projectileSpeed=100) => {
		$.levelDialog = dialog;

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

			explosionAudioPool = $.createAudioPool($.createExplosionSound(Math.random), AudioConst.ENEMY_EXPLOSION_POOL_SIZE),

			laserAudioPool = $.createAudioPool($.createLaserSound(Math.random), AudioConst.ENEMY_PROJECTILE_POOL_SIZE)

			// the projectile patbossProjectilePathIdxtern to use
			$.bossProjectilePathIdx = 0;
			$.bossProjectilePaths = Array(5).fill(0).map(() => $.generateProjectilePaths(
				bossR,
				ProjectilePathDirectionConst.LEFT,
				0, 0, 0, idealProjectileWaves-1, idealProjectileWaves+1,
				1 /* minProjectilesPerWave */, 1 /* maxProjectilesPerWave */,
				idealProjectilePaths-1, idealProjectilePaths+1, 2000, projectileSpeed));

		waves.push([0, endTime, undefined, bossShapes, path, [], [], 0, bossBoundingBox, explosionAudioPool, laserAudioPool])

		$.levelEnemies = waves;
		$.bossIdx = $.levelEnemies.length - 1 ;
	},

	initializeLevel: (dialog=[], seed=1, numWaves=10, idealMsBetweenWaves=5000,
			idealProjectileWaves=3, idealProjectilePaths=4, idealTimeBetweenProjectiles=3000,
			projectileSpeed=200) => {
		$.levelDialog = dialog;
		let r = $.getRandomNumberGenerator(seed),
			i, waves = [], delay=0, path, enemy, projectilePattern, start, end, enemyR, timeBetweenProjectiles,
			enemyBoundingBox, enemyShapes, explosionAudioPool, laserAudioPool;

	  // generate the timings and paths for each wave of enemies
		for (i = 0; i < numWaves; i++) {
			// Create the explosion/laser sounds for this wave of enemies.
			explosionAudioPool = $.createAudioPool($.createExplosionSound(Math.random), AudioConst.ENEMY_EXPLOSION_POOL_SIZE)
			laserAudioPool = $.createAudioPool($.createLaserSound(Math.random), AudioConst.ENEMY_PROJECTILE_POOL_SIZE)
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
			 1 /* minProjectilesPerWave */, 1 /* maxProjectilesPerWave */,
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
				waves.push([start, end, undefined, enemyShapes, p, projectilePattern, times, 0, enemyBoundingBox, explosionAudioPool, laserAudioPool])
			})
		}

		$._firstPlayerProjectileIdx = $._firstEnemyProjectileIdx = 0;
		$.levelEnemies = waves;
	},

	getCurrentBossHealth: () => $.bossHealth[$.bossHealth.length - 1][1],
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

	setBossHealth: (newHealth) => {
		let curr = $.bossHealth[$.bossHealth.length - 1];
		if (curr[0] === $.levelGameTime) {
			curr[1] = newHealth;
		} else {
			$.bossHealth.push([$.levelGameTime, newHealth]);
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

	restoreBossHealth: () => {
		let idx = $.bossHealth.length - 1;
		while (idx > 0 && $.bossHealth[idx][0] > $.levelGameTime) {
			idx--;
		}
		if (idx !== $.bossHealth.length - 1) {
			$.bossHealth = $.bossHealth.slice(0, idx + 1);
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
		$.bossProjectilePaths = null;
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

	_rewindProjectileStates: (elapsedTime) => {
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
			$.playerProjectiles = $.playerProjectiles.concat(
				$.offsetProjectilePaths($.playerProjectilePath, -1, -1, nextProjectileTime).map(p => {
					$.playerLaserSoundsTiming.push(p[ProjectilePathIndex.OFFSET_TIME]);
					return [
						p[ProjectilePathIndex.OFFSET_TIME], undefined, p, p[ProjectilePathIndex.OFFSET_TIME] + PlayerConst.MS_BETWEEN_PROJECTILE_WAVES
					];
				})
			);
		}
	},

	_spawnBossProjectiles: (elapsedTime) => {
		// // spawn player projectiles if needed
		let lastProjectileTime = $.enemyProjectiles.length === 0 ? 0 :
			$.enemyProjectiles[$.enemyProjectiles.length - 1][0];

		let nextProjectileTime = lastProjectileTime + 3000; // should be time between boss waves
		if ($.levelGameTime >= nextProjectileTime) {
			$.bossProjectilePathIdx = ($.bossProjectilePathIdx + 1) % $.bossProjectilePaths.length;
			let pos = $.getPositionAtTime($.levelEnemies[$.bossIdx][LevelShipIndex.PATH_DATA], $.levelGameTime);
			$.enemyProjectiles = $.enemyProjectiles.concat(
				$.offsetProjectilePaths($.bossProjectilePaths[$.bossProjectilePathIdx], pos[0] + GameConst.SHIP_WIDTH, pos[1] + GameConst.SHIP_HEIGHT, nextProjectileTime).map(pp => [pp[ProjectilePathIndex.OFFSET_TIME], undefined, pp])
			);
		}
	},

	updateProjectileStates: (elapsedTime) => {
		if (elapsedTime === 0) return;
		let i;

		if (elapsedTime < 0) {
			$._rewindProjectileStates(elapsedTime);
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
					enemy[LevelShipIndex.PROJECTILE_AUDIO_POOL][AudioPoolIndex.PLAY]();
					$.enemyProjectiles = $.enemyProjectiles.concat(
						path[1]
					)
					enemy[LevelShipIndex.NEXT_PROJECTILE]++;
				}
			}
		}

		if (elapsedTime > 0) {
			$._spawnPlayerProjectiles(elapsedTime);
			if ($.inBossLevel)	$._spawnBossProjectiles(elapsedTime);
		}
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
				$.clamp(curr[1] + $.playerXVelocity * actualElapsedTime, 0, GameConst.FLYABLE_WIDTH - GameConst.SHIP_WIDTH),
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
		/*
		$.getElementById('pause').addEventListener('click', (e) => $.setTimeMultiplier(SpeedConst.PAUSE) && e.preventDefault())
		*/

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
			if (elapsedTime < 0) {
				$.restorePlayerHealth();
				$.restoreBossHealth();
			}

			// spawn and update projectile positions
			$.updateProjectileStates(elapsedTime);
			$.updateStarfield(elapsedTime);

			// check for collision between player and enemy projectiles (if non-negative time)
			$.checkEnemyProjectileCollisions();
			$.checkPlayerProjectileCollisions();

			$.renderGame();

			// Fire player projectile sounds
			if ($.playerLaserSoundsTiming[0] < $.levelGameTime) {
				$.playerLaserSoundsTiming.shift();
				$.playerProjectileAudioPool[AudioPoolIndex.PLAY]();
			}

			// apply effects based on current speed

			// update time multiplier and chrono bar
			if (($.downKeys['1'] || $.downKeys[' ']) && $.playerChrono > 0) {
				// Use chrono bar and rewind time.
				$.setTimeMultiplier(SpeedConst.REWIND);
				$.playerChrono -= Math.abs(elapsedTime * PlayerConst.CHRONO_USE_PER_MS);
				// Play rewind sound.
				if (!$.nextRewindSoundTime || $.levelGameTime < $.nextRewindSoundTime) {
					let rewindSound = $.createRewindSound(Math.random);
					$.playSound(rewindSound);
					$.nextRewindSoundTime = $.levelGameTime - rewindSound[2] * 1000 + AudioConst.REWIND_SOUND_DELAY;
				}
			} else if ($.downKeys['2'] && $.playerChrono > 0) {
				$.setTimeMultiplier(SpeedConst.SLOW);
				$.playerChrono -= Math.abs(elapsedTime * PlayerConst.CHRONO_USE_PER_MS / 2);
			} else if ($.downKeys['3'] && $.playerChrono > 0) {
				$.setTimeMultiplier(SpeedConst.FAST_FORWARD);
				// Increase chrono when fast forwarding.
				if ($.playerChrono < PlayerConst.MAX_CHRONO_METER) $.playerChrono += Math.abs(elapsedTime * PlayerConst.CHRONO_USE_PER_MS / 4);
			} else if ($.speedMultiplier !== SpeedConst.NORMAL) {
				// Restore to normal time if we're not holding spacebar.
				$.setTimeMultiplier(SpeedConst.NORMAL)
				$.nextRewindSoundTime = 0;
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

			if (shouldResumeNormal) {
				$.setTimeMultiplier(1);
			}

			if ($.gameState === GameStateConst.WON) {
				document.body.classList.add('i');
			} else if ($.gameState === GameStateConst.LOST) {
				document.body.classList.add('o');
				addEventListener('keydown', e => {
					if (e.key === ' ') location.reload();
				});
			} else {
				requestAnimationFrame(gameLoop);
			}
		}

		$.gameState = GameStateConst.PLAYING;
		$.playerExplosionAudioPool = $.createAudioPool($.createExplosionSound($.getRandomNumberGenerator(4)), AudioConst.PLAYER_EXPLOSION_POOL_SIZE);
		$.playerProjectileAudioPool = $.createAudioPool($.createLaserSound($.getRandomNumberGenerator(102)), AudioConst.PLAYER_PROJECTILE_POOL_SIZE);

		$.initKeyboard();
		$.initializeRendering();
		$.initializeGame()
		$.advanceLevel();
		requestAnimationFrame(gameLoop);
	}
})

window.addEventListener('load', $.startGame);
