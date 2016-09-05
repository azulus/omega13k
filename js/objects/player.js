$.assign($, {
	PlayerGameObject: function (seed = 1037) {
		let maxSpeed = 5,

			acceleration = maxSpeed / 20,
			velocity = [0, 0],

			x = 290,
			y = 235,
			lastShotTime = 0,

			soundSeed = 102,
			projectileSound = $.createLaserSound($.getRandomNumberGenerator(soundSeed)),
			explosionSound = $.createExplosionSound($.getRandomNumberGenerator(4)),

			life = 100,

		obj = {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.PLAYER,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'm',
			// Width
			[ObjectIndex.WIDTH]: GameConst.SHIP_WIDTH,
			// Height
			[ObjectIndex.HEIGHT]: GameConst.SHIP_HEIGHT,
			// X Position
			[ObjectIndex.POSITION_X]: x,
			// Y Position
			[ObjectIndex.POSITION_Y]: y,

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				life--
				$.playSound(explosionSound)
				$.lifeBar().style.transform = `scaleX(${1600 * life / 100})`
				if (life < 1) {
					alert('Game over!')
					location.reload()
				}
			},

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				let now = Date.now(),
					x = obj[ObjectIndex.POSITION_X],
					y = obj[ObjectIndex.POSITION_Y]

				// Update player based on arrows.
				// Update velocity.
				if ($.downKeys.ArrowDown) velocity[1] = Math.min(velocity[1] + acceleration, maxSpeed);
				else if ($.downKeys.ArrowUp) velocity[1] = Math.max(velocity[1] - acceleration, -maxSpeed);
				else if (velocity[1] > 0) velocity[1] -= acceleration;
				else if (velocity[1] < 0) velocity[1] += acceleration;
				if ($.downKeys.ArrowRight) velocity[0] = Math.min(velocity[0] + acceleration, maxSpeed);
				else if ($.downKeys.ArrowLeft) velocity[0] = Math.max(velocity[0] - acceleration, -maxSpeed);
				else if (velocity[0] > 0) velocity[0] -= acceleration;
				else if (velocity[0] < 0) velocity[0] += acceleration;

				x = obj[ObjectIndex.POSITION_X] + velocity[0];
				y = obj[ObjectIndex.POSITION_Y] + velocity[1];

				// Prevent the player from going out of bounds.
				if (y < GameConst.HEIGHT - GameConst.SHIP_HEIGHT && y > 0) obj[ObjectIndex.POSITION_Y] = y;
				if (x < GameConst.WIDTH - GameConst.SHIP_WIDTH && x > 0) obj[ObjectIndex.POSITION_X] = x;

				if ($.downKeys[' '] && now - lastShotTime > 300) {
					lastShotTime = now
					$.playSound(projectileSound)
					$.createPlayerProjectile(new $.PlayerProjectileGameObject(null, x, y))
				}
			}
		}
		return obj
	}
})
