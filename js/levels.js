$.assign($, {
	currentLevelIndex: -1,
	inBossLevel: 0,

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
		// [LevelSpecConst.ENEMY_WAVE, 1, 10, 5000],
		[LevelSpecConst.BOSS],
		[LevelSpecConst.ENEMY_WAVE, 1, 12, 4700],
		[LevelSpecConst.BOSS],
		[LevelSpecConst.ENEMY_WAVE, 1, 15, 4400],
		[LevelSpecConst.BOSS],
		[LevelSpecConst.ENEMY_WAVE, 1, 20, 4000],
		[LevelSpecConst.BOSS],
		[LevelSpecConst.ENEMY_WAVE, 1, 25, 3500],
		[LevelSpecConst.BOSS],
	],

	advanceLevel() {
		$.inBossLevel = 0;
		$.currentLevelIndex++;
		const level = $.levelSpec[$.currentLevelIndex];

		if (!level) {
			$.gameState = GameStateConst.WON;
			return;
		}

		$.resetLevel();

		const levelType = level.shift();
		if (levelType === LevelSpecConst.ENEMY_WAVE) {
			$.initializeLevel.apply(null, level);
		} else if (levelType === LevelSpecConst.BOSS) {
			$.maxBossHealth = ($.currentLevelIndex + 1) * ($.currentLevelIndex + 1)* 50;
			$.bossHealth = [[0, $.maxBossHealth]];
			$.inBossLevel = 1;
			$.initializeBoss.apply(null, level);
		}
	}

});
