$.assign($, {
	framebuffers: Array(4),
	textures: Array(4),
	stars: new Float32Array(BackgroundConst.NUM_STARS * 4),
	plumes: new Float32Array(PlumeConst.MAX_PLUMES * 4),

	prepareCanvasForShapes: (gl, width, height) => {
    let prog = $.get2DProgram(gl)

    var posLocation = gl.getAttribLocation(prog, 'a_position');
  	gl.useProgram(prog);
		gl.disable(gl.BLEND);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
    	gl.ARRAY_BUFFER,
      $.SCREEN_VERTICES,
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), width, height)

    return prog;
  },

	prepareCanvasForProjectiles: (gl, width, height) => {
	    let prog = $.getProjectilesProgram(gl)

	    gl.useProgram(prog)
	    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), width, height)

	    return prog;
	},

	prepareCanvasForPlumes: (gl, width, height) => {
	    let prog = $.getPlumesProgram(gl);

	    gl.useProgram(prog);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	    gl.uniform2f(gl.getUniformLocation(prog, 'uResolution'), width, height)
			gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), $.levelGameTime * 0.001);

	    return prog;
	},

	renderPlayer: (gl, prog, position) => {
		$.drawShapesToCanvasGL(gl, prog, $.playerShapes, ...position)
	},

	initializePlumes: () => {
		for (var i=0; i < PlumeConst.MAX_PLUMES; i++)  {
   		// set up the distance from the center
   		let dist = 0.8 * Math.random() * Math.random() * Math.random();
      // based on distance, set up the lifetime
      let lifetime = (dist + 1.5) * Math.random() + 1;
      // set the velocity
      let velocity = ( 30.0 *(Math.random()) );
      // choose whether distance is positive or negative
      if (Math.random() < 0.5) dist *= -1;
      dist *= 5;
      $.plumes[(i * 4) + 0] = velocity;
      $.plumes[(i * 4) + 1] = dist;
      $.plumes[(i * 4) + 2] = lifetime;
      $.plumes[(i * 4) + 3] = 1 / lifetime;
   }
	},

	renderEnemyPlumes: (gl, prog) => {
		gl.uniform3f(gl.getUniformLocation(prog, 'uColor'), 0.8, 0.4, 0.4);

		let originLoc = gl.getUniformLocation(prog, 'uOrigin'),
			posLoc = gl.getAttribLocation(prog, 'aPos'),
			posIdx, i;

		gl.enableVertexAttribArray( posLoc );
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, $.plumes, gl.STATIC_DRAW);
		gl.vertexAttribPointer( posLoc, 4, gl.FLOAT, false, 0, 0);

		for (i = 0; i < $._activeEnemyCount; i++){
			posIdx = i * 2;
			gl.uniform3f(originLoc, $._activeEnemyPositions[posIdx] + GameConst.SHIP_WIDTH, $._activeEnemyPositions[posIdx+1] + GameConst.HALF_SHIP_HEIGHT, i)
			gl.drawArrays(gl.POINTS, 0, PlumeConst.MAX_PLUMES);
		}
	},

	renderEnemies: (gl, prog) => {
		for (let i = 0; i < $._activeEnemyCount; i++){
			let posIdx = i * 2;
			let enemy = $.levelEnemies[$._activeEnemyIndexes[i]];
			let shapes = enemy[LevelShipIndex.SHAPES];

			$.drawShapesToCanvasGL(gl, prog, shapes, $._activeEnemyPositions[posIdx], $._activeEnemyPositions[posIdx+1]);
		}
	},

	renderEnemyProjectiles: (gl, prog, projectiles) => {
		let count = 0;
		$._activeEnemyProjectileCount = 0;
		for (let i = $._firstEnemyProjectileIdx; i < projectiles.length; i++){
			let [start, end, path] = projectiles[i];
			if (start > $.levelGameTime) continue;
			if (end !== undefined) {
				if ($._firstEnemyProjectileIdx === i) $._firstEnemyProjectileIdx++;
				continue
			};
			let elapsedTime = $.levelGameTime - start;
			let [x, y, xPerMs, yPerMs] = path;
			let newX = x + (elapsedTime * xPerMs);
			let newY = y + (elapsedTime * yPerMs)
			if (newX < 0 || newY < 0 || newY > GameConst.HEIGHT) projectiles[i][1] = $.levelGameTime;
			$._activeEnemyProjectilePositions[count++] = newX;
			$._activeEnemyProjectilePositions[count++] = newY;
			$._activeEnemyProjectileIndex[$._activeEnemyProjectileCount++] = i;
		}

		if (count > 0) {
			let prog = $.prepareCanvasForProjectiles(gl, GameConst.WIDTH, GameConst.HEIGHT);

			let pointsLoc = gl.getAttribLocation(prog, 'aPoint');
			let colorLoc = gl.getUniformLocation(prog, 'u_color');
			gl.uniform3f(colorLoc, 0.8, 0.4, 0.4);

			gl.enableVertexAttribArray(pointsLoc);
		  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		  gl.bufferData(gl.ARRAY_BUFFER, $._activeEnemyProjectilePositions, gl.STATIC_DRAW);
		  gl.vertexAttribPointer(pointsLoc, 2, gl.FLOAT, false, 0, 0);

			gl.drawArrays(gl.POINTS, 0, count / 2);
		}
	},

	renderPlayerProjectiles: (gl, prog, projectiles, pos) => {
		let count = 0;
		$._activePlayerProjectileCount = 0;
		for (let i = $._firstPlayerProjectileIdx; i < projectiles.length; i++){
			let [start, end, path] = projectiles[i];
			if (start > $.levelGameTime) break;
			if (end !== undefined) {
				if ($._firstPlayerProjectileIdx === i) $._firstPlayerProjectileIdx++;
				continue
			};
			let elapsedTime = $.levelGameTime - start;
			let [x, y, xPerMs, yPerMs] = path;

			// projectiles may be spawned off screen, recenter them based on pos
			if (x === -1) {
				[x, y] = pos;
				x += GameConst.SHIP_WIDTH / 2;
				y += GameConst.SHIP_HEIGHT / 2;
				path[0] = x;
				path[1] = y;
			}

			let newX = x + (elapsedTime * xPerMs);
			let newY = y + (elapsedTime * yPerMs)
			if (newX < 0 || newY < 0 || newY > GameConst.HEIGHT || newX > GameConst.WIDTH) projectiles[i][1] = $.levelGameTime;
			$._activePlayerProjectilePositions[count++] = newX;
			$._activePlayerProjectilePositions[count++] = newY;
			$._activePlayerProjectileIndex[$._activePlayerProjectileCount++] = i;
		}

		if (count > 0) {
			let prog = $.prepareCanvasForProjectiles(gl, GameConst.WIDTH, GameConst.HEIGHT);

			let pointsLoc = gl.getAttribLocation(prog, 'aPoint');
			let colorLoc = gl.getUniformLocation(prog, 'u_color');
			gl.uniform3f(colorLoc, 0.6, 0.6, 1.);

			gl.enableVertexAttribArray(pointsLoc);
		  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		  gl.bufferData(gl.ARRAY_BUFFER, $._activePlayerProjectilePositions, gl.STATIC_DRAW);
		  gl.vertexAttribPointer(pointsLoc, 2, gl.FLOAT, false, 0, 0);

			gl.drawArrays(gl.POINTS, 0, count / 2);
		}
	},

	renderHealth: (gl, prog, width, height) => {
		let x = 0, y = 0, w = $.getCurrentPlayerHealth() / PlayerConst.MAX_HEALTH * width, h = 6;
		let shapes = [$.makeWebGLReady(['#afa',,[x,y,x+w,y,x+w,y+h,x,y+h]])];
		$.drawShapesToCanvasGL(gl, prog, shapes, 0, 0);
	},

  renderChrono: (gl, prog, width, height) => {
		let x = 0, y = 10, w = $.playerChrono / PlayerConst.MAX_CHRONO * width, h = 6;
		let shapes = [$.makeWebGLReady(['#aaf',,[x,y,x+w,y,x+w,y+h,x,y+h]])];
		$.drawShapesToCanvasGL(gl, prog, shapes, 0, 0);
	},

  renderBossHealth: (gl, prog, width, height) => {
		let x = 0, y = GameConst.HEIGHT - 10, w = $.bossHealth / $.maxBossHealth * width, h = 6;
		let shapes = [$.makeWebGLReady(['#f88',,[x,y,x+w,y,x+w,y+h,x,y+h]])];
		$.drawShapesToCanvasGL(gl, prog, shapes, 0, 0);
	},

	createTexture: (gl) => {
		let texture = gl.createTexture(gl);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		return texture;
	},

	loadTexture: (gl, fbIdx, width, height) => {
		if ($.textures[fbIdx] === undefined) {
			$.textures[fbIdx] = gl.createTexture();
		}
		gl.bindTexture(gl.TEXTURE_2D, $.textures[fbIdx]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		return $.textures[fbIdx];
	},

	loadFramebuffer: (gl, fbIdx, texture) => {
		if ($.framebuffers[fbIdx] === undefined) {
			$.framebuffers[fbIdx] = gl.createFramebuffer();
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, $.framebuffers[fbIdx]);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		return $.framebuffers[fbIdx];
	},

	initializeStarfield: () => {
		let r = $.getRandomNumberGenerator(BackgroundConst.SEED);
		// create a few hundred stars
		for (i = 0; i < BackgroundConst.NUM_STARS; ++i) {
			// init x, init y, brightness, velocity
			$.stars[(i*4) + 0] = $.randBetween(r, 0, GameConst.WIDTH);
			$.stars[(i*4) + 1] = $.randBetween(r, 0, GameConst.HEIGHT);
			$.stars[(i*4) + 2] = $.randBetweenFloat(r, BackgroundConst.MIN_BRIGHTNESS, BackgroundConst.MAX_BRIGHTNESS);
			$.stars[(i*4) + 3] = $.randBetweenFloat(r, BackgroundConst.MIN_VELOCITY, BackgroundConst.MAX_VELOCITY);
		}
	},

	updateStarfield: (elapsedTime) => {
		for (i = 0; i < BackgroundConst.NUM_STARS; ++i) {
			$.stars[(i*4) + 0] = ($.stars[(i*4) + 0] - (elapsedTime * $.stars[(i*4) + 3]) + GameConst.WIDTH) % GameConst.WIDTH;
		}
	},

	renderStarfield: (gl, width, height) => {
		let prog = $.getStarfieldProgram(gl);
		gl.useProgram(prog)

		let pointsLoc = gl.getAttribLocation(prog, 'aStar');
		let resolutionLoc = gl.getUniformLocation(prog, 'u_resolution');
		gl.uniform2f(resolutionLoc, GameConst.WIDTH, GameConst.HEIGHT);

		gl.enableVertexAttribArray(pointsLoc);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, $.stars, gl.STATIC_DRAW);
		gl.vertexAttribPointer(resolutionLoc, 4, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.POINTS, 0, BackgroundConst.NUM_STARS);
  },

	renderGame: () => {
		// initialize the canvas
		let canvas = $.getCanvas();
		let gl = $.get3DContext(canvas);
		$.clear3DCanvas(gl);

		// draw the background
		$.renderStarfield(gl, canvas.width, canvas.height);

		// render engine plumes
		let plumeProg = $.prepareCanvasForPlumes(gl, canvas.width, canvas.height);
		$.renderEnemyPlumes(gl, plumeProg);

		// render shapes
		let shapeProg = $.prepareCanvasForShapes(gl, canvas.width, canvas.height);
		$.renderEnemies(gl, shapeProg);
		let playerPosition = $.getCurrentPlayerPosition();
		$.renderPlayer(gl, shapeProg, playerPosition);

		// render health bar
		$.renderHealth(gl, shapeProg, canvas.width, canvas.height);

		// render chrono bar
		$.renderChrono(gl, shapeProg, canvas.width, canvas.height);

		if ($.inBossLevel) {
			$.renderBossHealth(gl, shapeProg, canvas.width, canvas.height);
		}

		// render projectiles
		let pointProg = $.prepareCanvasForProjectiles(gl, canvas.width, canvas.height);
		$.renderEnemyProjectiles(gl, pointProg, $.enemyProjectiles);
		$.renderPlayerProjectiles(gl, pointProg, $.playerProjectiles, playerPosition);

		gl.flush();
	}
})
