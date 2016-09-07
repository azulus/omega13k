$.assign($, {
	dialogStrings: [
		'Attention all robot ships, begin your mission to destroy the Earth.',
		'Mothership to Robot 41734 - We are detecting a problem with your transponder. We\'re sending out a repair ship, but in the meantime friendlies may fire on you.',
		'Just hang in there until the repair ship arrives!',
		'We appear to have lost the repair ship. We\'re sending another one out right away.',
		'Please stop destroying our ships, those are expensive!'
	],

	getDialog: (index) => {
		return [
			Date.now(),
			$.dialogStrings[index]
		];
	},

	getLettersAtTime: (dialog, time) => {
		const idx = Math.floor(time / DialogConst.MS_PER_STEP, 10) * 3;
		return dialog[DialogIndex.TEXT].substring(0, idx);
	}
});
