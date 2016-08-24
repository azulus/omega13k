$.assign($, {
	EnemyGameObject: function (seed = 6480, x, y, seedObjects = 'm') {
		let speed = 5,
			tickMovement = speed,

		obj= {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: seedObjects,
			// Width
			[ObjectIndex.WIDTH]: 100,
			// Height
			[ObjectIndex.HEIGHT]: 100,
			// X Position
			[ObjectIndex.POSITION_X]: x,
			// Y Position
			[ObjectIndex.POSITION_Y]: y,

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				obj[ObjectIndex.DESTROYED] = true
			},

			// Logic on enemy tick
			[ObjectIndex.TICK]: () => {
				// Simple movement for now
				obj[ObjectIndex.POSITION_Y] += tickMovement
				if (obj[ObjectIndex.POSITION_Y] > 450 || obj[ObjectIndex.POSITION_Y] < 50) tickMovement = 0 - tickMovement;
			}
		}
		return obj
	}
})
