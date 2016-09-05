$.assign($, {
	EnemyProjectileGameObject: function (seed = 1465, path) {
		let lastPathTime = Date.now(),
		obj = {
			[ObjectIndex.OBJECT_TYPE]: ObjectTypeIndex.ENEMY_PROJECTILE,
			// The seed
			[ObjectIndex.SEED]: seed,
			// Used seed objects
			[ObjectIndex.SEED_SHAPE_STR]: 'c',
			// Width
			[ObjectIndex.WIDTH]: 120,
			// Height
			[ObjectIndex.HEIGHT]: 120,
			// X Position
			[ObjectIndex.POSITION_X]: path[0],
			// Y Position
			[ObjectIndex.POSITION_Y]: path[1],

			// Logic on player tick
			[ObjectIndex.TICK]: () => {
				let [x, y, xPerMs, yPerMs, startTime] = path;
				let now = Date.now();
				let elapsedTime = now - lastPathTime;

				obj[ObjectIndex.POSITION_X] += elapsedTime * xPerMs
				obj[ObjectIndex.POSITION_Y] += elapsedTime * yPerMs
				$.destroyProjectileIfOutsideGameRect(obj)

				lastPathTime = now;
			}
		}
		return obj;
	}
})
