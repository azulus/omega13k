$.downKeys = {}
$.initKeyboard = () => {
	addEventListener('keydown', e => $.downKeys[e.key] = true)
	addEventListener('keyup', e => $.downKeys[e.key] = false)
}
