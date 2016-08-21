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
	// Call .t (tick) on all objects
	gameObjects.forEach(obj => obj.t())

	// Render all game objects
	gameObjects.forEach(obj => {
		obj.d.style.transform = `translate(${obj.x}px, ${obj.y}px)`
	})
	setTimeout(drawLoop, 16)
}

gameObjects.forEach(renderSeed)
drawLoop()

/**
 * Adds an instantiated game object to the list of objects
 * and renders the game object canvas.
 */
$.createGameObject = (obj) => {
	renderSeed(obj)
	gameObjects.push(obj)
}