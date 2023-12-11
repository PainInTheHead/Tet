const rows = 20;
const columns = 10;
const arrFigName = ["T", "Q", "I", "Z", "S", "J", "L"];
let total = 0;
let timeUp = 0.7;
let inputTime;
let timeOutId;

let record = total;

document.addEventListener("DOMContentLoaded", (event) => {
  let savedScrore = localStorage.getItem("record");
  if (!savedScrore) {
    document.getElementById("record").innerText = "0";
  }
  document.getElementById("record").innerText = savedScrore;
});

function changeDifficults() {
  const selectedElement = document.getElementById("difficult");
  const selectedValue = selectedElement.value;

  if (selectedValue === "easy") {
    inputTime = 2000;
  } else if (selectedValue === "medium") {
    inputTime = 1500;
  } else {
    inputTime = 700;
  }

  const targetScroll = document.getElementById("total");
  targetScroll.scrollIntoView({ behavior: "smooth" });

  moveDown();
}

function getRandomIndex(arr) {
  let randomIndex = Math.floor(Math.random() * arrFigName.length);
  return arr[randomIndex];
}

const allMatrxOfFig = {
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],

  Q: [
    [1, 1],
    [1, 1],
  ],

  I: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],

  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],

  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],

  J: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],

  L: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
  ],
};

class Tetris {
  constructor() {
    this.gameArea;
    this.tetobj;
    this.tetArr = [];
    this.isGameOver = false;
    this.render = false;
    this.generationGameArea();
    this.generationObj();
  }

  generationObj() {
    const name = getRandomIndex(arrFigName);
    const matrix = allMatrxOfFig[name];
    const column = 5;
    const nextFigure = getRandomIndex(arrFigName);
    const nextMatrix = allMatrxOfFig[nextFigure];
    const row = -1;
    this.tetobj = {
      name,
      matrix,
      column,
      row,
      nextFigure,
      nextMatrix,
    };
    this.tetArr.push(nextFigure);
  }

  generationGameArea() {
    this.gameArea = [];
    for (let i = 0; i < rows; i++) {
      this.gameArea[i] = [];
      for (let j = 0; j < columns; j++) {
        this.gameArea[i][j] = 0;
      }
    }
  }

  down() {
    this.tetobj.row += 1;
    if (!this.checkOutBorders()) {
      this.tetobj.row -= 1;
      this.stateTetris();
    }
  }

  left() {
    this.tetobj.column -= 1;
    if (!this.checkOutBorders()) {
      this.tetobj.column += 1;
    }
  }

  right() {
    this.tetobj.column += 1;
    if (!this.checkOutBorders()) {
      this.tetobj.column -= 1;
    }
  }

  rotate() {
    let matrixSize;
    let matrix;
    let name;
    if (this.render === true) {
      name = this.tetArr[tetris.tetArr.length - 2];
      matrix = allMatrxOfFig[name];
      matrixSize = matrix.length;
      const rotatedMatrix = rotateMatrix(allMatrxOfFig[name]);
      if (!this.checkOutBorders()) {
        allMatrxOfFig[name] = allMatrxOfFig[name];
      } else {
        allMatrxOfFig[name] = rotatedMatrix;
      }
    } else {
      name = this.tetobj.name;
      matrixSize = this.tetobj.matrix.length;
      matrix = this.tetobj.matrix;
      const rotatedMatrix = rotateMatrix(this.tetobj.matrix);
      this.tetobj.matrix = rotatedMatrix;

      if (!this.checkOutBorders()) {
        this.tetobj.matrix = matrix
      }
    }
  }

  checkOutBorders() {
    let matrixSize;
    let matrix;
    let name;
    if (this.render === true) {
      name = this.tetArr[tetris.tetArr.length - 2];
      matrix = allMatrxOfFig[name];
      matrixSize = matrix.length;
    } else {
      name = this.tetobj.name;
      matrixSize = this.tetobj.matrix.length;
      matrix = this.tetobj.matrix;
    }
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!matrix[row][column]) continue;
        if (this.isTruePosition(row, column)) return false;
        if (this.touching(row, column)) return false;
      }
    }
    return true;
  }

  isTruePosition(row, column) {
    return (
      this.tetobj.column + column < 0 ||
      this.tetobj.column + column >= 10 ||
      this.tetobj.row + row >= 20
    );
  }

  stateTetris() {
    let matrixSize;
    let matrix;
    let name;
    if (this.render === true) {
      name = this.tetArr[tetris.tetArr.length - 2];
      matrix = allMatrxOfFig[name];
      matrixSize = matrix.length;
    } else {
      name = this.tetobj.name;
      matrixSize = this.tetobj.matrix.length;
      matrix = this.tetobj.matrix;
    }
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!matrix[row][column]) continue;
        if (this.outsideTop(row)) {
          this.isGameOver = true;
          if (tetris.isGameOver) {
            gameOver();
            setNewRecord();
          }
          return;
        }

        this.gameArea[this.tetobj.row + row][this.tetobj.column + column] =
          name;
      }
    }
    this.render = true;
    this.filtersOfRows();
    this.generationObj();
    if (!this.isGameOver) {
      this.down();
    }
  }

  outsideTop(row) {
    return this.tetobj.row + row < 0;
  }

  touching(row, column) {
    return this.gameArea[this.tetobj.row + row]?.[this.tetobj.column + column];
  }

  filtersOfRows() {
    const fullRow = this.findFullRows();
    this.removeFullRows(fullRow);
  }

  findFullRows() {
    const fullRow = [];
    for (let row = 0; row < 20; row++) {
      if (this.gameArea[row].every((cell) => Boolean(cell))) {
        fullRow.push(row);
      }
    }
    return fullRow;
  }

  removeFullRows(fullRow) {
    fullRow.forEach((row) => {
      total += 100;
      document.getElementById("total").innerText = total;
      this.removeRow(row);
    });
  }

  removeRow(removeThis) {
    for (let row = removeThis; row > 0; row--) {
      this.gameArea[row] = this.gameArea[row - 1];
    }
    this.gameArea[0] = new Array(10).fill(0);
  }
}

