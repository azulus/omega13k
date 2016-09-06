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

		// Update projectile for Shape X/Y start position
		let firstShape = obj[ObjectIndex.GENERATED_SHAPES][0];
		obj[ObjectIndex.POSITION_X] -= firstShape[ShapeIndex.POINTS][0];
		obj[ObjectIndex.POSITION_Y] -= firstShape[ShapeIndex.POINTS][1];

		$.enemyProjectiles.push(obj)
	},

	createPlayerProjectile: (obj) => {
		$.createGameObject(obj)
		$.playerProjectiles.push(obj)
	},

	/**
	 * Destroys a projectile if it's outside the game rect.
	 * To destroy an object we set the destroy flag and remove all destroyed objects after rendering.
	 * Projectiles should only have a single circle shape which we need to find the position of inside the shape object.
	 */
	destroyProjectileIfOutsideGameRect: (projectile) => {
		let firstShape = projectile[ObjectIndex.GENERATED_SHAPES][0],
			radius = firstShape[ShapeIndex.RADIUS],
			points = firstShape[ShapeIndex.POINTS]

		if (projectile[ObjectIndex.POSITION_X] + points[0] + radius < 0 ||
			projectile[ObjectIndex.POSITION_X] + points[0] - radius > GameConst.WIDTH ||
			projectile[ObjectIndex.POSITION_Y] + points[1] + radius < 0 ||
			projectile[ObjectIndex.POSITION_Y] + points[1] - radius > GameConst.HEIGHT) {
			projectile[ObjectIndex.DESTROYED] = true
		}
	},

	renderSeed: (gameObject) => {
		let cnv = $.createElement('canvas');
		// TEMP: Store a reference to the canvas on each game object while things move with CSS.
		//gameObject[ObjectIndex.DOM] = cnv
		// $.appendChild($.gameBoard(), cnv);

		let
			// ctx = $.getContext(cnv),
			r = $.getRandomNumberGenerator(gameObject[ObjectIndex.SEED]),
			shapes = $.getRandomShapes(r, gameObject[ObjectIndex.WIDTH], gameObject[ObjectIndex.HEIGHT], gameObject[ObjectIndex.SEED_SHAPE_STR])

		gameObject[ObjectIndex.GENERATED_SHAPES] = shapes
	  // shapes.forEach(rs => $.drawShape(ctx, rs))
	},

	_startTime: null,

	drawLoop: () => {
		if (!$._startTime) {
			$._startTime = Date.now();
		}
		let elapsedTime = Date.now() - $._startTime,
			i = $.gameObjects.length,
			canvas = $.getCanvas(),
			gl = $.get3DContext(canvas);

		// clear the canvas
		$.clear3DCanvas(gl);

		// draw the starfield
		$.renderStarfield(gl, elapsedTime, canvas.width, canvas.height);

		// prepare to draw shapes
		let prog = $.prepareCanvasForShapes(gl, canvas.width, canvas.height);

		while (i--) {
			let obj = $.gameObjects[i]
			// Call .t (tick) on all objects
			obj[ObjectIndex.TICK]()

			$.collisionsForObject(obj)

			// Check if the object is destroyed.
			if (obj[ObjectIndex.DESTROYED]) {
				// Remove the object and splice the array
				//$.removeChild($.gameBoard(), obj[ObjectIndex.DOM])
				$.gameObjects.splice(i, 1)
			} else {
				$.drawShapesToCanvasGL(gl, prog, obj[ObjectIndex.GENERATED_SHAPES], obj[ObjectIndex.POSITION_X], obj[ObjectIndex.POSITION_Y]);
				// Render the game object
				// obj[ObjectIndex.DOM].style.transform = `translate(${obj[ObjectIndex.POSITION_X]}px, ${obj[ObjectIndex.POSITION_Y]}px)`
			}
		}
		requestAnimationFrame($.drawLoop)
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
	},

	/**
	 * Processes all collisions for game objects.
	 */
	collisionsForObject: (gameObject) => {
		const collisionChecks = {
			[ObjectTypeIndex.ENEMY]: $.playerProjectiles,
			[ObjectTypeIndex.PLAYER]: $.enemyProjectiles
		},
		check = collisionChecks[gameObject[ObjectIndex.OBJECT_TYPE]];

		if (!check) return;

		let i = check.length;

		while (i--) {
			let projectile = check[i],
				collision = $.checkCollision(gameObject, projectile)
			if (collision) {
				gameObject[ObjectIndex.PROJECTILE_COLLISION](projectile)
				projectile[ObjectIndex.DESTROYED] = true
			}

			// The projectile may have also been destroyed by going out of bounds.
			if (projectile[ObjectIndex.DESTROYED]) {
				check.splice(i, 1)
			}
		}
	}
})
