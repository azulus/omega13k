// circle: {x, y, r}
// rectangle: {pts:[x,y,x+w,y,x+w,y+h,x,y+h],col}
// triangle: {x1, y1, x2, y2, x3, y3}

_ = {
  c: '0123456789abcdef',
  
  CIRCLE: 1,
  TRIANGLE: 2,
  ITRIANGLE: 3,
  RECTANGLE: 4
}

$ = {
  f: Math.floor,
  r: Math.round,
  d: document,
  
  gid: (id) => $.d.getElementById(id),
  ce: (type) => $.d.createElement(type),
  ac: (p, c) => p.appendChild(c) && p,
  rc: (p, c) => p.removeChild(c) && p,
  rem: (c) => $.rc(c.parentNode, c) && c,
  write: (el, txt = '') => {el.innerHTML = txt; return el},
  gc: (cnv) => cnv.getContext('2d'),
  btwn: (r, min, max) => $.f(r() * (max-min) + min),
  
  gen: (s) => {
    return () => {
      const rnd = Math.sin(s++) * 10000
      return rnd - $.f(rnd)
    }
  },
  
  rarr: (r, arr) => arr[$.f($.btwn(r, 0, arr.length))],
  
  rcol: (r) => {c = $.rarr(r, _.c);return `#${c}${c}${c}`},
  col: (ctx, c) => ctx.fillStyle = c,
  bp: (ctx) => ctx.beginPath(),
  cp: (ctx) => {ctx.closePath();ctx.fill()},

  dc: (ctx, c) => {
    $.col(ctx, c.col)
    $.bp(ctx)
    ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, false);
    ctx.fill()
  },
  dp: (ctx, p) => {
    $.col(ctx, p.col)
  	$.bp(ctx)
    pts = p.pts
    for (let i = 0; i < pts.length; i+=2) {
    	ctx[(i === 0 ? 'moveTo' : 'lineTo')](pts[i], pts[i+1])
    }
    $.cp(ctx);
  },
  /**
   * Circle.
   */
  rc: (r, minr, maxr, mx, my) => {
    rad = $.btwn(r, minr, maxr)
    x = $.btwn(r, rad, mx-rad)
    y = $.btwn(r, rad, my-rad)
    col = $.rcol(r)
    return {r:rad, x, y, col}
  },
  /**
   * Rectangle.
   */
  rr: (r, mins, maxs, mx, my) => {
    w = $.btwn(r, mins, maxs)
    h = $.btwn(r, mins, maxs)
    x = $.btwn(r, 0, mx-w)
    y = $.btwn(r, 0, my-h)
    col=$.rcol(r)
    return {pts:[x,y,x+w,y,x+w,y+h,x,y+h],col}
  },
  /**
   * Triangle.
   */
  rit: (r, mx, my) => {
    let x1, y1, x2, y2, x3, y3
    x1 = $.btwn(r, 0, mx)
    y1 = $.btwn(r, 0, my)
    if (r() < 0.5) {
      x2 = r() < 0.5 ? $.btwn(r, 0, x1) : $.btwn(r, x1, mx)
      y2 = y1
      x3 = (x1 + x2) / 2
      y3 = r() < 0.5 ? $.btwn(r, 0, y1) : $.btwn(r, y1, my)
    } else {
      y2 = r() < 0.5 ? $.btwn(r, 0, y1) : $.btwn(r, y1, my)
      x2 = x1
      x3 = r() < 0.5 ? $.btwn(r, 0, x1) : $.btwn(r, x1, mx)
      y3 = (y1 + y2) / 2
    }
    return {pts: [x1, y1, x2, y2, x3, y3], col: $.rcol(r)}
  },
  rt: (r, mx, my) => ({pts: [
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my),
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my),
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my)
  ], col: $.rcol(r)}),
  rs: (r, mx, my, s) => {
      switch($.rarr(r, s)) {
        case _.CIRCLE: return $.rc(r, 5, 30, mx, my)
        case _.TRIANGLE: return $.rit(r, mx, my)
        case _.RECTANGLE: return $.rr(r, 5, 30, mx, my)
        default: throw new Error('NOOOO')
      }
  }
}
