_ = {
  //c: '0123456789abcdef'
  c: '456789abcdef'
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
  gen: (s) => () => {
      const rnd = Math.sin(s++) * 10000
      return rnd - $.f(rnd)
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
    $.cp(ctx)
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
  rc: (r, mx, my, minr, maxr) => {
    rad = $.btwn(r, minr, maxr)
    x = $.btwn(r, rad, mx-rad)
    y = $.btwn(r, rad, my-rad)
    col = $.rcol(r)
    return {r:rad, x, y, col}
  },
  rr: (r, mx, my, mins, maxs) => {
    w = $.btwn(r, mins, maxs)
    h = $.btwn(r, mins, maxs)
    x = $.btwn(r, 0, mx-w)
    y = $.btwn(r, 0, my-h)
    col=$.rcol(r)
    return {pts:[x,y,x+w,y,x+w,y+h,x,y+h],col}
  },
  ri: (r, mx, my) => {
    let x1 = $.btwn(r, 0, mx), y1 = $.btwn(r, 0, my),
      x2 = r() < 0.5 ? $.btwn(r, 0, x1) : $.btwn(r, x1, mx),
      y3 = r() < 0.5 ? $.btwn(r, 0, y1) : $.btwn(r, y1, my),
      cv = r(),
      x3 = cv < 0.5 ? (x1 + x2) / 2 : x1,
      y2 = cv >= 0.5 ? (y1 + y3) / 2 : y1
    return {pts: [x1, y1, x2, y2, x3, y3], col: $.rcol(r)}
  },
  es: (s) => s.split(''),
  rt: (r, mx, my) => ({pts: [
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my),
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my),
     $.btwn(r, 0, mx),
     $.btwn(r, 0, my)
  ], col: $.rcol(r)}),
  rss: (r) => {
    s = ''
    while (1) {
      s += $.rarr(r,$.es('crit'))
      if (s.length >= 5 || (s.length >= 2 && r() < 0.5)) return s
    }
  },
  rs: (r, mx, my, s) => $.es(s||$.rss(r)).map(is => {
    return $['r' + is](r, mx, my, 5, 30)
  })
}
