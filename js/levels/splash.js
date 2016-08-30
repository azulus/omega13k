$.assign($, {
	SplashLevel: {
		[LevelSpecConst.ON_ENTER]: () => {
			let splashKeyListener = e => {
				if (e.key == ' ') {
					$.startGame();
					$.document.body.className = 'g';
					removeEventListener('keydown', splashKeyListener);
					$.initKeyboard();
					$.levelNext();
				}
			};

			addEventListener('keydown', splashKeyListener);
		}
	}
})
