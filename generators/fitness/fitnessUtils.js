window.fitnessUtils = {

	highestPoint: (shape) => {
		let pts = shape.pts
		// triangle
		if (shape.pts.length === 6) {
			let highestIdx = pts.reduce((l, n, idx) => (n < pts[l] && idx % 2 === 1 ? idx : l), 1);
			return {
				x: pts[highestIdx-1],
				y: pts[highestIdx]
			}
		} else if (shape.pts.length === 8) {
			// rect
			return {
				x: pts[0] + (pts[2] - pts[0]) / 2, // center point
				y: pts[1]
			}
		} else {
			throw new Error('lowestPoint called on something other than a rect or triangle')
		}
	},

	lowestPoint: (shape) => {
		let pts = shape.pts
		// triangle
		if (shape.pts.length === 6) {
			let bottomIdx = pts.reduce((l, n, idx) => (n > pts[l] && idx % 2 === 1 ? idx : l), 1);
			return {
				x: pts[bottomIdx-1],
				y: pts[bottomIdx]
			}
		} else if (shape.pts.length === 8) {
			// rect
			return {
				x: pts[0] + (pts[2] - pts[0]) / 2, // center point
				y: pts[5]
			}
		} else {
			throw new Error('lowestPoint called on something other than a rect or triangle')
		}
	},

	findTrianglesAboveCircle: (circle, shapes) => {
		let aboveTriangles = []
		for (var i = 0; i < shapes.length; i++) {
			let shape = shapes[i]
			let lowestPoint = fitnessUtils.lowestPoint(shape)
			if (lowestPoint.y < circle.y - circle.r) {
				aboveTriangles.push(shape)
			}
		}
		if (!aboveTriangles.length) throw new Error('Could not find triangles above circle.');

		return aboveTriangles
	},

	findTrianglesBelowCircle: (circle, shapes) => {
		let below = []
		for (var i = 0; i < shapes.length; i++) {
			let shape = shapes[i]
			let highestPoint = fitnessUtils.highestPoint(shape)
			if (highestPoint.y > circle.y + circle.r) {
				below.push(shape)
			}
		}
		if (!below.length) throw new Error('Could not find triangles below circle.');

		return below
	},

	/**
	 * Returns false if the two lowest points of the polygon are not within a range of each other.
	 */
	bottomPointsAreWithin: (shape, val) => {

	},

	/**
	 * Returns false if the two highest points of the polygon are not within a range of each other.
	 */
	topPointsAreWithin: (shape, val) => {

	},
}