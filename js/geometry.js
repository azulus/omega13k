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
    return [col,rad,[x,y]];
  },

  getRandomRectangle: (r, mx, my, mins, maxs) => {
    let w = $.randBetween(r, mins, maxs),
      h = $.randBetween(r, mins, maxs),
      x = $.randBetween(r, 0, mx-w),
      y = $.randBetween(r, 0, my-h),
      col=$.getRandomUsableColor(r)
    return [col,,[x,y,x+w,y,x+w,y+h,x,y+h]]
  },

  getRandomIsocelesTriangle: (r, mx, my) => {
    let x1 = $.randBetween(r, 0, mx), y1 = $.randBetween(r, 0, my),
      x2 = r() < 0.5 ? $.randBetween(r, 0, x1) : $.randBetween(r, x1, mx),
      y3 = r() < 0.5 ? $.randBetween(r, 0, y1) : $.randBetween(r, y1, my),
      cv = r(),
      x3 = cv < 0.5 ? (x1 + x2) / 2 : x1,
      y2 = cv >= 0.5 ? (y1 + y3) / 2 : y1;
     return [$.getRandomUsableColor(r),,[x1, y1, x2, y2, x3, y3]]
  },

  getRandomTriangle: (r, mx, my) => [
    $.getRandomUsableColor(r),,[
       $.randBetween(r, 0, mx),
       $.randBetween(r, 0, my),
       $.randBetween(r, 0, mx),
       $.randBetween(r, 0, my),
       $.randBetween(r, 0, mx),
       $.randBetween(r, 0, my)
    ]
  ],

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
          console.log('INVERTING');
          shape[ShapeIndex.POINTS] = $.invertPoints(shape[ShapeIndex.POINTS], mx, 1);
      }
      shapes.push(shape);
      if (shouldMirror) {
        let newShape = $.setArrayVals(
            [].concat(shape),
            ShapeIndex.POINTS,
            $.invertPoints(shape[ShapeIndex.POINTS], my)
        );
        shapes.push(newShape);
      }
    });
    return shapes;
  },

  isRectangle: (shape) => {
    return shape[ShapeIndex.POINTS].length === 8
  },

  isTriangle: (shape) => {
    return shape[ShapeIndex.POINTS].length === 6
  },

  isCircle: (shape) => {
    return shape[ShapeIndex.POINTS].length === 2
  },

  getTriangleSign: (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3),

  checkCollision: (shapes, projectile, offsetX=0, offsetY=0) => {
    // check bounding boxes first
    for (let i = 0; i < shapes.length; i++) {
      let shape = shapes[i],
        pts = shape[ShapeIndex.POINTS];
      if (pts && (offsetX !== 0 || offsetY !== 0 )) pts = $.offsetPoints(pts, offsetX, offsetY);

      if ($.isRectangle(shape)) {
        let w = pts[2]-pts[0],
          h = pts[5]-pts[3],
          halfWidth = w/2,
          halfHeight = h/2,
          // calculate distance from the center of the rectangle to the center of the circle
          // along each axis
          xDist = $.abs(
            projectile[ProjectileIndex.POSITION_X] - (pts[0] + halfWidth)
          ),
          yDist = $.abs(
            projectile[ProjectileIndex.POSITION_Y] - (pts[1] + halfHeight)
          )

        // verify that the circle is both within range of the x and y along their
        // respective axis
        if (xDist > (halfWidth + projectile[ProjectileIndex.RADIUS])) continue;
        if (yDist > (halfHeight + projectile[ProjectileIndex.RADIUS])) continue;

        // exit early if close enough to the center along either axis
        if (xDist <= w/2) return true;
        if (yDist <= h/2) return true;

        // calculate the distance from center to center and
        let cornerDist = $.distance([xDist, yDist], [halfWidth, halfHeight]);
        if (cornerDist <= $.pow(projectile[ProjectileIndex.RADIUS],2)) return true

      } else if ($.isTriangle(shape)) {
        // vertex is inside circle
        let rSquared = $.pow(projectile[ProjectileIndex.RADIUS],2);
        for (let i = 0; i < pts.length; i++) {
          if ($.distance(
              [pts[i], pts[i+1]],
              [projectile[ProjectileIndex.POSITION_X], projectile[ProjectileIndex.POSITION_Y]]
            ) <= rSquared) {
            return true;
          }
        }

        // circle center is inside triangle
        let b1 = $.getTriangleSign(projectile[ProjectileIndex.POSITION_X], projectile[ProjectileIndex.POSITION_Y], pts[0], pts[1], pts[2], pts[3]),
          b2 = $.getTriangleSign(projectile[ProjectileIndex.POSITION_X], projectile[ProjectileIndex.POSITION_Y], pts[2], pts[3], pts[4], pts[5]),
          b3 = $.getTriangleSign(projectile[ProjectileIndex.POSITION_X], projectile[ProjectileIndex.POSITION_Y], pts[4], pts[5], pts[0], pts[1]);
        if ((b1 < 0 === b2 < 0) && (b2 < 0 === b3 < 0)) {
          return true;
        }

        // circle intersects line
        for (let idx = 0; idx < pts.length; idx+=2) {
          let cx = projectile[ProjectileIndex.POSITION_X] - pts[idx + 0];
          let cy = projectile[ProjectileIndex.POSITION_Y] - pts[idx + 1];
          let ex = pts[(idx + 2) % 6] - pts[idx + 0];
          let ey = pts[(idx + 3) % 6] - pts[idx + 1];

          let k = cx * ex + cy * ey;
          if (k > 0) {
            let distSquared = Math.sqrt($.pow(ex,2) + $.pow(ey,2));
            k /= distSquared;

            if (k < distSquared) {
              if (Math.sqrt($.pow(cx,2) + $.pow(cy,2) - $.pow(k,2)) <= projectile[ProjectileIndex.RADIUS]) {
                return true;
              }
            }
          }
        }

      } else if ($.isCircle(shape)) {
        // circle to circle
        let dist = $.distance(
          [pts[0] + offsetX, pts[1] + offsetY],
          [projectile[ProjectileIndex.POSITION_X], projectile[ProjectileIndex.POSITION_Y]]
        );
        if (dist <= $.pow(shape[ShapeIndex.RADIUS]+ projectile[ProjectileIndex.RADIUS],2)) return true
      }
    }

    return false;
  },

  getBoundingBox: (shape) => {
    if (!shape[ShapeIndex.BOUNDING_BOX]) {
        let box, pts = shape.pts;
        if (shape[ShapeIndex.RADIUS]) {
          box = [
              pts[0]-shape[ShapeIndex.RADIUS],
              pts[1]-shape[ShapeIndex.RADIUS],
              shape[ShapeIndex.RADIUS]*2,
              shape[ShapeIndex.RADIUS]*2
          ];
        } else {
          var rect = [pts[0], pts[1], pts[0], pts[1]];
          pts.forEach((val, idx) => {
            let offset = idx % 2;
            if (val < rect[offset]) rect[offset] = val;
            if (val > rect[2 + offset]) rect[2 + offset] = val;
          });
          rect[2] -= rect[0];
          rect[3] -= rect[1];
          box = rect;
        }
        shape[ShapeIndex.BOUNDING_BOX] = box;
    }
    return shape[ShapeIndex.BOUNDING_BOX];
  },

  checkBoundingBoxesCollide: (box1, box2, offset1 = [0,0], offset2 = [0,0]) => {
    let x1 = offset1[0] + box1[BoundingBoxIndex.POSITION_X],
      y1 = offset1[1] + box1[BoundingBoxIndex.POSITION_Y],
      w1 = box1[BoundingBoxIndex.WIDTH],
      h1 = box1[BoundingBoxIndex.HEIGHT],
      x2 = offset2[0] + box2[BoundingBoxIndex.POSITION_X],
      y2 = offset2[1] + box2[BoundingBoxIndex.POSITION_Y],
      w2 = box2[BoundingBoxIndex.WIDTH],
      h2 = box2[BoundingBoxIndex.HEIGHT];

    return !(x1 > x2 + w2 ||
        x2 > x1 + w1 ||
        y1 > y2 + h2 ||
        y2 > y1 + h1);
  }
});
