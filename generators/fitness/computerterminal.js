SHAPES.computerterminal = {}

SHAPES.computerterminal.shapes = 'rrr'

SHAPES.computerterminal.fitness = (shapes) => {
  if (shapes.length < 3) return false
  try {
    // Bail if any rect is outside of the main shape
    let hasOutsideRect = null
    for (let i = 0; i < shapes.length; i++) {
      let compareToShape = shapes[i]
      let compareToShapePts = compareToShape.pts
      for (let j = 0; j < shapes.length; j++) {
        let testShapePts = shapes[j].pts
        if (testShapePts[0] > compareToShapePts[2] // right of compareTo
         || testShapePts[2] < compareToShapePts[0] // left of compareTo
         || testShapePts[1] > compareToShapePts[5] // above compareTo
         || testShapePts[5] < compareToShapePts[1] // below compareTo
        ) {
          hasOutsideRect = shapes[j]
        }
      }
    }
    if (hasOutsideRect) return false;

    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}
