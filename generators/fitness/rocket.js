SHAPES.rocket = {}

SHAPES.rocket.shapes = 'tr'

SHAPES.rocket.fitness = (shapes) => {
    if (shapes.length !== 2) return false
  // Rocket like thing
  var _r, _t
  try {
    shapes.forEach(shape => {
      if (shape.pts.length === 6) {
        _t = shape
      } else if (shape.pts.length === 8) {
        _r = shape
      }
    })
    if (!_r || !_t) {
      return false
    }

    // The rect should be 2x as tall as the triangle.
    let tPts = _t.pts
    let _tTopIdx = tPts.reduce((l, n, idx) => (n < tPts[l] && idx % 2 === 1 ? idx : l), 1);
    let _tBottomIdx = tPts.reduce((l, n, idx) => (n > tPts[l] && idx % 2 === 1 ? idx : l), 1);
    if (tPts[_tBottomIdx] - tPts[_tTopIdx] > _r.pts[5] - _r.pts[1]) {
      return false
    }

    // The top triangle point is below the rect Y
    if (tPts[_tTopIdx] < _r.pts[1]) {
      return false;
    }

    // The top triangle point is above the rect bottom
    if (tPts[_tTopIdx] > _r.pts[5]) {
      return false;
    }

    // The bottom point is below the rect
    if (tPts[_tBottomIdx] < _r.pts[5]) {
      return false;
    }

    // The X value of the top point is inside of the rocket body
    if (tPts[_tTopIdx - 1] < _r.pts[0] || tPts[_tTopIdx - 1] > _r.pts[2]) {
      return false;
    }

    // Left and Rightmost points should be outside the body.
    let _tLeftIdx = tPts.reduce((l, n, idx) => (n < tPts[l] && idx % 2 === 0 ? idx : l), 1);
    let _tRightIdx = tPts.reduce((l, n, idx) => (n > tPts[l] && idx % 2 === 0 ? idx : l), 1);
    if (tPts[_tLeftIdx] > _r.pts[0] || tPts[_tRightIdx] < _r.pts[2]) {
      return false;
    }

    // The top point is near the mid point of the body
    if (Math.abs(tPts[_tTopIdx - 1] - (_r.pts[0] + (_r.pts[2] - _r.pts[2]) / 2)) > 10) {
      return false;
    }

    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}
