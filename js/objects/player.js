$.PlayerGameObject = function (seed = 5745) {
	let speed = 5,
		x = 0,
		y = 0,
		lastShotTime = 0

	return {
		// The seed
		s: seed,
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
			if ($.downKeys.ArrowDown) y += speed;
			if ($.downKeys.ArrowUp) y -= speed;
			if ($.downKeys.ArrowRight) x += speed;
			if ($.downKeys.ArrowLeft) x -= speed;

			if ($.downKeys[' '] && now - lastShotTime > 300) {
				lastShotTime = now
				$.createGameObject(new $.PlayerProjectileGameObject(null, x, y))
			}
		}
	}
}
