if (localStorage.isOpen == 'true') {
	open('about:blank', '_self').close();
} else {
	localStorage.isOpen = true;
	window.onunload = () => { localStorage.isOpen = false; }
}

boardElement.addEventListener('touchstart', startTouch);
boardElement.addEventListener('touchmove', moveTouch);
document.addEventListener('keyup', controls);

let player = true;
let touchX = null;
let touchY = null;

let gameBoard;
let enableKeys = false;
let score = 0;

startGame();

function controls(event) {
	if (!player) return;
	switch (event.key) {
		case 'ArrowLeft':
			if (enableKeys) leftArrow();
			break;
		case 'ArrowRight':
			if (enableKeys) rightArrow();
			break;
		case 'ArrowUp':
			if (enableKeys) upArrow();
			break;
		case 'ArrowDown':
			if (enableKeys) downArrow();
			break;
	}
}

function arrow(move) {
	return () => {
		if (move()) createTile();
		updateUI();
	}
}

const leftArrow  = arrow(moveLeft );
const rightArrow = arrow(moveRight);
const upArrow    = arrow(moveUp   );
const downArrow  = arrow(moveDown );

function startTouch(event) {
	if (!player) return;
	touchX = event.touches[0].clientX;
	touchY = event.touches[0].clientY;
}

function moveTouch(event) {
	if (!player) return;
	if (touchX == null) return;
	if (touchY == null) return;
	let currentX = event.touches[0].clientX;
	let currentY = event.touches[0].clientY;
	let deltaX = touchX - currentX;
	let deltaY = touchY - currentY;
	if (Math.abs(deltaX) > Math.abs(deltaY)) {
		if (deltaX > 0) {
			if (enableKeys) leftArrow();
		} else {
			if (enableKeys) rightArrow();
		}
	} else {
		if (deltaY > 0) {
			if (enableKeys) upArrow();
		} else {
			if (enableKeys) downArrow();
		}
	}
	touchX = null
	touchY = null;
	event.preventDefault();
}

function startGame() {
	if (localStorage.gameSaved == 'true') {
		loadGame();
		updateUI();
		enableKeys = true;
	} else {
		reset();
	}
}

function loadGame() {
	setupBoard();
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			if (localStorage[`${y}-${x}`] == 'null') continue;
			const tile = document.createElement('div');
			const text = document.createElement('span');
			tile.classList.add('tile');
			text.classList.add('text');
			text.innerText = localStorage[`${y}-${x}`];
			tile.appendChild(text);
			boardElement.appendChild(tile);
			gameBoard[y][x] = tile;
		}
	}
	score = parseInt(localStorage.score);
	updateUI();
}

function gameOver() {
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 4; x++) {
			if (gameBoard[y][x] == null) return false;
			if (gameBoard[x][y] == null) return false;
			if (gameBoard[y + 1][x] == null) return false;
			if (gameBoard[x][y + 1] == null) return false;
			if (gameBoard[y][x].children[0].innerText == gameBoard[y + 1][x].children[0].innerText) return false;
			if (gameBoard[x][y].children[0].innerText == gameBoard[x][y + 1].children[0].innerText) return false;
		}
	}
	return true;
}

function createTile(n = 1) {
	if (n > 1) {
		for (let i = 0; i < n; i++) createTile();
		return;
	}
	let empty = false;
	let y;
	let x;
	while (!empty) {
		y = Math.floor(Math.random() * 4);
		x = Math.floor(Math.random() * 4);
		if (gameBoard[y][x] == null) empty = true;
	}
	let tileValue = (1 + Math.floor(Math.random() * 2)) * 2;
	const tile = document.createElement('div');
	tile.classList.add('tile');
	tile.id = `${y}-${x}`;
	boardElement.appendChild(tile);
	const text = document.createElement('span');
	text.innerText = tileValue;
	text.classList.add('text');
	tile.appendChild(text);
	gameBoard[y][x] = tile;
	updateUI();
}

function filterEmpty(row) {
	return row.filter(n => n != null);
}

