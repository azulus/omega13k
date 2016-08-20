$.assign($, {
  /**
   * Get a random coordinate in a range
   */
  getRandomCoordinate: (r, mx, my) => [$.floor(r() * mx), $.floor(r() * my)],

  /**
   * Get a random circle
   */
  getRandomCircle: (r, mx, my, minr, maxr) => {
    rad = $.randBetween(r, minr, maxr)
    x = $.randBetween(r, rad, mx-rad)
    y = $.randBetween(r, rad, my-rad)
    col = $.getRandomUsableColor(r)
    return {r:rad, x, y, col}
  },

  getRandomRectangle: (r, mx, my, mins, maxs) => {
    w = $.randBetween(r, mins, maxs)
    h = $.randBetween(r, mins, maxs)
    x = $.randBetween(r, 0, mx-w)
    y = $.randBetween(r, 0, my-h)
    col=$.getRandomUsableColor(r)
    return {pts:[x,y,x+w,y,x+w,y+h,x,y+h],col}
  },

  getRandomIsocelesTriangle: (r, mx, my) => {
    let x1 = $.randBetween(r, 0, mx), y1 = $.randBetween(r, 0, my),
      x2 = r() < 0.5 ? $.randBetween(r, 0, x1) : $.randBetween(r, x1, mx),
      y3 = r() < 0.5 ? $.randBetween(r, 0, y1) : $.randBetween(r, y1, my),
      cv = r(),
      x3 = cv < 0.5 ? (x1 + x2) / 2 : x1,
      y2 = cv >= 0.5 ? (y1 + y3) / 2 : y1
    return {pts: [x1, y1, x2, y2, x3, y3], col: $.getRandomUsableColor(r)}
  },

  getRandomTriangle: (r, mx, my) => ({pts: [
     $.randBetween(r, 0, mx),
     $.randBetween(r, 0, my),
     $.randBetween(r, 0, mx),
     $.randBetween(r, 0, my),
     $.randBetween(r, 0, mx),
     $.randBetween(r, 0, my)
  ], col: $.getRandomUsableColor(r)}),

  getRandomShapeString: (r) => {
    s = ''
    while (1) {
      s += $.getRandomFromArray(r,$.splitString('crit'))
      if (s.length >= 5 || (s.length >= 2 && r() < 0.5)) return s
    }
  },

  getRandomShapes: (r, mx, my, s) => $.splitString(s || $.getRandomShapeString(r)).map(is => {
    switch(is) {
      case 'c': return $.getRandomCircle(r, mx, my, 5, 30)
      case 'r': return $.getRandomRectangle(r, mx, my, 5, 30)
      case 'i': return $.getRandomIsocelesTriangle(r, mx, my, 5, 30)
      case 't': return $.getRandomRectangle(r, mx, my, 5, 30)
    }
  })
});
