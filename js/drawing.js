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

  drawCircle: (ctx, c) => {
    $.setColor(ctx, c.col)
    $.beginPath(ctx)
    ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, false);
    $.closePath(ctx)
    ctx.fill();
  },

  drawPolygon: (ctx, p) => {
    $.setColor(ctx, p.col)
  	$.beginPath(ctx)
    let pts = p.pts
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
});
