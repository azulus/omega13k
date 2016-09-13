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

	loadEndGameDialog: () => {
		$.levelDialog = [$.prepareDialog([
			$.levelGameTime,
			"FORCIBLE DISMANTLING COMPLETE. PRESS 'SPACE' FOR ANOTHER FEEBLE ATTEMPT."
		])];
		$.levelDialog[0][3] += 999999;
	},

	loadWinDialog: () => {
		$.levelDialog = [$.prepareDialog([
			$.levelGameTime,
			"...GOODBYE. . PRESS 'SPACE' TO PLAY AGAIN"
		])];
		$.levelDialog[0][3] += 999999;
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
	}
});
