PLAYER_SPEED = 5

gameBoard = $.getElementById('g')
function renderSeed(gameObject) {
	let cnv = $.createElement('canvas');
	gameObject[4] = cnv
	$.appendChild(gameBoard, cnv);
	let ctx = $.getContext(cnv)
	let r = $.getRandomNumberGenerator(gameObject[1])
	shapes = $.getRandomShapes(r, gameObject[2], gameObject[3], gameObject[0]);
    shapes.forEach(rs => $[rs.r ? 'drawCircle' : 'drawPolygon'](ctx, rs))
}

// [usedObjects, seed, width, height, DomElement, transformX, transformY]
gameObjects = [
	// Player
	['', 5745, 100, 100, null, 0, 0],

	// Enemy 1
	['', 6480, 100, 100, null, 600, 50]
]

downKeys = {}

enemyAdjust = 5

drawLoop = () => {
	// Update player based on arrows.
	if (downKeys.ArrowDown) gameObjects[0][6] += PLAYER_SPEED;
	if (downKeys.ArrowUp) gameObjects[0][6] -= PLAYER_SPEED;
	if (downKeys.ArrowRight) gameObjects[0][5] += PLAYER_SPEED;
	if (downKeys.ArrowLeft) gameObjects[0][5] -= PLAYER_SPEED;

	// Stub enemy movement
	gameObjects[1][6] += enemyAdjust
	if (gameObjects[1][6] > 300 || gameObjects[1][6] < 50) enemyAdjust = 0 - enemyAdjust;

	// Render all game objects
	gameObjects.forEach(obj => {
		obj[4].style.left = obj[5] + 'px'
		obj[4].style.top = obj[6] + 'px'
	})

	setTimeout(drawLoop, 16)
}

gameObjects.forEach(renderSeed)
drawLoop()

addEventListener('keydown', e => downKeys[e.key] = true)
addEventListener('keyup', e => downKeys[e.key] = false)