const tetris = new Tetris();
console.log(tetris.gameArea);

const cells = document.querySelectorAll(".grid>div");
const cellsNext = document.querySelectorAll(".gridNext>div");

keysPosition();

function keysPosition() {
  document.addEventListener("keydown", swicthKey);
}

function moveDown() {
  tetris.down();
  paintInt();
  stopDown();
  startDown();
}

function gameOver() {
  alert("GAME OVER");
  stopDown();
  document.removeEventListener("keydown", swicthKey);
}

function setNewRecord() {
  let newRecord = localStorage.getItem("record");
  if (newRecord) {
    let record = parseInt(newRecord);
    if (record < total) {
      record = total;
      localStorage.setItem("record", record.toString());
      document.getElementById("record").innerText =
        localStorage.getItem("record");
    }
  } else if (!newRecord) {
    let record = parseInt(newRecord);
    record = total;
    localStorage.setItem("record", record.toString());
    document.getElementById("record").innerText = ocalStorage.getItem("record");
  }
}

let time = 1000;

function startDown() {
  timeOutId = setTimeout(() => {
    moveDown();
  }, inputTime);
}

function stopDown() {
  clearTimeout(timeOutId);
}

setTimeout(() => {
  startDown = undefined;
  startDown = function () {
    timeOutId = setTimeout(() => {
      moveDown();
    }, inputTime - 500);
  };
}, 10000);

function moveLeft() {
  tetris.left();
  paintInt();
}

function moveRight() {
  tetris.right();
  paintInt();
}

function moveRotate() {
  tetris.rotate();
  paintInt();
}

function rotateMatrix(matrix) {
  const matrixSize = matrix.length;
  const newMatrix = [];
  for (let row = 0; row < matrixSize; row++) {
    newMatrix[row] = [];
    for (let column = 0; column < matrixSize; column++) {
      newMatrix[row][column] = matrix[matrixSize - column - 1][row];
    }
  }
  return newMatrix;
}

function swicthKey(e) {
  switch (e.code) {
    case "KeyS":
      moveDown();
      break;
    case "KeyA":
      moveLeft();
      break;
    case "KeyD":
      moveRight();
      break;
    case "KeyW":
      moveRotate();
      break;

    default:
      break;
  }
}

function paintInt() {
  cells.forEach((cell) => cell.removeAttribute("class"));
  cellsNext.forEach((cell) => cell.removeAttribute("class"));
  renderNext();
  paintArea();
  paint();
}

function renderNext() {
  const name = tetris.tetobj.nextFigure;
  const matrixSize = tetris.tetobj.nextMatrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetris.tetobj.nextMatrix[row][column]) continue;
      const cellNIndex = getNextIndexHtml(row, column);
      cellsNext[cellNIndex].classList.add(name);
    }
  }
}

function paint() {
  let matrixSize;
  let name;
  let matrix;
  if (tetris.render === true) {
    name = tetris.tetArr[tetris.tetArr.length - 2];
    matrix = allMatrxOfFig[name];
    matrixSize = matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (!matrix[row][col]) continue;
        if (matrix[row][col] < 0) continue;
        const cellIndex = getIndexHtml(
          row + tetris.tetobj.row,
          col + tetris.tetobj.column
        );
        cells[cellIndex].classList.add(name);
      }
    }
  } else {
    matrixSize = tetris.tetobj.matrix.length;
    name = tetris.tetobj.name;
    matrix = tetris.tetobj.matrix;

    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (!matrix[row][col]) continue;
        if (matrix[row][col] < 0) continue;
        const cellIndex = getIndexHtml(
          row + tetris.tetobj.row,
          col + tetris.tetobj.column
        );
        cells[cellIndex].classList.add(name);
      }
    }
  }
}

function paintArea() {
  for (let row = 0; row < 20; row++) {
    for (let column = 0; column < 10; column++) {
      if (!tetris.gameArea[row][column]) continue;
      const name = tetris.gameArea[row][column];
      const cellIndex = getIndexHtml(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function getIndexHtml(r, c) {
  return r * 10 + c;
}

function getNextIndexHtml(r, c) {
  return r * 4 + c;
}
