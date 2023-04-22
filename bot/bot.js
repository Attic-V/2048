/*
To create a new bot:
const bot = new Bot({});

To run a bot:
bot.run();

To kill a bot:
bot.kill();

Options:
bot.gamesPerMove ::: how many games the bot plays per move
bot.delay        ::: how long the bot waits between moves
*/

class Bot {
	constructor(param) {
		this.gamesPerMove = param.gpm || 200;
		this.delay = param.delay || 1800;
		this.inGame = false;
	}

	run() {
		player = false;
		this.game = setInterval(() => { this.move(); }, this.delay);
	}

	move() {
		if (this.inGame) return;
		this.inGame = true;
		let left = 0;
		let right = 0;
		let up = 0;
		let down = 0;
		for (let i = 0; i < this.gamesPerMove; i++) {
			left += simGame('left');
			right += simGame('right');
			up += simGame('up');
			down += simGame('down');
		}
		left /= this.gamesPerMove;
		right /= this.gamesPerMove;
		up /= this.gamesPerMove;
		down /= this.gamesPerMove;
		switch (Math.max(left, right, up, down)) {
			case left:
				leftArrow();
				break;
			case right:
				rightArrow();
				break;
			case up:
				upArrow();
				break;
			case down:
				downArrow();
				break;
		}
		this.inGame = false;
		if (gameOver()) {
			this.kill();
		}

		function simGame(dir) {

			let score = 0;
			let board = _getBoard();

			switch (dir) {
				case 'left':
					_moveLeft();
					break;
				case 'right':
					_moveRight();
					break;
				case 'up':
					_moveUp();
					break;
				case 'down':
					_moveDown();
					break;
			}

			while (!_gameOver()) {
				const d = Math.floor(Math.random() * 4);
				switch (d) {
					case 0:
						_moveLeft();
						break;
					case 1:
						_moveRight();
						break;
					case 2:
						_moveUp();
						break;
					case 3:
						_moveDown();
						break;
				}
			}

			return score;

			function _gameOver() {
				for (let y = 0; y < 3; y++) {
					for (let x = 0; x < 4; x++) {
						if (board[y][x] == 0) return false;
						if (board[x][y] == 0) return false;
						if (board[y + 1][x] == 0) return false;
						if (board[x][y + 1] == 0) return false;
						if (board[y][x] == board[y + 1][x]) return false;
						if (board[x][y] == board[x][y + 1]) return false;
					}
				}
				return true;
			}

			function _createTile() {
				score += 1;
				let empty = false;
				let y;
				let x;
				while (!empty) {
					y = Math.floor(Math.random() * 4);
					x = Math.floor(Math.random() * 4);
					if (board[y][x] == 0) empty = true;
				}
				const tileValue = 2 ** (Math.floor(Math.random() * 2) + 1);
				board[y][x] = tileValue;
			}

			function _getBoard() {
				let b = [];
				for (let y = 0; y < 4; y++) {
					b[y] = [0, 0, 0, 0];
					for (let x = 0; x < 4; x++) {
						if (gameBoard[y][x] == null) continue;
						b[y][x] = parseInt(gameBoard[y][x].children[0].innerText);
					}
				}
				return b;
			}

			function _moveLeft() {
				let $old = _getString();
				for (let i = 0; i < 4; i++) {
					board[i] = _slide(board[i]);
				}
				if ($old == _getString()) return false;
				_createTile();
				return true;
			}

			function _moveRight() {
				let $old = _getString();
				for (let i = 0; i < 4; i++) {
					board[i] = _slide(board[i].reverse()).reverse();
				}
				if ($old == _getString()) return false;
				_createTile();
				return true;
			}

			function _moveUp() {
				let $old = _getString();
				for (let i = 0; i < 4; i++) {
					let $r = [];
					for (let j = 0; j < 4; j++) $r.push(board[j][i]);
					$r = _slide($r);
					for (let j = 0; j < 4; j++) board[j][i] = $r[j];
				}
				if ($old == _getString()) return false;
				_createTile();
				return true;
			}

			function _moveDown() {
				let $old = _getString();
				for (let i = 0; i < 4; i++) {
					let $r = [];
					for (let j = 0; j < 4; j++) $r.push(board[j][i]);
					$r = _slide($r.reverse()).reverse();
					for (let j = 0; j < 4; j++) board[j][i] = $r[j];
				}
				if ($old == _getString()) return false;
				_createTile();
				return true;
			}

			function _getString() {
				let str = '';
				for (let y = 0; y < 4; y++) {
					for (let x = 0; x < 4; x++) {
						str += `${board[y][x]} `;
					}
					str += '\n';
				}
				return str;
			}

			function _slide(r) {
				let $row = _filterZero(r);
				for (let i = 0; i < $row.length - 1; i++) {
					if ($row[i] == 0) continue;
					if ($row[i] == $row[i + 1]) {
						$row[i + 1] = 0;
						$row[i] *= 2;
					}
				}
				$row = _filterZero($row);
				while ($row.length < 4) {
					$row.push(0);
				}
				return $row;
			}

			function _filterZero(row) {
				return row.filter(n => n != 0);
			}

		}
	}

	kill() {
		clearInterval(this.game);
		player = true;
	}
}