$.assign($, {
	framebuffers: Array(4),
	textures: Array(4),

	renderPlayer: (gl, prog, position) => {
		$.drawShapesToCanvasGL(gl, prog, $.playerShapes, ...position)
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
			if (start > $.levelGameTime) break;
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

	renderStarfield: (gl, width, height) => {
		let tex = $.loadTexture(gl, FramebufferIndex.BACKGROUND, GameConst.STARFIELD_WIDTH, GameConst.STARFIELD_HEIGHT);
		let fb = $.loadFramebuffer(gl, FramebufferIndex.BACKGROUND, tex);
    let prog = $.getStarfieldProgram(gl);

    $.attributeSetFloats(gl, prog, 'pos', 2, $.SCREEN_VERTICES);

    gl.useProgram(prog)

    gl.uniform3f(gl.getUniformLocation(prog, 'resolution'), GameConst.STARFIELD_WIDTH, GameConst.STARFIELD_HEIGHT, 1)
    gl.uniform1f(gl.getUniformLocation(prog, 'globalTime'), $.levelGameTime / 100)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return tex;
  },

	renderGame: () => {
		// initialize the canvas
		let canvas = $.getCanvas();
		let gl = $.get3DContext(canvas);
		$.clear3DCanvas(gl);

		// draw the background
		let bgTexture = $.renderStarfield(gl, canvas.width, canvas.height);

		// render shapes
		// let shipTexture = $.loadTexture(gl, FramebufferIndex.SHIPS);
		// let shipFb = $.loadFramebuffer(gl, FramebufferIndex.SHIPS, shipTexture);

		let shapeProg = $.prepareCanvasForShapes(gl, canvas.width, canvas.height);

		$.renderEnemies(gl, shapeProg);
		let playerPosition = $.getCurrentPlayerPosition();
		$.renderPlayer(gl, shapeProg, playerPosition);
		//
		// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// let vertBuffer = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, $.SCREEN_VERTICES, gl.STATIC_DRAW);
		// gl.drawArrays(gl.TRIANGLES, 0, 6);

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
