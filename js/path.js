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
      paths.push([nextPath]);
      if (isSymmetrical) {
        paths.push([nextPath.map(segment => [
          segment[0],
          segment[1],
          $.invertPoints(segment[2], GameIndex.HEIGHT),
          $.invertPoints(segment[3], GameIndex.HEIGHT),
          segment[4] ? $.invertPoints(segment[4], GameIndex.HEIGHT) : null
        ])])
      }
    }

    return paths;
  },

  getTotalPathTime: (path) => {
    let segments = path[PathIndex.SEGMENTS],
      minTime = segments[0][PathSegmentIndex.START_TIME],
      maxTime = segments[segments.length - 1][PathSegmentIndex.END_TIME];
    return maxTime - minTime;
  },

  getPositionAtTime: (path, time) => {
    let startIdx = path[PathIndex.LAST_KNOWN_SEGMENT] || 0,
      segment,
      len = path[PathIndex.SEGMENTS].length,
      idx;

    for (let i = 0; i < len; i++) {
      idx = (startIdx + i) % len;
      segment = path[PathIndex.SEGMENTS][idx];
      if (segment[PathSegmentIndex.END_TIME] >= time &&
        segment[PathSegmentIndex.START_TIME] <= time) {
        break;
      }
    }

    path[PathIndex.LAST_KNOWN_SEGMENT] = idx;
    let [start, endTime, startPoint, endPoint, controlPoint] = segment;
    let deltaT = endTime - start;
    let percentage = (time - start) / deltaT;
    let pt;

    if (controlPoint) {
      pt = $.arcPoint(startPoint, controlPoint, endPoint, percentage)
    } else {
      pt = $.linePoint(startPoint, endPoint, percentage)
    }

    return pt;
  }
});
