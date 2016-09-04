$.assign($, {
	WaveLevel: {
		[LevelSpecConst.ON_ENTER]: (numWaves) => {
			let currWave = 0,
				generateWave = () => {
					currWave++

					let path = $.generateRandomPath(Math.random, 0),
						enemySpec = $.enemySpec[$.floor(Math.random()*$.enemySpec.length)],

						// Each wave has the same ship graphics, explosion sounds and projectile sounds.
						projectileSound = $.createLaserSound(Math.random),
						explosionSound = $.createExplosionSound(Math.random)

					for (var i = 0; i < path.length; i++) {
						let projectileDelay = i * 200;

						$.createGameObject(new $.EnemyGameObject(
							enemySpec,
							path[i],
							projectileSound,
							explosionSound,
							projectileDelay
						))
					}

					let pathTime = $.getTotalPathTime(path[0])
					if (currWave >= numWaves) setTimeout($.levelNext, pathTime);
					else setTimeout(generateWave, pathTime);
				}

			generateWave()
		}
	},
})
