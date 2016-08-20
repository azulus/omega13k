$.assign($, {
  /**
   * Calculate the distance between 2 points
   */
  distance: (start, end) => Math.sqrt(
    $.pow(end[0] - start[0], 2) + $.pow(end[1] - start[1], 2)
  ),

  /**
   * Offsets an array of points by a given x and y
   */
  offsetPoints: (pts, x, y) => pts.map(
    (pt, idx) => pt + (idx % 2 === 0 ? x : y)
  ),

  /**
   * Inverts an array of points vertically
   */
  invertPoints: (pts, maxY) => pts.map(
    (pt,idx) => (idx % 2 === 0 ? pt : (maxY - pt))
  ),

  /**
   * Calculate a point along a line at a given percentage
   */
  linePoint: (start, end, percentage) => [
    (end[0] - start[0]) * percentage + start[0],
    (end[1] - start[1]) * percentage + start[1]
  ],

  /**
   * Calculate a point along a bezier curve at a given percentage
   */
  arcPoint: (start, control, end, percentage) => [
      $.pow(1 - percentage, 2) * start[0] + 2 * (1 - percentage) * percentage * control[0] + $.pow(percentage, 2) * end[0],
      $.pow(1 - percentage, 2) * start[1] + 2 * (1 - percentage) * percentage * control[1] + $.pow(percentage, 2) * end[1]
  ],

  /**
   * Calculate the slope between 2 points
   */
  calculateSlope: (start, end) => {
      let x = end[0] - start[0], y = end[1] - start[1]
      if (x === 0) return undefined;
      if (y === 0) return 0;
      return ((end[1] - start[1]) / (end[0] - start[0]))
  },
});
