$.assign($, {
	currentLevelIndex: -1,

	/*
		For normal levels:
		[
			Level Type,
			seed,
			numWaves,
			idealMsBetweenWaves,
		]

	*/
	levelSpec: [
		[LevelSpecConst.ENEMY_WAVE, 1, 10, 5000],
		[LevelSpecConst.ENEMY_WAVE, 1, 12, 4700],
		[LevelSpecConst.ENEMY_WAVE, 1, 15, 4400],
		[LevelSpecConst.ENEMY_WAVE, 1, 20, 4000],
		[LevelSpecConst.ENEMY_WAVE, 1, 25, 3500],
		[LevelSpecConst.ENEMY_WAVE, 1, 30, 3000],
	],

	advanceLevel() {
		$.currentLevelIndex++;
		const level = $.levelSpec[$.currentLevelIndex];

		// Reset level details
		$.levelGameTime = 0;
		$._firstEnemyProjectileIdx = 0;
		$._firstPlayerProjectileIdx = 0;
		$.enemyProjectiles = [];
		$.playerProjectiles = [];

		if (!level) {
			$.gameLost = 1
			return
		}

		const levelType = level.shift();
		if (levelType === LevelSpecConst.ENEMY_WAVE) {
			$.initializeLevel.apply(null, level);
		} else if (levelType === LevelSpecConst.BOSS) {
			$.initializeBoss.apply(null, level);
		}
	}

});
