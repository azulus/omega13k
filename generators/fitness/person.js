SHAPES.person = {}

SHAPES.person.shapes = [_.TRIANGLE, _.CIRCLE]

SHAPES.person.fitness = (shapes) => {
  if (shapes.length !== 2) return false
  // circle above a triangle
  var _c, _t
  try {
    shapes.forEach(shape => {
      if (shape.r) {
        _c = shape
      } else if (shape.pts.length === 6) {
        _t = shape
      }
    })
    if (!_c || !_t) return false
    
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
