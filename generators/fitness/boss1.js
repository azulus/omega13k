SHAPES.boss1 = {}

SHAPES.boss1.shapes = 'cttt'

SHAPES.boss1.fitness = (shapes) => {
  try {
	let circle = shapes[0];
	let triangles = shapes.slice(1)

  	let aboveTriangles = fitnessUtils.findTrianglesAboveCircle(circle, triangles)
  	let belowTriangles = fitnessUtils.findTrianglesBelowCircle(circle, triangles)

  	// if (!fitnessUtils.bottomPointsAreWithin(topTriangle, 10)) return false
  	// if (!fitnessUtils.topPointsAreWithin(bottomTriangle, 10)) return false

    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}
