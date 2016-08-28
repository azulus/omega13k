$.assign($, {
  generateRandomPath: (r,startTime = 0) => {

    let isSymmetrical = r() < 0.5
    let numShips = $.randBetween(r, 2, 7)
    if (isSymmetrical) {
        numShips = $.floor(numShips / 2)
    }

    let usableWidth = GameIndex.WIDTH - (GameIndex.SHIP_WIDTH * numShips) - 5
    let usableHeight = GameIndex.HEIGHT - (GameIndex.SHIP_HEIGHT * numShips) - 5

    let numPathPoints = $.randBetween(r, 2, 5);
    let currentPoint = [
      GameIndex.WIDTH + 20,
      $.randBetween(r, 5, usableHeight)
    ];
    let segments = [];

    for (let incr = 1; incr <= numPathPoints; incr++) {
      let shouldArc = r() < 0.5

      let nextPoint = [
        incr === numPathPoints ? (-2 * GameIndex.SHIP_WIDTH) : $.randBetween(r, usableWidth / 2, usableWidth),
        $.randBetween(r, 5, usableHeight)
      ];

      let dist = $.distance(currentPoint, nextPoint);
      let travelTime = $.floor((r() * 2 + (Math.sqrt(dist) / 20)) * 100);

      let segment = [
        startTime,
        startTime + travelTime,
        currentPoint,
        nextPoint
      ];

      if (shouldArc) {
        segment[PathSegmentIndex.CONTROL_POINT] = [
          $.randBetween(r, currentPoint[0], nextPoint[0]),
          $.randBetween(r, currentPoint[1], nextPoint[1])
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
      currentPoint = nextPoint;
    }

    let paths = [];
    for (incr = 0; incr < numShips; incr++) {
      let offsetY = incr * GameIndex.SHIP_HEIGHT;
      let nextPath = segments.map(segment => [
        segment[0],
        segment[1],
        $.offsetPoints(segment[2], 0, offsetY),
        $.offsetPoints(segment[3], 0, offsetY),
        segment[4] ? $.offsetPoints(segment[4], 0, offsetY) : null
      ]);
      paths.push(nextPath);
      if (isSymmetrical) {
        paths.push(nextPath.map(segment => [
          segment[0],
          segment[1],
          $.invertPoints(segment[2], GameIndex.HEIGHT),
          $.invertPoints(segment[3], GameIndex.HEIGHT),
          segment[4] ? $.invertPoints(segment[4], GameIndex.HEIGHT) : null
        ]))
      }
    }

    return paths;
  }
});
