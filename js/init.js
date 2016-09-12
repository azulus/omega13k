const _ = {};

const $ = {
  USABLE_COLORS: '456789abcdef',

  assign: Object.assign,
  abs: Math.abs,
  floor: Math.floor,
  pow: Math.pow,
  document: document,
  parseFloat: parseFloat,

  DEGREES_TO_RADIANS: Math.PI / 180,

  splitString: (s) => s.split(''),

  setArrayVals: (arr, ...vals) => {
    for (var i = 0; i < vals.length - 1; i+= 2) {
      arr[vals[i]] = vals[i + 1];
    }
    return arr;
  }
};
