$.assign($, {
	renderPlayer: (gl, prog, position) => {
		$.drawShapesToCanvasGL(gl, prog, $.playerShapes, ...position)
	},

	renderEnemies: (gl, prog) => {
		for (let i = 0; i < $._activeEnemyCount; i++){
			let posIdx = i * 2;
			let enemy = $.levelEnemies[$._activeEnemyIndexes[i]];
			let shapes = enemy[LevelShipIndex.SHAPES];
			let paths = enemy[LevelShipIndex.PATH_DATA];
			// let pos = $.getPositionAtTime(paths, $.levelGameTime);

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
			let [x, y, xPerMs, yPerMs, startTime] = path;
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
			let [start, end, path, whatsThis] = projectiles[i];
			if (start > $.levelGameTime) break;
			if (end !== undefined) {
				if ($._firstPlayerProjectileIdx === i) $._firstPlayerProjectileIdx++;
				continue
			};
			let elapsedTime = $.levelGameTime - start;
			let [x, y, xPerMs, yPerMs, startTime] = path;

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
		let x = 0, y = 0, w = $.getCurrentPlayerHealth() / PlayerConst.MAX_HEALTH * width, h = 6, i;
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
	}
})
