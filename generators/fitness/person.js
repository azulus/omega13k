SHAPES.person = {}

SHAPES.person.shapes = 'tc'

SHAPES.person.fitness = (shapes) => {
  // circle above a triangle
  let [_t, _c] = shapes;
  try {
    let pts = _t.pts

    let topIdx = pts.reduce((l, n, idx) => (n < pts[l] && idx % 2 === 1 ? idx : l), 1);
    let leftIdx = topIdx - 1

    if (_c.y + _c.r > pts[topIdx]) return false
    if (_c.y + _c.r + 10 <  pts[topIdx]) return false
    if (Math.abs(_c.x - pts[leftIdx]) > 5) return false
    return true
  } catch (e) {
  	console.log(e)
    return false
  }
}
