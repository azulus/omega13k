const _ = {};

const $ = {
  USABLE_COLORS: '456789abcdef',

  assign: Object.assign,
  abs: Math.abs,
  floor: Math.floor,
  round: Math.round,
  pow: Math.pow,
  document: document,
  parseFloat: parseFloat,

  radians: degrees => degrees * Math.PI / 180,

  splitString: (s) => s.split(''),

  setArrayVals: (arr, ...vals) => {
    for (var i = 0; i < vals.length - 1; i+= 2) {
      arr[vals[i]] = vals[i + 1];
    }
    return arr;
  }
};
