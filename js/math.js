$.assign($, {
  /**
   * Calculate the distance between 2 points (as a square, don't sqrt)
   */
  distance: (start, end) => $.pow(end[0] - start[0], 2) + $.pow(end[1] - start[1], 2),

  clamp: (val, min, max) => {
    if (val < min) return min;
    if (val > max) return max;
    return val
  },

  /**
   * Offsets an array of points by a given x and y
   */
  offsetPoints: (pts, x, y) => pts.map(
    (pt, idx) => pt + (idx % 2 === 0 ? x : y)
  ),

  /**
   * Inverts an array of points vertically
   */
  invertPoints: (pts, max, isX) => pts.map(
    (pt,idx) => (idx % 2 === (isX ? 1 : 0) ? pt : (max - pt))
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
});
