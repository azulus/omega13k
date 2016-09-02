$.assign($, {
  CIRCLE_TRIANGLE_X_OFFSETS: Array(CircleConst.COMPONENT_TRIANGLES + 1).fill(0)
    .map((v,i) => Math.cos(i * Math.PI * 2 / CircleConst.COMPONENT_TRIANGLES)),
  CIRCLE_TRIANGLE_Y_OFFSETS: Array(CircleConst.COMPONENT_TRIANGLES + 1).fill(0)
    .map((v,i) => Math.sin(i * Math.PI * 2 / CircleConst.COMPONENT_TRIANGLES)),

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

  drawCircleGL: (gl, prog, c, ox, oy) => {
    let x = c[ShapeIndex.POINTS][0] + ox,
      y = c[ShapeIndex.POINTS][1] + oy;

    let vertices = [x,y];
    for (let i = 0; i <= CircleConst.COMPONENT_TRIANGLES; i++){
    	vertices.push(x + (c[ShapeIndex.RADIUS] * $.CIRCLE_TRIANGLE_X_OFFSETS[i])),
      vertices.push(y + (c[ShapeIndex.RADIUS] * $.CIRCLE_TRIANGLE_Y_OFFSETS[i]))
    }
    gl.uniform4f(gl.getUniformLocation(prog, "u_color"), ...$.getShaderColor(c[ShapeIndex.COLOR]), 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
  },

  drawPolygonGL: (gl, prog, p, ox, oy) => {
    var colorLocation = gl.getUniformLocation(prog, "u_color");
    gl.uniform4f(colorLocation, ...$.getShaderColor(p[ShapeIndex.COLOR]), 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p[ShapeIndex.POINTS].map((pt, idx) => pt + (idx % 2 === 0 ? ox : oy))), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, p[ShapeIndex.POINTS].length / 2);
  },

  drawShapeGL: (gl, prog, s, ox, oy) => s[ShapeIndex.RADIUS] ? $.drawCircleGL(gl, prog, s, ox, oy) : $.drawPolygonGL(gl, prog, s, ox, oy),
  drawShape: (ctx, s) => s[ShapeIndex.RADIUS] ? $.drawCircle(ctx, s) : $.drawPolygon(ctx, s),

  drawShapesToCanvas: (canvas, shapes, offsetX=0, offsetY=0) => {
    let ctx = $.getContext(canvas);
    shapes.forEach(shape => $.drawShape(ctx, shape));
  },

  drawShapesToCanvasGL: (canvas, shapes, ox=0, oy=0) => {
    let gl = $.get3DContext(canvas),
      prog = $.get2DProgram(gl)


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

    gl.useProgram(prog)
    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvas.width, canvas.height)

    shapes.forEach(rs => $.drawShapeGL(gl, prog, rs, ox, oy))
  }
});
