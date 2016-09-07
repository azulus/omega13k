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

  drawShapeGL: (gl, prog, s, ox, oy) => {
    gl.uniform4f(gl.getUniformLocation(prog, "u_color"), ...$.getShaderColor(s[ShapeIndex.COLOR]), 1);
    gl.bufferData(gl.ARRAY_BUFFER, s[ShapeIndex.WEBGL_REPRESENTATION], gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, s[ShapeIndex.WEBGL_REPRESENTATION_LENGTH]);
  },
  drawShape: (ctx, s) => s[ShapeIndex.RADIUS] ? $.drawCircle(ctx, s) : $.drawPolygon(ctx, s),

  drawShapesToCanvas: (canvas, shapes, offsetX=0, offsetY=0) => {
    let ctx = $.getContext(canvas);
    shapes.forEach(shape => $.drawShape(ctx, shape));
  },

  clear3DCanvas: (gl) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  prepareCanvasForShapes: (gl, width, height) => {
    let prog = $.get2DProgram(gl)

    var posLocation = gl.getAttribLocation(prog, 'a_position');
  	gl.useProgram(prog);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
    	gl.ARRAY_BUFFER,
      new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0
      ]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), width, height)

    return prog;
  },

  drawShapesToCanvasGL: (gl, prog, shapes, ox=0, oy=0) => {
    gl.uniform2f(gl.getUniformLocation(prog, 'u_offset'), ox, oy);
    shapes.forEach(rs => $.drawShapeGL(gl, prog, rs, ox, oy))
  }
});
