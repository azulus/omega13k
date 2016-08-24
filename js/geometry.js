$.assign($, {
  /**
   * Get a random coordinate in a range
   */
  getRandomCoordinate: (r, mx, my) => [$.floor(r() * mx), $.floor(r() * my)],

  /**
   * Get a random circle
   */
  getRandomCircle: (r, mx, my, minr, maxr) => {
    let rad = $.randBetween(r, minr, maxr),
      x = $.randBetween(r, rad, mx-rad),
      y = $.randBetween(r, rad, my-rad),
      col = $.getRandomUsableColor(r)
    return {r:rad, x, y, col}
  },

  getRandomRectangle: (r, mx, my, mins, maxs) => {
    let w = $.randBetween(r, mins, maxs),
      h = $.randBetween(r, mins, maxs),
      x = $.randBetween(r, 0, mx-w),
      y = $.randBetween(r, 0, my-h),
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
    let s = ''
    while (1) {
      s += $.getRandomFromArray(r,$.splitString('crit'))
      if (s.length >= 5 || (s.length >= 2 && r() < 0.5)) return s
    }
  },

  getRandomShapes: (r, mx, my, s = '') => {
    let shouldMirror = s.indexOf('m') !== -1;
    let shouldInvert = s.indexOf('v') !== -1;
    s = s.replace(/[mv]/g, '')
    let shapeString = s.length ? s : $.getRandomShapeString(r);
    let shapes = [];
    $.splitString(shapeString).forEach(is => {
      let shape;
      switch(is) {
        case 'c':
          shape = $.getRandomCircle(r, mx, my, 5, 30);
          break;
        case 'r':
          shape = $.getRandomRectangle(r, mx, my, 5, 30);
          break;
        case 'i':
          shape = $.getRandomIsocelesTriangle(r, mx, my, 5, 30);
          break;
        case 't':
          shape = $.getRandomTriangle(r, mx, my, 5, 30);
          break;
      }
      if (shouldInvert) {
        if (shape.r) {
          shape.x = mx - shape.x;
        } else {
          shape.pts = $.invertPoints(shape.pts, mx, 1);
        }
      }
      shapes.push(shape);
      if (shouldMirror) {
        if (shape.r) {
          shapes.push($.assign({}, shape, {y:my-shape.y}));
        } else {
          shapes.push($.assign({}, shape, {pts:$.invertPoints(shape.pts, my)}));
        }
      }
    });
    return shapes;
  },

  checkCollision: (firstOffset, firstShapes, secondOffset, secondShapes) => {
    // rectangle - rectangle = bounding boxes collide
    // rectangle - circle = bounding boxes collide AND
    // rectangle - triangle
    // circle - circle
    // circle - triangle
    // triangle - triangle
  },

  getBoundingBox: (shape) => {
    if (shape.r) {
      return [shape.x-shape.r, shape.y-shape.r, shape.r*2, shape.r*2];
    } else {
      let pts = shape.pts;
      var rect = [pts[0], pts[1], pts[0], pts[1]];
      pts.forEach((val, idx) => {
        let offset = idx % 2;
        if (val < rect[offset]) rect[offset] = val;
        if (val > rect[2 + offset]) rect[2 + offset] = val;
      });
      rect[2] -= rect[0];
      rect[3] -= rect[1];
      return rect;
    }
  }
});
