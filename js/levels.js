/**
 * Level Definition
 */
$.assign($, {
	levelCurrent : 0,
	levelStepCurrent: 0,

	levelSpec: () => {
		return [
			[
				[$.SplashLevel]
			],
			[
				[$.DialogLevel, 0],
				[$.DialogLevel, 1],
				/*
				[LevelSpecConst.WAVES, 8],
				[LevelSpecConst.	, 1],
				[LevelSpecConst.DIALOG, 2]
			],
			[
				[LevelSpecConst.DIALOG, 3],
				[LevelSpecConst.WAVES, 12],
				[LevelSpecConst.BOSS, 1]
				*/
			]
		];
	},

	/**
	 * Go to the next level
	 */
	levelNext: () => {
		let spec = $.levelSpec(),
			currSpec;

		$.levelStepCurrent++;

		if ($.levelStepCurrent >= spec[$.levelCurrent].length) {
			$.levelCurrent++;
			$.levelStepCurrent = 0;
		}

		currSpec = spec[$.levelCurrent][$.levelStepCurrent];
		currSpec[0][LevelSpecConst.ON_ENTER].apply(null, currSpec.slice(1));
	}
})

// Enter the first level on load
$.levelSpec()[0][0][0][LevelSpecConst.ON_ENTER]();
