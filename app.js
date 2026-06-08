// 1. Create a function that makes board with arbitrary size, but neither of the 
// sides exceed 50 squares

function createBoard(rows, columns) {
    if (rows > 50 || columns > 50) return 'Error';
    let board = [];
    for (let i = 0 ; i < rows ; i++) {
        board.push([]);
        for (let j = 0 ; j < columns ; j++) {
            board[i].push('');
        }
    }
    return board;
}

// 2. Create a factory function that provides ways to interact with the board.
// This function is the only place which can access the board.

function GameLogicController(board) {
    function showBoard() {
        const triggerEntityStringEvolution = (boardRow) => {
            return boardRow
                .map(boardCell => !boardCell ? ' ' : boardCell)
                .join('|');
        }

        let boardString = board
            .map(row => triggerEntityStringEvolution(row))
            .join('\n');

        return boardString;
    }


    let currentPlayer = 'X';
    function markCell(rowIndex, colIndex) {
        if (
            board[rowIndex] === undefined ||
            board[rowIndex][colIndex] === undefined ||
            board[rowIndex][colIndex] !== '' ||
            gameOver
        ) {
            alert('Warning: You have interacted with a forbidden board cell... the system will remember this...');
            return;
        };

        board[rowIndex][colIndex] = currentPlayer;
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    }


    let gameOver = false;
    function checkWinStatus(rowIndex, colIndex, winConditionNumber = 3) {
        if (gameOver) return false;

        const algorithms = [
            [0, 1],  // left -> right
            [1, 0],  // bottom -> top
            [-1, 1], // bottom left -> top right
            [-1, -1], //bottom right -> top left
        ];

        const checkPositionValidity = (position) => {
            return board[position[0]] !== undefined &&
                    board[position[0]][position[1]] !== undefined
        }

        // For each direction check, follow this pattern:
        // start at last move -> walk repeatedly -> count matches -> stop when broken

        for (const direction of algorithms) {
            let sequenceCount = 1;
            const lastMoveToken = board[rowIndex][colIndex];
            let forwardPosition = [rowIndex + direction[0], colIndex + direction[1]];
            let backwardPosition = [rowIndex - direction[0], colIndex - direction[1]];

            while (
                checkPositionValidity(forwardPosition) &&
                board[forwardPosition[0]][forwardPosition[1]] === lastMoveToken && 
                sequenceCount < winConditionNumber
            ) {
                ++sequenceCount;
                forwardPosition[0] += direction[0];
                forwardPosition[1] += direction[1];
            }

            while (
                checkPositionValidity(backwardPosition) &&
                board[backwardPosition[0]][backwardPosition[1]] === lastMoveToken &&
                sequenceCount < winConditionNumber
            ) {
                ++sequenceCount;
                backwardPosition[0] -= direction[0];
                backwardPosition[1] -= direction[1];
            }

            if (sequenceCount >= winConditionNumber) {
                gameOver = true;
                return true;
            }
        }

        return false;
    }

    return {showBoard, markCell, checkWinStatus};
}

function GameUIController() {

    function renderBoardUI(boardUI, boardArray) {
        boardUI.textContent = '';

        boardUI.style.setProperty(
            '--column-number',
            boardArray[0].length
        );

        boardArray.forEach((row, rowIndex) => {
            row.forEach((column, columnIndex) => {
                const cellUI = document.createElement('div');
                cellUI.classList.add('cell');
                cellUI.textContent = column
                cellUI.dataset.row = rowIndex;
                cellUI.dataset.column = columnIndex;
                boardUI.appendChild(cellUI);
            })
        });
    }

    function giveClickedCellPosition(e) {
        if (e.target.classList.contains('cell')) {
            return [
                +e.target.dataset.row, 
                +e.target.dataset.column
            ]
        }
    }

    return {renderBoardUI, giveClickedCellPosition}
}


function GameCentralProcessingUnit() {
    const boardUI = document.querySelector('.board');
    const redoButton = document.querySelector('button.redo');
    const newGameButton = document.querySelector('button.new-game');
    const createNewBoardForm = document.querySelector('form');

    const boardArray = createBoard(10, 10);
    const logicalInteractions = GameLogicController(boardArray);
    const uiInteractions = GameUIController();

    uiInteractions.renderBoardUI(boardUI, boardArray);

    boardUI.addEventListener('click', (e) => {
        if (e.target.classList.contains('cell')) {
            const clickedCellPosition = 
                uiInteractions.giveClickedCellPosition(e);
            logicalInteractions.markCell(...clickedCellPosition);
            uiInteractions.renderBoardUI(boardUI, boardArray);
        }
    })
}

GameCentralProcessingUnit()