let gameBoard = $.createElement('div')
gameBoard.id = 'g'
$.appendChild(document.body, gameBoard);
function renderSeed(gameObject) {
	let cnv = $.createElement('canvas');
	// TEMP: Store a reference to the canvas on each game object while things move with CSS.
	gameObject.d = cnv
	$.appendChild(gameBoard, cnv);
	let ctx = $.getContext(cnv)
	let r = $.getRandomNumberGenerator(gameObject.s)
	let shapes = $.getRandomShapes(r, gameObject.w, gameObject.h, gameObject.so);
    shapes.forEach(rs => $[rs.r ? 'drawCircle' : 'drawPolygon'](ctx, rs))
}

let gameObjects = [
	new $.PlayerGameObject(),
	new $.EnemyGameObject(6480, 600, 50)
]

drawLoop = () => {
	let i = gameObjects.length
	while (i--) {
		let obj = gameObjects[i]
		// Call .t (tick) on all objects
		obj.t()

		// Check if the object is destroyed.
		if (obj.destroy) {
			// Remove the object and splice the array
			$.removeChild(gameBoard, obj.d)
			gameObjects.splice(i, 1)
		} else {
			// Render the game object
			obj.d.style.transform = `translate(${obj.x}px, ${obj.y}px)`
		}
	}
	setTimeout(drawLoop, 16)
}

/**
 * Adds an instantiated game object to the list of objects
 * and renders the game object canvas.
 */
$.createGameObject = (obj) => {
	renderSeed(obj)
	gameObjects.push(obj)
}

/**
 * Destroys an object if it's outside the game rect.
 * To destroy an object we set the destroy flag and remove all destroyed objects after rendering.
 */
$.destroyIfOutsideGameRect = (obj) => {
	if (obj.x < 0 || obj.x > GameIndex.WIDTH || obj.y < 0 || obj.y > GameIndex.HEIGHT) {
		obj.destroy = true
	}
}

let startGame = () => {
	gameObjects.forEach(renderSeed)
	drawLoop()
}

let splashKeyListener = (e) => {
	if (e.key == ' ') {
		startGame()
		document.body.className = 'g'
		removeEventListener('keydown', splashKeyListener)
		$.initKeyboard()
	}
}

addEventListener('keydown', splashKeyListener)
