$.assign($, {
  generateRandomPath: (r, startTime = 0) => {
    let screenWidth = 500, screenHeight = 500

    let isSymmetrical = r() < 0.5
    let numShips = $.randBetween(r, 2, 7)
    if (isSymmetrical) {
        numShips = $.floor(numShips / 2)
    }

    let shipHeight = 50, shipWidth = 50;
    let usableWidth = screenWidth - (shipWidth * numShips) - 5
    let usableHeight = screenHeight - (shipHeight * numShips) - 5

    if (isSymmetrical) {
        numShips *= 2;
    }

    let numPathPoints = $.randBetween(r, 2, 5);
    let currentX = screenWidth + 20;
    let currentY = $.randBetween(r, 5, usableHeight);
    let segments = [];

    for (let incr = 1; incr <= numPathPoints; incr++) {
      let shouldArc = r() < 0.5

      let nextX = incr === numPathPoints ? (-2 * shipWidth) : $.randBetween(r, usableWidth / 2, usableWidth)
      let nextY = $.randBetween(r, 5, usableHeight);

      let dist = $.distance([currentX, currentY], [nextX, nextY]);
      let travelTime = $.floor((r() * 2 + (Math.sqrt(dist) / 100)) * 100);

      let segment = [
        startTime,
        startTime + travelTime,
        [currentX, currentY],
        [nextX, nextY]
      ];

      if (shouldArc) {
        segment[PathSegmentIndex.CONTROL_POINT] = [
          $.randBetween(r, currentX, nextX),
          $.randBetween(r, currentY, nextY)
        ];
      }
      segments.push(segment);

      let pauseTime = $.randBetween(r, 500, 3000);
      segments.push([
        segment[PathSegmentIndex.END_TIME],
        segment[PathSegmentIndex.END_TIME] + pauseTime,
        segment[PathSegmentIndex.END_POINT],
        segment[PathSegmentIndex.END_POINT]
      ]);

      startTime += travelTime + pauseTime;
    }

    return [
      isSymmetrical,
      numShips,
      segments
    ];
  }
});
