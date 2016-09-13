$.assign($, {
  generateBossPath: (r) => {
    let paths = [],

      usableWidth = GameConst.WIDTH - (GameConst.SHIP_WIDTH * 2) - 5,
      usableHeight = GameConst.HEIGHT - (GameConst.SHIP_HEIGHT * 2) - 5,

      currentPoint = [
        GameConst.WIDTH + 20,
        usableHeight / 2
      ],

      nextPoint = [
        usableWidth - 50,
        usableHeight / 2
      ],

      dist = $.distance(currentPoint, nextPoint),

      travelTime = $.floor((r() * 2 + (Math.sqrt(dist) / 20)) * 100);

    let segment = [
      0, // Start time.
      travelTime,
      travelTime,
      1/travelTime,
      currentPoint,
      nextPoint
    ];

    paths.push(segment);

    // Fake pause time for now.
    let pauseTime = 99999999;

    paths.push([
      segment[PathSegmentIndex.END_TIME],
      segment[PathSegmentIndex.END_TIME] + pauseTime,
      pauseTime,
      1/pauseTime,
      segment[PathSegmentIndex.END_POINT],
      segment[PathSegmentIndex.END_POINT]
    ]);

    return [paths];
  },

  generateRandomPath: (r,startTime = 0) => {

    let isSymmetrical = r() < 0.5
    let numShips = $.randBetween(r, PathConst.MIN_SHIPS, PathConst.MAX_SHIPS)
    if (isSymmetrical) {
        numShips = $.floor(numShips / 2)
    }

    let usableWidth = GameConst.WIDTH - (GameConst.SHIP_WIDTH * numShips) - 5
    let usableHeight = GameConst.HEIGHT - (GameConst.SHIP_HEIGHT * numShips) - 5

    let numPathPoints = $.randBetween(r, 2, 5);
    let currentPoint = [
      GameConst.WIDTH + 20,
      $.randBetween(r, 5, usableHeight)
    ];
    let segments = [];

    for (let incr = 1; incr <= numPathPoints; incr++) {
      let shouldArc = r() < 0.5

      let nextPoint = [
        incr === numPathPoints ? (-2 * GameConst.SHIP_WIDTH) : $.randBetween(r, usableWidth / 2, usableWidth),
        $.randBetween(r, 5, usableHeight)
      ];

      let dist = $.distance(currentPoint, nextPoint);
      let travelTime = $.floor((r() * 2 + (Math.sqrt(dist) / 20)) * 100);

      let segment = [
        startTime,
        startTime + travelTime,
        travelTime,
        1/travelTime,
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
        pauseTime,
        1/pauseTime,
        segment[PathSegmentIndex.END_POINT],
        segment[PathSegmentIndex.END_POINT]
      ]);

      startTime += travelTime + pauseTime;
      currentPoint = nextPoint;
    }

    let paths = [];
    for (incr = 0; incr < numShips; incr++) {
      let offsetY = incr * GameConst.SHIP_HEIGHT;
      let nextPath = segments.map(segment => [
        segment[0],
        segment[1],
        segment[2],
        segment[3],
        $.offsetPoints(segment[4], 0, offsetY),
        $.offsetPoints(segment[5], 0, offsetY),
        segment[6] ? $.offsetPoints(segment[6], 0, offsetY) : null
      ]);
      paths.push([nextPath]);
      if (isSymmetrical) {
        paths.push([nextPath.map(segment => [
          segment[0],
          segment[1],
          segment[2],
          segment[3],
          $.invertPoints(segment[4], (GameConst.HEIGHT - GameConst.SHIP_HEIGHT)),
          $.invertPoints(segment[5], (GameConst.HEIGHT - GameConst.SHIP_HEIGHT)),
          segment[6] ? $.invertPoints(segment[6], (GameConst.HEIGHT - GameConst.SHIP_HEIGHT)) : null
        ])])
      }
    }

    return paths;
  },

  offsetProjectilePaths: (paths, x, y, time) => paths.map(path => $.setArrayVals(
    [].concat(path), 0, x, 1, y, 4, time + path[4])),

  generateProjectilePaths: (r, dir, x, y, offsetTime=0, minWaves=1, maxWaves=5,
   minProjectilesPerWave=1, maxProjectilesPerWave=5,
   minPaths=1, maxPaths=6, maxFireTime=2000, projectileSpeed=200) => {
     let numAngles = $.randBetween(r, minPaths, maxPaths),
      projectileSpeedMultiplier = projectileSpeed / 1000,
       minAngle = 10,
       maxAngle = numAngles <= 2 ? 90 : 90 / (numAngles - 1),
       angleBetween = $.randBetween(r, minAngle, maxAngle),
       numWaves = $.randBetween(r, minWaves, maxWaves),
       projectilesPerWave = $.randBetween(r, minProjectilesPerWave, maxProjectilesPerWave),
       totalProjectiles = numWaves * numAngles * projectilesPerWave,
       timeBetweenProjectiles = $.randBetween(r, 5, maxFireTime / totalProjectiles),
       midPoint = numAngles / 2 - 0.5,
       interleaveTimes = $.randBetween(r, 0, 4),
       interleaveAngleBetween = interleaveTimes === 0 ? 0 : angleBetween / (interleaveTimes),
       paths = [],
       i, j, k, offset, angle, xPerMs, yPerMs;
       for (i = 0; i < numWaves; i++) {
         for (j = 0; j < numAngles; j++) {
           offset = j - midPoint;
           angle =( (dir + (offset * angleBetween) + 360 + (interleaveAngleBetween * (i === 0 ? 0 : i % interleaveTimes))) % 360) * $.DEGREES_TO_RADIANS;
           xPerMs = Math.cos(angle) * projectileSpeedMultiplier;
           yPerMs = Math.sin(angle) * projectileSpeedMultiplier;

           if (!xPerMs && xPerMs !== 0)  {
             xPerMs = projectileSpeedMultiplier;
             yPerMs = 0;
             if (angle === ProjectilePathDirectionConst.LEFT) xPerMs *= -1;
           }

           for (k = 0; k < projectilesPerWave; k++) {
             paths.push([x, y, xPerMs, yPerMs, offsetTime]);
             offsetTime += timeBetweenProjectiles;
           }
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
    let [start, /* endTime */, /* duration */, percentPerMs, startPoint, endPoint, controlPoint] = segment;
    let percentage = (time - start) * percentPerMs;
    let pt;

    if (controlPoint) {
      pt = $.arcPoint(startPoint, controlPoint, endPoint, percentage)
    } else {
      pt = $.linePoint(startPoint, endPoint, percentage)
    }

    return pt;
  }
});
