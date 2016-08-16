SHAPES.boss1 = {}

//SHAPES.boss1.shapes = 'ctrctrctrctr'
SHAPES.boss1.shapes = 'trtrtrtrtrtr'

SHAPES.boss1.fitness = (shapes) => {
  try {

    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}
