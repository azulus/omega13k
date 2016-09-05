$.assign($, {
	BossGameObject: function (projectileSeed) {

		let bossSpec = $.enemySpec[$.floor(Math.random()*$.enemySpec.length)],
			projectileSound = $.createLaserSound(Math.random),
			explosionSound = $.createExplosionSound(Math.random),

			life = 50,
			speed = 5,
			tickMovement = speed,

			projectileStartTime = Date.now(),
			projectilePaths = [],
			projectilePathsFired = [],

		obj= {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY,
			// The seed
			[ObjectIndex.SEED]: bossSpec[EnemyConfigIndex.SEED],
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: bossSpec[EnemyConfigIndex.SEED_SHAPE_STR],
			// Width
			[ObjectIndex.WIDTH]: GameConst.SHIP_WIDTH * 3,
			// Height
			[ObjectIndex.HEIGHT]: GameConst.SHIP_HEIGHT * 3,
			// X Position
			[ObjectIndex.POSITION_X]: 600,
			// Y Position
			[ObjectIndex.POSITION_Y]: 250,

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				life--;
				$.playSound(explosionSound)

				if (life <= 0) {
					obj[ObjectIndex.DESTROYED] = true
					$.levelNext()
				}
			},

			// Logic on enemy tick
			[ObjectIndex.TICK]: () => {
				let now = Date.now(),
					projectileIdx = projectilePaths.length;

				// Fire all projectiles that have started.
				while (projectileIdx--) {
					let [x, y, xPerMs, yPerMs, startTime] = projectilePaths[projectileIdx];
					if (now - projectileStartTime >= startTime) {
						let projectile = new $.EnemyProjectileGameObject(
							null,
							projectilePaths[projectileIdx]
						);
						$.createEnemyProjectile(projectile);
						projectilePathsFired.push(projectilePaths.splice(projectileIdx, 1));
					}
				}

				if (now - projectileStartTime > 3000) {
					let shapeCenter = $.getCenterOfShapes(obj[ObjectIndex.GENERATED_SHAPES]);

					if (projectilePathsFired.length) {
						projectilePaths = $.offsetProjectilePaths(projectilePathsFired, now - projectileStartTime);
						projectilePathsFired = [];
					} else {
						projectilePaths = $.generateProjectilePaths(
							projectileSeed,
							obj[ObjectIndex.POSITION_X] + shapeCenter[0],
							obj[ObjectIndex.POSITION_Y] + shapeCenter[1],
							0, 5, 10, 5, 10, 10, 20, 500
						)
					}
					projectileStartTime = now;
				}
			}
		}
		return obj
	}
})
