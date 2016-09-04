$.assign($, {
	EnemyGameObject: function (config, path, projectileSound, explosionSound) {
		let speed = 5,
			lastShotTime = 0,
			tickMovement = speed,
			pathStartTime = Date.now(),
			totalPathTime = $.getTotalPathTime(path),

			// Fire patterns to use when firing from two points on the ship.
			twoGunFirePatterns = [
				// Simple pattern, one bullets per point in a straight line.
				[[-180], [-180]],
				// One bullets per point, at an angle.
				[[-140], [-220]],
				// Two bullets per point.
				[[-180, -140], [-180, -220]]
			],

		obj= {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY,
			// The seed
			[ObjectIndex.SEED]: config[EnemyConfigIndex.SEED],
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: config[EnemyConfigIndex.SEED_SHAPE_STR],
			// Width
			[ObjectIndex.WIDTH]: GameConst.SHIP_WIDTH,
			// Height
			[ObjectIndex.HEIGHT]: GameConst.SHIP_HEIGHT,
			// X Position
			[ObjectIndex.POSITION_X]: 0,
			// Y Position
			[ObjectIndex.POSITION_Y]: 0,

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				obj[ObjectIndex.DESTROYED] = true
				$.playSound(explosionSound)
			},

			// Logic on enemy tick
			[ObjectIndex.TICK]: () => {
				let now = Date.now(),

				// Update position based on path
				currentTime = (now - pathStartTime) % totalPathTime,
				pos = $.getPositionAtTime(path, currentTime);

				obj[ObjectIndex.POSITION_X] = $.floor(pos[0])
				obj[ObjectIndex.POSITION_Y] = $.floor(pos[1])

				if ((now - pathStartTime) >= totalPathTime) {
					obj[ObjectIndex.DESTROYED] = true
				}

				// Simple single projectile
				if (now - lastShotTime > 800) {
					lastShotTime = now
					$.playSound(projectileSound)

					// Get projectile points from shapes.
					let leftMostPoints = []

					// Get all leftmost points.
					obj[ObjectIndex.GENERATED_SHAPES].forEach(shape => {
						let pts = shape[ShapeIndex.POINTS]

						if (shape[ShapeIndex.RADIUS]) {
							leftMostPoints.push(pts)
						} else if (pts.length === 6) {
							let leftIdx = pts.reduce((l, n, idx) => (n < pts[l] && idx % 2 === 0 ? idx : l), 1);
							leftMostPoints.push([pts[leftIdx], pts[leftIdx + 1]])
						} else if (pts.length === 8) {
							leftMostPoints.push([pts[0], pts[1] + (pts[5] - pts[1]) / 2])
						}
					})

					// sort, slice, and fire
					leftMostPoints
						.sort((a, b) => {
							return a[0] - b[0]
						})
						// Just fire two projectiles for now.
						.slice(0, 2)
						.forEach((pts, idx) => {
							let firePattern = twoGunFirePatterns[$.floor(Math.random() * twoGunFirePatterns.length)]
							$.spawnEnemyProjectilesAtPoint(
								pts[0] + obj[ObjectIndex.POSITION_X],
								pts[1] + obj[ObjectIndex.POSITION_Y],
								firePattern[idx]
							);
						});
				}
			}
		}
		return obj;
	},
	spawnEnemyProjectilesAtPoint: (x, y, firePattern) => {
		for (var i = 0; i < firePattern.length; i++) {
			let projectile = new $.EnemyProjectileGameObject(
				null,
				x,
				y,
				firePattern[i]
			);
			$.createEnemyProjectile(projectile);
		}
	}
})