function slide(r) {
	let row = filterEmpty(r);
	for (let x = 0; x < row.length - 1; x++) {
		if (row[x] == null) continue;
		if (row[x].children[0].innerText == row[x + 1].children[0].innerText) {
			row[x + 1].classList.add('shrink');
			const tile = row[x + 1];
			setTimeout(() => {
				tile.remove();
			}, 800);
			row[x + 1] = null;
			score += parseInt(row[x].children[0].innerText);
			row[x].children[0].innerText *= 2;
			row[x].classList.add('merge');
			const glowTile = row[x];
			setTimeout(() => {
				try {
					glowTile.classList.remove('merge');
				}
				catch(err) {
					console.warn(err);
				}
			}, 800);
			if (parseInt(row[x].children[0].innerText) > parseInt(localStorage.highTile)) localStorage.highTile = parseInt(row[x].children[0].innerText);
		}
	}
	row = filterEmpty(row);
	while (row.length < 4) {
		row.push(null);
	}
	return row;
}

function updateUI() {
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			if (gameBoard[y][x] == null) continue;
			gameBoard[y][x].style.setProperty('--y', y);
			gameBoard[y][x].style.setProperty('--x', x);
			gameBoard[y][x].style.setProperty('--r', `${90 * (x + y)}deg`);
			gameBoard[y][x].style.setProperty('--char-count', `${gameBoard[y][x].children[0].innerText.length}vmin`);
			gameBoard[y][x].style.setProperty('--background-lightness', `${100 - (6 * Math.log2(gameBoard[y][x].children[0].innerText))}%`);
			gameBoard[y][x].style.setProperty('--text-lightness', `${(6 * (Math.log2(gameBoard[y][x].children[0].innerText) - 1)) > 50 ? 90 : 20}%`);
			gameBoard[y][x].style.setProperty('--shadow', `${0.1 * (Math.log2(gameBoard[y][x].children[0].innerText) - 1)}vmin`);
			if (localStorage.highScore == null) localStorage.highScore = 0;
			if (localStorage.highTile == null) localStorage.highTile = 0;
			if (score > parseInt(localStorage.highScore)) localStorage.highScore = score;
			document.querySelector('#high-tile').innerText = `High Tile: ${localStorage.highTile}`;
			document.querySelector('#high-score').innerText = `High Score: ${localStorage.highScore}`;
			document.querySelector('#current-score').innerText = `Score: ${score}`;
		}
	}
	saveGame();
	if (gameOver()) endGame();
}

function saveGame() {
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			localStorage[`${y}-${x}`] = (gameBoard[y][x] == null) ? null : gameBoard[y][x].children[0].innerText;
		}
	}
	localStorage.score = score;
	localStorage.gameSaved = true;
}

function endGame() {
	enableKeys = false;
	player = true;
	boardElement.classList.add('hide');
	gameEnd.classList.add('game-ended');
	setTimeout(() => {
		boardElement.classList.remove('hide');
		gameEnd.classList.remove('game-ended');
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				gameBoard[y][x] = null;
			}
		}
		document.querySelectorAll('.tile').forEach(t => { t.remove(); });
		score = 0;
		createTile(2);
		updateUI();
		enableKeys = true;
	}, 8000);
}

function logBoard() {
	let str = '';
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			str += (gameBoard[y][x] == null) ? 0 : gameBoard[y][x].children[0].innerText;
			str += ' ';
		}
		str += '\n';
	}
	return str;
}

function moveLeft() {
	let old = logBoard();
	for (let y = 0; y < 4; y++) {
		gameBoard[y] = slide(gameBoard[y]);
	}
	if (old == logBoard()) return false;
	return true;
}

function moveRight() {
	let old = logBoard();
	for (let y = 0; y < 4; y++) {
		let row = gameBoard[y].reverse();
		row = slide(row).reverse();
		gameBoard[y] = row;
	}
	if (old == logBoard()) return false;
	return true;
}

function moveUp() {
	let old = logBoard();
	for (let x = 0; x < 4; x++) {
		let row = [];
		for (let y = 0; y < 4; y++) row.push(gameBoard[y][x]);
		row = slide(row);
		for (let y = 0; y < 4; y++) gameBoard[y][x] = row[y];
	}
	if (old == logBoard()) return false;
	return true;
}

function moveDown() {
	let old = logBoard();
	for (let x = 0; x < 4; x++) {
		let row = [];
		for (let y = 0; y < 4; y++) row.push(gameBoard[y][x]);
		row = slide(row.reverse()).reverse();
		for (let y = 0; y < 4; y++) gameBoard[y][x] = row[y];
	}
	if (old == logBoard()) return false;
	return true;
}

function setupBoard() {
	gameBoard = [[], [], [], []];
	for (let $ = 0; $ < 4; $++) gameBoard[$] = [null, null, null, null];
}

function reset() {
	setupBoard();
	createTile(2);
	score = 0;
	updateUI();
	enableKeys = true;
}