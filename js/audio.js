$.assign($, {
  to4DP: (value) => {
    if ($.abs(value) < 0.0001) return;
    var string = '' + value;
    var split = string.split(/\./);

    if (split.length == 1) return string;
    var out = split[0] + '.' + split[1].substr(0, 4);
    while (out.match(/0$/)) out = out.substr(0, out.length - 1);

    return $.parseFloat(out);
  },

  getBaseSound: () => $.setArrayVals(
    Array(24).fill(0),
    AudioIndex.MASTER_VOLUME, 0.5,
    AudioIndex.START_FREQUENCY, 0.3,
    AudioIndex.SUSTAIN_TIME, 0.3,
    AudioIndex.DECAY_TIME, 0.4,
    AudioIndex.LP_FILTER_CUTOFF, 1.0
  ),

  createRewindSound: (r) => {
    return $.formatSound($.setArrayVals(
      $.getBaseSound(),
      AudioIndex.WAVE_TYPE, 3,
      AudioIndex.ATTACK_TIME, $.randBetween(r, 10, 20) / 100,
      AudioIndex.SUSTAIN_TIME, $.randBetween(r, 2, 14) / 100,
      AudioIndex.DECAY_TIME, 0,
      AudioIndex.SLIDE, $.randBetween(r, 74, 94) / 100,
      AudioIndex.LP_FILTER_CUTOFF, $.randBetween(r, 0, 100) / 100,
      AudioIndex.MASTER_VOLUME, 0.79
    ))


// 3,0.19,0.1199,,,0.87,,0.74,,,,-1,,,-1,,-1,-1,0.6,0.08,,,-1,0.79
    // [0,1,0.5,0,0.4,0.3,0,0.79,0,0,0,0,0,0,0,0,0,0,0.88,0,0,0,0,0.5]
    // attack time 0.1334 -> 0.2
    //
    // 3,0.2,0.14,,,0.87,,0.74,-1,,,-1,,,-1,,-1,-1,0.91,0.74,,,-1,0.79
    // 3,0.2,0.14,,,0.87,,0.94,-1,,,-1,,,-1,,-1,-1,0.91,0.74,,,-1,0.79
    // 0, 1.52, 1.3, 0, 0, 0.3, 0, 0.92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.49, 0, 0, 0, 0, 0.5
    //
    // 3,0.0599,0.1199,,,0.87,,0.94,-1,,,-1,,,-1,,-1,-1,0.6,0.08,,,-1,0.79
    // 3,0.19,0.1199,,,0.87,,0.94,,,,-1,,,-1,,-1,-1,0.6,0.08,,,-1,0.79
  },

  createBlipSound: (r) => {
    let waveType = $.floor(r() * 2);

    return $.formatSound($.setArrayVals(
      $.getBaseSound(),
      AudioIndex.WAVE_TYPE, waveType,
      AudioIndex.SQUARE_DUTY, waveType === 0 ? (r() * 0.6) : 0.3,
      AudioIndex.START_FREQUENCY, 0.2 + r() * 0.4,
      AudioIndex.SUSTAIN_TIME, 0.1 + r() * 0.1,
      AudioIndex.DECAY_TIME, r() * 0.2,
      AudioIndex.HP_FILTER_CUTOFF, 0.1
    ));
  },

  createExplosionSound: (r) => {
    let sound = $.getBaseSound();

    sound[AudioIndex.WAVE_TYPE] = 3;

			if(r() < 0.5)
			{
				sound[AudioIndex.START_FREQUENCY] = 0.1 + r() * 0.4;
				sound[AudioIndex.SLIDE] = -0.1 + r() * 0.4;
			}
			else
			{
				sound[AudioIndex.START_FREQUENCY] = 0.2 + r() * 0.7;
				sound[AudioIndex.SLIDE] = -0.2 - r() * 0.2;
			}

			sound[AudioIndex.START_FREQUENCY] *= sound[AudioIndex.START_FREQUENCY];

			if(r() < 0.2) sound[AudioIndex.SLIDE] = 0.0;
			if(r() < 0.33) sound[AudioIndex.REPEAT_SPEED] = 0.3 + r() * 0.5;

			sound[AudioIndex.SUSTAIN_TIME] = 0.1 + r() * 0.3;
			sound[AudioIndex.DECAY_TIME] = r() * 0.5;
			sound[AudioIndex.SUSTAIN_PUNCH] = 0.2 + r() * 0.6;

			if(r() < 0.5)
			{
				sound[AudioIndex.PHASER_OFFSET] = -0.3 + r() * 0.9;
				sound[AudioIndex.PHASER_SWEEP] = -r() * 0.3;
			}

			if(r() < 0.33)
			{
				sound[AudioIndex.CHANGE_SPEED] = 0.6 + r() * 0.3;
				sound[AudioIndex.CHANGE_AMOUNT] = 0.8 - r() * 1.6;
			}

      return $.formatSound(sound);
  },

  createLaserSound: (r) => {
    let sound = $.getBaseSound();

    sound[AudioIndex.WAVE_TYPE] = $.floor(r() * 3);
		if (sound[AudioIndex.WAVE_TYPE] === 2 && r() < 0.5) sound[AudioIndex.WAVE_TYPE] = $.floor(r() * 2);

		sound[AudioIndex.START_FREQUENCY] = 0.5 + r() * 0.5;
		sound[AudioIndex.MIN_FREQUENCY] = sound[AudioIndex.START_FREQUENCY] - 0.2 - r() * 0.6;
		if(sound[AudioIndex.MIN_FREQUENCY] < 0.2) sound[AudioIndex.MIN_FREQUENCY] = 0.2;

		sound[AudioIndex.SLIDE] = -0.15 - r() * 0.2;

		if(r() < 0.33)
		{
			sound[AudioIndex.START_FREQUENCY] = 0.3 + r() * 0.6;
			sound[AudioIndex.MIN_FREQUENCY] = r() * 0.1;
			sound[AudioIndex.SLIDE] = -0.35 - r() * 0.3;
		}

		if(r() < 0.5)
		{
			sound[AudioIndex.SQUARE_DUTY] = r() * 0.5;
			sound[AudioIndex.DUTY_SWEEP] = r() * 0.2;
		}
		else
		{
			sound[AudioIndex.SQUARE_DUTY] = 0.4 + r() * 0.5;
			sound[AudioIndex.DUTY_SWEEP] =- r() * 0.7;
		}

		sound[AudioIndex.SUSTAIN_TIME] = 0.1 + r() * 0.2;
		sound[AudioIndex.DECAY_TIME] = r() * 0.4;
		if(r() < 0.5) sound[AudioIndex.SUSTAIN_PUNCH] = r() * 0.3;

		if(r() < 0.33)
		{
			sound[AudioIndex.PHASER_OFFSET] = r() * 0.2;
			sound[AudioIndex.PHASER_SWEEP] = -r() * 0.2;
		}

		if(r() < 0.5) sound[AudioIndex.HP_FILTER_CUTOFF] = r() * 0.3;

    return $.formatSound(sound);
  },

  formatSound: (sound) => sound.map((el, idx) => idx === 0 ? el : $.to4DP(el)),

  playSound: (sound) => {
    var player = new Audio();
    player.src = jsfxr(sound);
    player.play();
  }
});
