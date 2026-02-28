(function () {
  const ROWS = 10;
  const COLS = 10;
  const COLORS = 6;
  const STAR_CHARS = ["★", "✦", "✧", "⭐", "☆", "✯"];

  let grid = [];
  let score = 0;
  let combo = 0;
  let isProcessing = false;

  const boardEl = document.getElementById("game-board");
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const gameOverEl = document.getElementById("game-over");
  const finalScoreEl = document.getElementById("final-score");

  function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = Math.floor(Math.random() * COLORS);
      }
    }
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--cols", COLS);
    boardEl.style.setProperty("--rows", ROWS);
    boardEl.style.setProperty("--cell-size", "36px");

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const value = grid[r][c];
        const cell = document.createElement("div");
        if (value === -1) {
          cell.className = "cell cell-empty";
          boardEl.appendChild(cell);
          continue;
        }
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.dataset.color = value;
        cell.textContent = STAR_CHARS[value];
        cell.addEventListener("click", () => onCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  function getConnectedGroup(r, c) {
    const color = grid[r][c];
    if (color === -1) return [];

    const group = [];
    const visited = Array(ROWS)
      .fill(0)
      .map(() => Array(COLS).fill(false));

    function dfs(row, col) {
      if (
        row < 0 ||
        row >= ROWS ||
        col < 0 ||
        col >= COLS ||
        visited[row][col] ||
        grid[row][col] !== color
      ) {
        return;
      }
      visited[row][col] = true;
      group.push({ r: row, c: col });
      dfs(row - 1, col);
      dfs(row + 1, col);
      dfs(row, col - 1);
      dfs(row, col + 1);
    }

    dfs(r, c);
    return group;
  }

  function highlightGroup(group) {
    document.querySelectorAll(".cell.selected").forEach((el) => el.classList.remove("selected"));
    group.forEach(({ r, c }) => {
      const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.add("selected");
    });
  }

  function removeGroup(group) {
    return new Promise((resolve) => {
      group.forEach(({ r, c }) => {
        const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add("eliminating");
      });

      setTimeout(() => {
        group.forEach(({ r, c }) => (grid[r][c] = -1));
        resolve();
      }, 220);
    });
  }

  function addScore(count) {
    combo += 1;
    const points = count * count * 5 + combo * 2;
    score += points;
    scoreEl.textContent = score;
    comboEl.textContent = combo;
  }

  function dropBlocks() {
    for (let c = 0; c < COLS; c++) {
      let write = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c] !== -1) {
          if (r !== write) {
            grid[write][c] = grid[r][c];
            grid[r][c] = -1;
          }
          write--;
        }
      }
    }
  }

  function shiftColumns() {
    let write = 0;
    for (let c = 0; c < COLS; c++) {
      let hasBlock = false;
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][c] !== -1) {
          hasBlock = true;
          break;
        }
      }
      if (hasBlock) {
        if (write !== c) {
          for (let r = 0; r < ROWS; r++) {
            grid[r][write] = grid[r][c];
            grid[r][c] = -1;
          }
        }
        write++;
      }
    }
  }

  function hasValidMove() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === -1) continue;
        const group = getConnectedGroup(r, c);
        if (group.length >= 2) return true;
      }
    }
    return false;
  }

  function showGameOver() {
    finalScoreEl.textContent = score;
    gameOverEl.classList.remove("hidden");
  }

  function onCellClick(r, c) {
    if (isProcessing) return;
    if (grid[r][c] === -1) return;

    const group = getConnectedGroup(r, c);
    if (group.length < 2) return;

    isProcessing = true;
    highlightGroup(group);

    removeGroup(group).then(() => {
      addScore(group.length);
      dropBlocks();
      shiftColumns();
      renderBoard();

      setTimeout(() => {
        isProcessing = false;
        if (!hasValidMove()) {
          showGameOver();
        }
      }, 100);
    });
  }

  function startGame() {
    score = 0;
    combo = 0;
    scoreEl.textContent = "0";
    comboEl.textContent = "0";
    gameOverEl.classList.add("hidden");
    initGrid();
    renderBoard();
  }

  document.getElementById("restart-btn").addEventListener("click", startGame);
  document.getElementById("play-again-btn").addEventListener("click", startGame);

  startGame();
})();
