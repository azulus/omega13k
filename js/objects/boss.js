$.assign($, {
	BossGameObject: function () {

		let bossSpec = $.enemySpec[$.floor(Math.random()*$.enemySpec.length)],
			projectileSound = $.createLaserSound(Math.random),
			explosionSound = $.createExplosionSound(Math.random),

			life = 50,
			speed = 5,
			lastShotTime = 0,
			tickMovement = speed,

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
				let now = Date.now()
			}
		}
		return obj
	}
})
