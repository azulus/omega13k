$.assign($, {
	EnemyProjectileGameObject: function (seed = 1465, x, y) {
		let speed = 10

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
			[ObjectIndex.POSITION_X]: x,
			// Y Position
			[ObjectIndex.POSITION_Y]: y,

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				obj[ObjectIndex.POSITION_X] -= speed
				$.destroyIfOutsideGameRect(obj)
			}
		}
		return obj;
	}
})
