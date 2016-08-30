$.assign($, {
	_gameBoard: null,

	_lifeBar: null,

	lifeBar: () => {
		if (!$._lifeBar) {
			$._lifeBar = $.getElementById('l')
		}
		return $._lifeBar;
	},

	gameBoard: () => {
		if (!$._gameBoard) {
			$._gameBoard = $.getElementById('g')
		}
		return $._gameBoard;
	},

	// Tracks all game objects.
	gameObjects: [],

	// Maintains just the enemy projectiles for fast collision detection.
	enemyProjectiles: [],

	// Maintains just the player projectiles for fast collision detection.
	playerProjectiles: [],

	/**
	 * Adds an instantiated game object to the list of objects
	 * and renders the game object canvas.
	 */
	createGameObject: (obj) => {
		$.renderSeed(obj)
		$.gameObjects.push(obj)
	},

	createEnemyProjectile: (obj) => {
		$.createGameObject(obj)
		$.enemyProjectiles.push(obj)
	},

	createPlayerProjectile: (obj) => {
		$.createGameObject(obj)
		$.playerProjectiles.push(obj)
	},

	/**
	 * Destroys an object if it's outside the game rect.
	 * To destroy an object we set the destroy flag and remove all destroyed objects after rendering.
	 */
	destroyIfOutsideGameRect: (obj) => {
		if (obj[ObjectIndex.POSITION_X] < 0 || obj[ObjectIndex.POSITION_X] > GameConst.WIDTH || obj[ObjectIndex.POSITION_Y] < 0 || obj[ObjectIndex.POSITION_Y] > GameConst.HEIGHT) {
			obj[ObjectIndex.DESTROYED] = true
		}
	},

	renderSeed: (gameObject) => {
		let cnv = $.createElement('canvas');
		// TEMP: Store a reference to the canvas on each game object while things move with CSS.
		gameObject[ObjectIndex.DOM] = cnv
		$.appendChild($.gameBoard(), cnv);

		let ctx = $.getContext(cnv),
			r = $.getRandomNumberGenerator(gameObject[ObjectIndex.SEED]),
			shapes = $.getRandomShapes(r, gameObject[ObjectIndex.WIDTH], gameObject[ObjectIndex.HEIGHT], gameObject[ObjectIndex.SEED_SHAPE_STR])

		gameObject[ObjectIndex.GENERATED_SHAPES] = shapes
	    shapes.forEach(rs => $.drawShape(ctx, rs))
	},

	drawLoop: () => {
		let now = Date.now(),
			i = $.gameObjects.length

		while (i--) {
			let obj = $.gameObjects[i]
			// Call .t (tick) on all objects
			obj[ObjectIndex.TICK]()

			$.collisionsForObject(obj)

			// Check if the object is destroyed.
			if (obj[ObjectIndex.DESTROYED]) {
				// Remove the object and splice the array
				$.removeChild($.gameBoard(), obj[ObjectIndex.DOM])
				$.gameObjects.splice(i, 1)
			} else {
				// Render the game object
				obj[ObjectIndex.DOM].style.transform = `translate(${obj[ObjectIndex.POSITION_X]}px, ${obj[ObjectIndex.POSITION_Y]}px)`
			}
		}
		setTimeout($.drawLoop, 16)
	},

	startGame: () => {
		// Initialize gameObjects
		$.gameObjects = [
			new $.PlayerGameObject()
		]

		// Animate the lifebar to full health
		setTimeout(() => {
			$.lifeBar().style.transform = `scaleX(1600)`
		})

		// Begin draw loop
		$.gameObjects.forEach($.renderSeed)
		$.drawLoop()

		// Create initial enemies /w path
		// $.createEnemyWave()

		// TODO: Levels should manage this instead.
		setInterval(() => $.createEnemyWave(), 7000)
	},

	createEnemyWave: () => {
		let path = $.generateRandomPath(Math.random, 0),
			enemySpec = $.enemySpec[$.floor(Math.random()*$.enemySpec.length)],

			// Each wave has the same ship graphics, explosion sounds and projectile sounds.
			projectileSound = $.createLaserSound(Math.random),
			explosionSound = $.createExplosionSound(Math.random)

		for (var i = 0; i < path.length; i++) {
			$.createGameObject(new $.EnemyGameObject(
				enemySpec,
				path[i],
				projectileSound,
				explosionSound
			))
		}
	},

	/**
	 * Processes all collisions for game objects.
	 */
	collisionsForObject: (gameObject) => {
		let i

		if (gameObject[ObjectIndex.OBJECT_TYPE] === ObjectTypeIndex.ENEMY) {
			// Process player projectiles
			i = $.playerProjectiles.length
			while (i--) {
				let projectile = $.playerProjectiles[i],
					collision = $.checkCollision(gameObject, projectile)
				if (collision) {
					gameObject[ObjectIndex.PROJECTILE_COLLISION](projectile)
					projectile[ObjectIndex.DESTROYED] = true
				}

				// The projectile may have also been destroyed by going out of bounds.
				if (projectile[ObjectIndex.DESTROYED]) {
					$.playerProjectiles.splice(i, 1)
				}
			}

		} else if (gameObject[ObjectIndex.OBJECT_TYPE] === ObjectTypeIndex.PLAYER) {
			// Process enemy projectiles
			i = $.enemyProjectiles.length
			while (i--) {
				let projectile = $.enemyProjectiles[i],
					collision = $.checkCollision(gameObject, projectile)

				if (collision) {
					gameObject[ObjectIndex.PROJECTILE_COLLISION](projectile)
					projectile[ObjectIndex.DESTROYED] = true
				}

				// The projectile may have also been destroyed by going out of bounds.
				if (projectile[ObjectIndex.DESTROYED]) {
					$.enemyProjectiles.splice(i, 1)
				}
			}
		}
	}
})

