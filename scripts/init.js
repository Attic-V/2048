const boardElement = document.createElement('div');

boardElement.id = 'game-board';
document.body.appendChild(boardElement);

for (let _ = 0; _ < 16; _++) {
	const cell = document.createElement('div');
	cell.classList.add('cell');
	boardElement.appendChild(cell);
}

const gameEnd = document.querySelector('.game-end');