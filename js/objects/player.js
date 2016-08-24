$.assign($, {
	PlayerGameObject: function (seed = 205) {
		let speed = 5,
			x = 0,
			y = 0,
			lastShotTime = 0,
			spriteWidth = 55,
			spriteHeight = 90

		let obj = {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.PLAYER,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'm',
			// Width
			[ObjectIndex.WIDTH]: 100,
			// Height
			[ObjectIndex.HEIGHT]: 100,
			// X Position
			[ObjectIndex.POSITION_X]: x,
			// Y Position
			[ObjectIndex.POSITION_Y]: y,

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				console.log('player take damage')
			},

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				let now = Date.now(),
					x = obj[ObjectIndex.POSITION_X],
					y = obj[ObjectIndex.POSITION_Y]

				// Update player based on arrows.
				// Prevent the player from going out of bounds.
				if ($.downKeys.ArrowDown && y < GameIndex.HEIGHT - speed - spriteHeight) y += speed;
				if ($.downKeys.ArrowUp && y > speed) y -= speed;
				if ($.downKeys.ArrowRight && x < GameIndex.WIDTH - speed - spriteWidth) x += speed;
				if ($.downKeys.ArrowLeft && x > speed) x -= speed;

				obj[ObjectIndex.POSITION_Y] = y
				obj[ObjectIndex.POSITION_X] = x

				if ($.downKeys[' '] && now - lastShotTime > 300) {
					lastShotTime = now
					$.createPlayerProjectile(new $.PlayerProjectileGameObject(null, x, y))
				}
			}
		}
		return obj
	}
})
