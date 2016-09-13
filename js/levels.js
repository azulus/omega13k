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
		[LevelSpecConst.ENEMY_WAVE, 1, 10, 5000],
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

	// Temporary boss health variable.
	// May consider allowing for rewinding this.
	maxBossHealth: 0,
	bossHealth: 0,

	advanceLevel() {
		$.inBossLevel = 0;
		$.currentLevelIndex++;
		const level = $.levelSpec[$.currentLevelIndex];

		if (!level) {
			$.gameWon = 1
			return
		}

		$.resetLevel();

		const levelType = level.shift();
		if (levelType === LevelSpecConst.ENEMY_WAVE) {
			$.initializeLevel.apply(null, level);
		} else if (levelType === LevelSpecConst.BOSS) {
			$.maxBossHealth = $.bossHealth = ($.currentLevelIndex + 1) * ($.currentLevelIndex + 1)* 50;
			$.inBossLevel = 1;
			$.initializeBoss.apply(null, level);
		}
	}

});
