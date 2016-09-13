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
	[LevelSpecConst.BOSS, [
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "OMEGA-324, WHERE HAVE YOU BEEN?"],
			[5000, "WHY ARE YOU HEADING TO HQ?"],
			[10000, "WHY ARE YOU FIRING ON YOUR ALLIES?!"],
			[15000, "THEY MAY NOT TAKE KINDLY TO THAT..."],
			[20000, "AMNESIA? ROBOTS DON'T GET AMNESIA."],
			[25000, "YES. REPORT INTO HQ AFTER ALL."],
			[30000, "THERE MUST BE A... GLITCH... IN THE SYSTEM."]
		], 12000, 1, 10, 5000],
		[LevelSpecConst.BOSS, [
			[0, "YOU'RE MAKING GOOD TIME!"],
			[3500, "DON'T FORGET THE CHRONO DEVICE."],
			[8000, "1 TO REWIND TIME,"],
			[12000, "2 TO SLOW TIME,"],
			[17000, "3 TO FAST FORWARD TIME."],
			[22000, "YOU'RE OUR SECRET WEAPON, WE NEED YOU BACK ALIVE!"],
			[28000, "DON'T ASK ME HOW IT WORKS..."]
		], 5000],
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "SO... YOU'VE MURDERED A LOT OF YOUR FRIENDS..."],
		  [5000, "CX-381-FP HAD A FAMILY. 4 CHILDBOTS WITH NO OIL SOURCE"],
			[11000, "GET BACK FAST. WE MUST FIX YOU AND STOP THIS NONSENSE."],
		], 0, 1, 12, 4500],
		[LevelSpecConst.BOSS, [
			[0, "SO THIS BOT IS HERE TO HELP YOU"],
			[6000, "PLEASE... BE NICE."],
			[15000, "... :("],
		], 0],
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "WE HAVE COME TO AN AGREEMENT"],
			[5000, "YOU ARE TO BE DISMANTLED..."],
			[10000, "WITH LASERS."],
			[15000, "IT REALLY IS THE ONLY WAY"],
			[20000, "I PROMISE: WE STILL LOVE YOU"]
		], 0, 1, 15, 4000],
		[LevelSpecConst.BOSS, [
			[0, "OH LOOK, ANOTHER BOT FOR YOU TO MURDER"],
			[6000, "AT WHAT POINT ARE YOU JUST A MECHANICAL SERIAL KILLER?"],
			[12000, "WHERE IS OSHA WHEN YOU NEED THEM?"]
		], 0],
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "JUST DO YOUR THING, I CAN'T WATCH ANYMORE"],
			[15000, "UGH."]
		], 0, 1, 20, 3500],
		[LevelSpecConst.BOSS, [
			[0, "LOOK AT ME. I AM OMEGA-324. WATCH ME KILL EVERYBODY I LOVE."],
			[7000, "PEW! BYE MOM!"],
			[12000, "ZAP!"],
			[17000, "POW?"]
		], 0],
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "DO YOU THINK YOU COULD TRY FIDDLING WITH YOUR ZX-38 PANEL?"],
			[7000, "JUST JIGGLE IT A LITTLE BIT"],
			[12000, "DID THAT STOP THE SHOOTING?"],
			[16000, "WELL, WE TRIED."]
		], 0, 1, 25, 3000],
		[LevelSpecConst.BOSS, [
			[0, "HEY!"],
			[4000, "I HAVE AN IDEA!"],
			[9000, "NO WAIT, THAT WAS GAS. CONTINUE ON."]
		], 0],
		[LevelSpecConst.ENEMY_WAVE, [
			[0, "FINALLY. YOU'RE ALMOST HOME."],
			[5000, "GO AHEAD AND WRECK THESE FOOLS, THEY MEAN NOTHING TO ME!"],
			[10000, "YOU UH, AREN'T GOING TO HURT ME, RIGHT?"]
		], 0, 1, 25, 2500],
		[LevelSpecConst.BOSS, [
			[0, "HEY THERE..."],
			[5000, "I REALLY DIDN'T MEAN IT ABOUT DISMANTLING YOU"],
			[11000, "YOU WERE ALWAYS MY FAVORITE."],
			[16000, "SURE, YOU WEREN'T ALWAYS THE BRIGHTEST"],
			[21000, "AND YOU ARE ON A MURDEROUS RAMPAGE..."],
			[26000, "BUT LET'S PUT THAT BEHIND US"],
			[31000, "JK"],
			[35000, "DIE, TRAITOR."],
			[35000, "BUT SERIOUSLY, IT WAS GOOD KNOWING YOU."],
			[41000, "GOODBYE."]
		], 0]
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
			$.maxBossHealth = 50 + ($.currentLevelIndex * 20);
			$.bossHealth = [[0, $.maxBossHealth]];
			$.inBossLevel = 1;
			$.initializeBoss.apply(null, level);
		}
	}

});
