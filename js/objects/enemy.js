$.assign($, {
	EnemyGameObject: function (config, path, projectileSound, explosionSound, projectileSeed, projectileDelay) {
		let speed = 5,
			lastShotTime = Date.now() + projectileDelay,
			tickMovement = speed,
			pathStartTime = Date.now(),
			totalPathTime = $.getTotalPathTime(path),

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
				if (now - lastShotTime > 1400) {
					lastShotTime = now
					$.playSound(projectileSound)

					let leftOrderedShapes = $.leftOrderedShapes(obj[ObjectIndex.GENERATED_SHAPES]);

					// sort, slice, and fire
					leftOrderedShapes
						// Just fire two projectiles for now.
						.slice(0, 2)
						.forEach((pts, idx) => {

							let projectilePaths = $.generateProjectilePaths(projectileSeed, ProjectilePathDirection.LEFT, pts[0] + obj[ObjectIndex.POSITION_X], pts[1] + obj[ObjectIndex.POSITION_Y]);
							for (var i = 0; i < projectilePaths.length; i++) {
								let projectile = new $.EnemyProjectileGameObject(
									null,
									projectilePaths[i]
								);
								$.createEnemyProjectile(projectile);
							}
						});
				}
			}
		}
		return obj;
	}
})
