$.assign($, {
	EnemyGameObject: function (seed = 6480, x, y, seedObjects = 'm') {
		let speed = 5,
			tickMovement = speed,

		obj= {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'm',
			// Width
			[ObjectIndex.WIDTH]: 100,
			// Height
			[ObjectIndex.HEIGHT]: 100,
			// X Position
			get [ObjectIndex.POSITION_X] () {
				return x
			},
			// Y Position
			get [ObjectIndex.POSITION_Y] () {
				return y
			},

			[ObjectIndex.PROJECTILE_COLLISION]: (projectile) => {
				obj[ObjectIndex.DESTROYED] = true
			},

			// Logic on enemy tick
			[ObjectIndex.TICK]: () => {
				// Simple movement for now
				y += tickMovement
				if (y > 450 || y < 50) tickMovement = 0 - tickMovement;
			}
		}
		return obj
	}
})
