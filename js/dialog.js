$.assign($, {
	charCodes: {
		'0': 31599,
	  '1': 9362,
	  '2': 29671,
	  '3': 31207,
	  '4': 18925,
	  '5': 31183,
	  '6': 31695,
	  '7': 18727,
	  '8': 31727,
	  '9': 18927,

	  'A': 23535,
	  'B': 15339,
	  'C': 25166,
	  'D': 15211,
	  'E': 29647,
	  'F': 5071,
	  'G': 31567,
	  'H': 23533,
	  'I': 29847,
	  'J': 11044,
	  'K': 23277,
	  'L': 29257,
	  'M': 23549,
	  'N': 24573,
	  'O': 31599,
	  'P': 4843,
	  'Q': 28523,
	  'R': 22511,
	  'S': 31183,
	  'T': 9367,
	  'U': 27501,
	  'V': 9581,
	  'W': 24557,
	  'X': 23213,
	  'Y': 9389,
	  'Z': 29351,
	  '.': 9216,
	  '-': 448,
	  ',': 5120,
	  '\'': 18,
		' ': 0,
		'?': 8359,
		'!': 8338,
		':': 1040,
		'(': 8778,
		')': 10530
	},

	initializeDialog: () => {
		$.levelSpec.forEach(level => {
			if (level[1].length > 0) {
				level[1] = level[1].map($.prepareDialog);
			}
		})
	},

	prepareDialog: (dialog) => {
		let timestamp = dialog[0],
			text = dialog[1];
		dialog[2] = timestamp + text.length * DialogConst.MS_PER_STEP; // end render time
		dialog[3] = dialog[2] + DialogConst.MS_REMAIN_TIME; // remain time
		console.log(dialog, text.length * (CharConst.PIXEL_WIDTH * 3 + CharConst.CHAR_PADDING));
		return dialog;
	},

	currentDialog: () => {
		let i, foundDialog = false, text, start, end, removeTimestamp;
		for (i = 0; !foundDialog && i < $.levelDialog.length; i++) {
			[start, text, end, removeTimestamp] = $.levelDialog[i];

			if (start <= $.levelGameTime && removeTimestamp >= $.levelGameTime) {
				foundDialog = true;
			}
		}

		if (foundDialog) {
			if (end <= $.levelGameTime) return text;
			let numChars = $.floor(($.levelGameTime - start) / DialogConst.MS_PER_STEP);
			return text.substr(0, numChars);
		}
	},

	dialogStrings: [
		'Attention all robot ships, begin your mission to destroy the Earth.',
		'Mothership to Robot 41734 - We are detecting a problem with your transponder. We\'re sending out a repair ship, but in the meantime friendlies may fire on you.',
		'Just hang in there until the repair ship arrives!',
		'We appear to have lost the repair ship. We\'re sending another one out right away.',
		'Please stop destroying our ships, those are expensive!'
	].map(s => s.toUpperCase()),

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
