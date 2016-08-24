$.assign($, {
	EnemyGameObject: function (seed = 6480, x, y, seedObjects = 'm') {
		let speed = 5,
			tickMovement = speed

		return {
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

			// Logic on enemy tick
			t: () => {
				// Simple movement for now
				y += tickMovement
				if (y > 450 || y < 50) tickMovement = 0 - tickMovement;
			}
		}
	}
})
