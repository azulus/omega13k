$.assign($, {
	EnemyProjectileGameObject: function (seed = 1465, x, y) {
		let speed = 10,
			soundSeed = 102,
			sound = $.createLaserSound($.getRandomNumberGenerator(102));

		// Play sound when constructed.
		$.playSound(sound);

		let obj = {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY_PROJECTILE,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'c',
			// Width
			[ObjectIndex.WIDTH]: 20,
			// Height
			[ObjectIndex.HEIGHT]: 20,
			// X Position
			get [ObjectIndex.POSITION_X] () {
				return x
			},
			// Y Position
			get [ObjectIndex.POSITION_Y] () {
				return y
			},

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				x -= speed
				$.destroyIfOutsideGameRect(obj)
			}
		}
		return obj;
	}
})
