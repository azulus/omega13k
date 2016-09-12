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

  _cachedPrograms: [],
  getCachedProgram: (key, gl, vs, fs) => {
    let prog = $._cachedPrograms[key];
    if (!prog) {
      prog = $._cachedPrograms[key] = $.shaderProgram(gl, vs, fs);
    }
    return prog;
  },

  getStarfieldProgram: (gl) => $.getCachedProgram(CachedProgramIndex.STARFIELD, gl, VectorShaderConst.STARFIELD, FragmentShaderConst.STARFIELD),
  get2DProgram: (gl) => $.getCachedProgram(CachedProgramIndex.TWO_DIMENSION, gl, VectorShaderConst.TWO_DIMENSION, FragmentShaderConst.TWO_DIMENSION),
  getProjectilesProgram: (gl) => $.getCachedProgram(CachedProgramIndex.PROJECTILES, gl, VectorShaderConst.PROJECTILES, FragmentShaderConst.PROJECTILES),
  getPlumesProgram: (gl) => $.getCachedProgram(CachedProgramIndex.PLUMES, gl, VectorShaderConst.PLUMES, FragmentShaderConst.PLUMES)
});
