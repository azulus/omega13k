$.assign($, {
	BossLevel: {
		[LevelSpecConst.ON_ENTER]: (bossId) => {
			$.createGameObject(new $.BossGameObject())
		}
	},
})
