$.assign($, {
	PlayerProjectileGameObject: function (seed = 1465, x, y) {
		let speed = 10,
			soundSeed = 102,
			sound = $.createLaserSound($.getRandomNumberGenerator(102));

		// Adjust bullet position for player.
		// TODO: This should probably be passed in from the player.
		x += 46
		y += 36


		// Play sound when constructed.
		$.playSound(sound);

		let obj = {
			// The seed
			s: seed,
			// Used seed objects
			so: 'c',
			// Width
			w: 20,
			// Height
			h: 20,
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
				x += speed
				$.destroyIfOutsideGameRect(obj)
			}
		}
		return obj;
	}
})
