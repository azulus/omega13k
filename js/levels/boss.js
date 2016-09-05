$.assign($, {
	BossLevel: {
		[LevelSpecConst.ON_ENTER]: (bossId) => {
			let projectileSeed = $.getRandomNumberGenerator(1403);
			$.createGameObject(new $.BossGameObject(projectileSeed))
		}
	},
})
