$.assign($, {
  shaderProgram: (gl, vs, fs) => {
    let prog = gl.createProgram(),
      addShader = (type, source) => {
          let s = gl.createShader((type === ShaderConst.VERTEX_SHADER) ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)
          gl.shaderSource(s, source)
          gl.compileShader(s)

          // TODO: remove this if block when published
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            throw new Error(`Could not compile ${type} shader:\n\n ${gl.getShaderInfoLog(s)}`)
          }

          gl.attachShader(prog, s)
      }
      addShader(ShaderConst.VERTEX_SHADER, vs)
      addShader(ShaderConst.FRAGMENT_SHADER, fs)

      gl.linkProgram(prog);

      // TODO: remove this if block when published
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error('Could not link the shader program!')
      }

      return prog
  },

  attributeSetFloats: (gl, prog, attr_name, rsize, arr) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
  		gl.STATIC_DRAW);
  	let attr = gl.getAttribLocation(prog, attr_name);
  	gl.enableVertexAttribArray(attr);
  	gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
  },

  get3DContext: (canvas) => {
    return canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  },

  getStarfieldProgram: (gl) => $.shaderProgram(gl, VectorShaderConst.STARFIELD, FragmentShaderConst.STARFIELD),
  get2DProgram: (gl) => $.shaderProgram(gl, VectorShaderConst.TWO_DIMENSION, FragmentShaderConst.TWO_DIMENSION),

  getStarfieldAnimator: (canvas) => {
    let gl = $.get3DContext(canvas),
      prog = $.getStarfieldProgram(gl),
      start = Date.now(),
      texture = gl.createTexture()

    $.attributeSetFloats(gl, prog, 'pos', 2, [
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0
    ]);
    gl.useProgram(prog)
    gl.uniform3f(gl.getUniformLocation(prog, 'resolution'), canvas.width, canvas.height, 1)

    let anim = () => {
      gl.uniform1f(gl.getUniformLocation(prog, 'globalTime'), (Date.now() - start) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
      requestAnimationFrame(anim)
    }
    return anim
  },

  applyStarfield: (canvas) => {
    let anim = $.getStarfieldAnimator(canvas)
    anim();
  }
});