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

  getStarfieldProgram: (gl) => {
    let prog = $.shaderProgram(gl, `
        attribute vec2 pos;
        void main() {
          gl_Position = vec4(pos, 0, 1);
        }
      `, `
      precision mediump float;
      uniform vec3 resolution;
      uniform float globalTime;

      void main()
      {
      	vec2 uv=gl_FragCoord.xy/resolution.xy-.5;
      	uv.y*=resolution.y/resolution.x;

      	vec3 dir=vec3(uv*0.8,1.);
      	float time=globalTime*0.0025+.25;

      	vec3 from=vec3(1.,-1.,0.);
      	from+=vec3(time*2.,0.,0.);

      	float s=0.1,fade=1.;
      	vec3 v=vec3(0.);
      	for (int r=0; r<20; r++) {
      		vec3 p=from+s*dir*.5;
      		p = abs(vec3(0.85)-mod(p,vec3(0.85*2.)));
      		float pa,a=pa=0.;
      		for (int i=0; i<18; i++) {
      			p=abs(p)/dot(p,p)-0.53;
      			a+=abs(length(p)-pa);
      			pa=length(p);
      		}
      		float dm=max(0.,0.3-a*a*.001);
      		a*=a*a;
      		if (r>6) fade*=1.-dm;
      		v+=fade;
      		v+=vec3(s,s*s,s*s*s*s)*a*0.0015*fade;
      		fade*=0.78;
      		s+=0.1;
      	}
      	v=mix(vec3(length(v)),v,0.85);
      	gl_FragColor = vec4(v*.01,1.);

      }`)
    return prog
  },

  getStarfieldAnimator: (canvas) => {
    let gl = $.get3DContext(canvas),
      prog = $.getStarfieldProgram(gl),
      start = Date.now();
    $.attributeSetFloats(gl, prog, 'pos', 2, [
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0
    ]);

    let anim = () => {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.useProgram(prog)
      gl.uniform1f(gl.getUniformLocation(prog, 'globalTime'), (Date.now() - start) / 1000)
      gl.uniform3f(gl.getUniformLocation(prog, 'resolution'), canvas.width, canvas.height, 1)
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
