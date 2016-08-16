SHAPES.ships = {}

SHAPES.ships.shapes = ''

SHAPES.ships.fitness = (shapes) => {
  try {
    if (shapes.length < 2) return false

    // Check that there are two triangles
    let triangles = shapes.filter(shape => {
      return shape.pts && shape.pts.length === 6
    })

    if(triangles && triangles.length < 2) {
      return false
    }

    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}
