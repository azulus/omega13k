$.assign($, {
	PlayerGameObject: function (seed = 8713) {
		let speed = 5,
			x = 0,
			y = 0,
			lastShotTime = 0,
			spriteWidth = 55,
			spriteHeight = 90

		let obj = {
			// The seed
			s: seed,
			// Used seed objects
			so: 'm',
			// Width
			w: 100,
			// Height
			h: 100,
			// X Position
			get x () {
				return x
			},
			// Y Position
			get y () {
				return y
			},

			// Logic on player tick
			t: () => {
				let now = Date.now()

				// Update player based on arrows.
				// Prevent the player from going out of bounds.
				if ($.downKeys.ArrowDown && y < GameIndex.HEIGHT - speed - spriteHeight) y += speed;
				if ($.downKeys.ArrowUp && y > speed) y -= speed;
				if ($.downKeys.ArrowRight && x < GameIndex.WIDTH - speed - spriteWidth) x += speed;
				if ($.downKeys.ArrowLeft && x > speed) x -= speed;

				if ($.downKeys[' '] && now - lastShotTime > 300) {
					lastShotTime = now
					$.createGameObject(new $.PlayerProjectileGameObject(null, x, y))
				}
			}
		}
		return obj
	}
})
