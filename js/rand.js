$.assign($, {
  /**
   * Get a random number generator for a seed
   */
  getRandomNumberGenerator: (s) => () => {
      const rnd = Math.sin(s++) * 10000
      return rnd - $.floor(rnd)
  },

  /**
   * Get a random int between a and b
   */
  randBetween: (r, a, b) => $.floor(r() * $.abs(a - b) + Math.min(a, b)),

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

  getShaderColor: (rgb) => rgb.substr(1).split('').map(val => parseInt(val,16) / 16)
});
