$.assign($, {
	PlayerProjectileGameObject: function (seed = 1465, x, y) {
		let speed = 6

		// Adjust bullet position for player.
		// TODO: This should probably be passed in from the player.
		x += -40
		y += -85

		let obj = {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.PLAYER_PROJECTILE,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'c',
			// Width
			[ObjectIndex.WIDTH]: 120,
			// Height
			[ObjectIndex.HEIGHT]: 120,
			// X Position
			[ObjectIndex.POSITION_X]: x,
			// Y Position
			[ObjectIndex.POSITION_Y]: y,

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				obj[ObjectIndex.POSITION_X] += speed
				$.destroyProjectileIfOutsideGameRect(obj)
			}
		}
		return obj;
	}
})
