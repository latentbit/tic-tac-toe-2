// 1. Create a function that makes board with arbitrary size, but neither of the 
// sides exceed 50 squares

function createBoard(rows, columns) {
    if (
        rows > 50 || columns > 50 || 
        rows < 1 || columns < 1
    ) {
        alert('Board input number exceed the desired range');
        return;
    }

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

        console.log(boardString);
    }


    let currentPlayer = 'X';
    let gameOver = false;
    function markCell(rowIndex, colIndex, winConditionNumber = 3) {
        if (gameOver) {
            alert('Game already over! Create a new game !');
            return;
        }

        if (
            board[rowIndex] === undefined ||
            board[rowIndex][colIndex] === undefined ||
            board[rowIndex][colIndex] !== ''
        ) {
            alert('Warning: You have interacted with a forbidden board cell... the system will remember this...');
            return;
        };

        board[rowIndex][colIndex] = currentPlayer;
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';

        checkWinStatus(rowIndex, colIndex, winConditionNumber);
    }


    function checkWinStatus(rowIndex, colIndex, winConditionNumber) {
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
                console.log('you won')
            }
        }
    }

    return {showBoard, markCell};
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

    function updateCellUI(e, clickedCellPosition, boardArray) {
        e.target.textContent = 
            boardArray[+e.target.dataset.row][+e.target.dataset.column];
    }

    return {renderBoardUI, giveClickedCellPosition, updateCellUI}
}


function GameCentralProcessingUnit() { // factory function?
    const boardUI = document.querySelector('.board');
    const redoButton = document.querySelector('button.redo');
    const form = document.querySelector('form');

    let boardArray;
    let logicalInteractions; // Object for manipulating underlying game logic
    const UIInteractions = GameUIController(); // Object for handling UI interactions

    form.addEventListener( 'submit', submitEventHandler);
    boardUI.addEventListener('click', cellClickHandler);

    let winConditionNumber;
    function submitEventHandler(e) {
        event.preventDefault();
        const customRow = Number(form.querySelectorAll('input')[0].value);
        const customColumn = Number(form.querySelectorAll('input')[1].value);
        winConditionNumber = Number(form.querySelectorAll('input')[2].value);

        if (
            winConditionNumber > customRow &&
            winConditionNumber > customColumn
        ) {
            console.log(customRow, customColumn, winConditionNumber)
            alert('Win condition number is too high');
            return;
        }

        boardArray = createBoard(customRow, customColumn);
        logicalInteractions = GameLogicController(boardArray);
        UIInteractions.renderBoardUI(boardUI, boardArray);
    }

    function cellClickHandler(e) {
        if (e.target.classList.contains('cell')) {
            const clickedCellPosition = UIInteractions.giveClickedCellPosition(e);
            logicalInteractions.markCell(clickedCellPosition[0], clickedCellPosition[1], winConditionNumber);
            UIInteractions.updateCellUI(e, clickedCellPosition, boardArray);
        }
    }
}

game = GameCentralProcessingUnit();