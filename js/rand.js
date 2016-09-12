$.assign($, {
  _colorMap: {},

  /**
   * Get a random number generator for a seed
   */
  getRandomNumberGenerator: (s) => {
    return () => {
        const rnd = Math.sin(s++) * 10000
        return rnd - $.floor(rnd)
    }
  },

  /**
   * Get a random int between a and b
   */
  randBetween: (r, a, b) => $.floor($.randBetweenFloat(r, a, b)),

  /**
   * Get a random float between a and b
   */
  randBetweenFloat: (r, a, b) => r() * $.abs(a - b) + Math.min(a, b),

  /**
   * Get a random element from an array
   */
  getRandomFromArray: (r, arr) => arr[
    $.floor($.randBetween(r, 0, arr.length))
  ],

  /**
   * Get a random usable color
   */
  getRandomUsableColor: (r) => {
    let c = $.getRandomFromArray(r, $.USABLE_COLORS);
    return `#${c}${c}${c}`
  },

  getShaderColor: (rgb) => {
    let val = $._colorMap[rgb];
    if (!val) {
      val = rgb.substr(1).split('').map(val => parseInt(val,16) / 16)
      $._colorMap[rgb] = val;
    }
    return val;
  }
});
