$.assign($, {
	currentLevelIndex: -1,
	inBossLevel: 0,
	inEmptyLevel: 0,

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
		//Entity Type               Dialog	Delay	seed	#waves  waveTiming
		[LevelSpecConst.ENEMY_WAVE,	[
			[0, "OMEGA-324, WHERE HAVE YOU BEEN?"],
			[5000, "AND WHY ARE YOU HEADING BACK TO HQ?"]
		],							2000,	1,		10,		5000],
		[LevelSpecConst.BOSS, 		[],		0],
		[LevelSpecConst.ENEMY_WAVE, [],		0,		1,		12,		4500],
		[LevelSpecConst.BOSS, 		[],		0],
		[LevelSpecConst.ENEMY_WAVE, [],		0,		1,		15,		4000],
		[LevelSpecConst.BOSS, 		[],		0],
		[LevelSpecConst.ENEMY_WAVE, [],		0,		1,		20,		3500],
		[LevelSpecConst.BOSS, 		[],		0],
		[LevelSpecConst.ENEMY_WAVE, [],		0,		1,		25,		3000],
		[LevelSpecConst.BOSS, 		[],		0],
		[LevelSpecConst.ENEMY_WAVE, [],		0,		1,		25,		2500],
		[LevelSpecConst.BOSS, 		[],		0]
	],

	advanceLevel() {
		$.inBossLevel = $.inEmptyLevel = 0;
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
		} else if (levelType === LevelSpecConst.EMPTY) {
			$.inEmptyLevel = 1;
			$.initializeEmptyLevel.apply(null, level);
		}
	}

});
