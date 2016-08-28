$.assign($, {
  /**
   * Get a 2d canvas context
   */
  getContext: (cnv) => cnv.getContext('2d'),

  /**
   * Set the color for the context
   */
  setColor: (ctx, c) => ctx.strokeStyle = ctx.fillStyle = c,

  beginPath: (ctx) => ctx.beginPath(),
  closePath: (ctx) => ctx.closePath(),

  drawShape: (ctx, s) => s[ShapeIndex.RADIUS] ? $.drawCircle(ctx, s) : $.drawPolygon(ctx, s),

  drawCircle: (ctx, c) => {
    $.setColor(ctx, c[ShapeIndex.COLOR])
    $.beginPath(ctx)
    ctx.arc(
        c[ShapeIndex.POINTS][0],
        c[ShapeIndex.POINTS][1],
        c[ShapeIndex.RADIUS],
        0,
        2 * Math.PI,
        false
    );
    $.closePath(ctx)
    ctx.fill();
  },

  drawPolygon: (ctx, p) => {
    $.setColor(ctx, p[ShapeIndex.COLOR])
  	$.beginPath(ctx)
    let pts = p[ShapeIndex.POINTS]
    for (let i = 0; i < pts.length; i+=2) {
      if (i === 0) {
        ctx.moveTo(pts[i], pts[i+1])
      } else {
        ctx.lineTo(pts[i], pts[i+1])
      }
    }
    $.closePath(ctx);
    ctx.fill();
  },

  drawShapesToCanvas: (canvas, shapes) => {
    let ctx = $.getContext(canvas);
    shapes.forEach(rs => $.drawShape(ctx, rs))
  }
});
