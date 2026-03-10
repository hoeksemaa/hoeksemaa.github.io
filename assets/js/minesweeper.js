(function () {
  var TILE_MIN = 48;
  var BASE_BOMBS = 10;

  var grid, cols, rows, bombCount, gameOver, firstClick, revealedCount, totalSafe;
  var container, modal, modalInner;
  var pendingTimeouts = [];

  function init() {
    clearTimeouts();
    container = document.getElementById('minesweeper');
    modal = document.getElementById('ms-modal');
    modalInner = document.getElementById('ms-modal-inner');
    modal.classList.remove('active');
    gameOver = false;
    firstClick = true;
    revealedCount = 0;
    computeDimensions();
    generateBoard();
    render();
  }

  function clearTimeouts() {
    for (var i = 0; i < pendingTimeouts.length; i++) {
      clearTimeout(pendingTimeouts[i]);
    }
    pendingTimeouts = [];
  }

  function computeDimensions() {
    var wrap = document.getElementById('minesweeper-wrap');
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    cols = Math.max(2, Math.floor(w / TILE_MIN));
    rows = Math.min(3, Math.max(2, Math.floor(h / TILE_MIN)));
    var totalCells = cols * rows;
    bombCount = Math.min(BASE_BOMBS, Math.max(3, Math.floor(totalCells * 0.15)));
    totalSafe = totalCells - bombCount;
  }

  function generateBoard() {
    grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) {
        grid[r][c] = { bomb: false, revealed: false, flagged: false, adjacent: 0 };
      }
    }
    var placed = 0;
    while (placed < bombCount) {
      var r = Math.floor(Math.random() * rows);
      var c = Math.floor(Math.random() * cols);
      if (!grid[r][c].bomb) {
        grid[r][c].bomb = true;
        placed++;
      }
    }
    computeAdjacency();
  }

  function computeAdjacency() {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].bomb) continue;
        var count = 0;
        forNeighbors(r, c, function (nr, nc) {
          if (grid[nr][nc].bomb) count++;
        });
        grid[r][c].adjacent = count;
      }
    }
  }

  function forNeighbors(r, c, fn) {
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = r + dr;
        var nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          fn(nr, nc);
        }
      }
    }
  }

  function ensureSafeFirst(r, c) {
    while (grid[r][c].bomb) {
      generateBoard();
    }
  }

  function render() {
    container.innerHTML = '';
    var wrap = document.getElementById('minesweeper-wrap');
    var cellW = Math.floor(wrap.clientWidth / cols);
    container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    container.style.gridTemplateRows = 'repeat(' + rows + ', ' + cellW + 'px)';
    wrap.style.height = (rows * cellW + (rows - 1) * 2) + 'px';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement('div');
        cell.className = 'ms-slot';

        var content = document.createElement('span');
        content.className = 'ms-content';
        var cellData = grid[r][c];
        if (cellData.bomb) {
          content.textContent = '\u25CF';
          content.classList.add('ms-bomb');
        } else if (cellData.adjacent > 0) {
          content.textContent = cellData.adjacent;
          content.classList.add('ms-num');
          content.setAttribute('data-num', cellData.adjacent);
        }

        var tile = document.createElement('button');
        tile.className = 'ms-cell';
        tile.setAttribute('data-r', r);
        tile.setAttribute('data-c', c);

        cell.appendChild(content);
        cell.appendChild(tile);
        container.appendChild(cell);
      }
    }

    container.onclick = handleClick;
    container.oncontextmenu = handleRightClick;
  }

  function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    var tile = e.target;
    if (!tile.classList.contains('ms-cell') || tile.classList.contains('revealed')) return;

    var r = parseInt(tile.getAttribute('data-r'), 10);
    var c = parseInt(tile.getAttribute('data-c'), 10);
    grid[r][c].flagged = !grid[r][c].flagged;
    tile.classList.toggle('flagged');
  }

  function handleClick(e) {
    if (gameOver) return;
    var tile = e.target;
    if (!tile.classList.contains('ms-cell') || tile.classList.contains('revealed')) return;

    var r = parseInt(tile.getAttribute('data-r'), 10);
    var c = parseInt(tile.getAttribute('data-c'), 10);

    if (grid[r][c].flagged) return;

    if (firstClick) {
      ensureSafeFirst(r, c);
      firstClick = false;
      render();
      // re-grab the tile after re-render
      tile = container.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
    }

    if (grid[r][c].bomb) {
      doGameOver(r, c);
      return;
    }

    if (grid[r][c].adjacent === 0) {
      floodFill(r, c);
    } else {
      revealOne(r, c);
    }

    if (revealedCount >= totalSafe) {
      doVictory();
    }
  }

  function revealOne(r, c) {
    if (grid[r][c].revealed) return;
    grid[r][c].revealed = true;
    revealedCount++;
    var tile = container.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
    if (tile) tile.classList.add('revealed');
  }

  function floodFill(startR, startC) {
    var queue = [{ r: startR, c: startC, depth: 0 }];
    var visited = {};
    visited[startR + ',' + startC] = true;

    var waves = [];

    while (queue.length > 0) {
      var item = queue.shift();
      var r = item.r;
      var c = item.c;
      var d = item.depth;

      if (!waves[d]) waves[d] = [];
      waves[d].push({ r: r, c: c });

      if (grid[r][c].adjacent === 0) {
        forNeighbors(r, c, function (nr, nc) {
          var key = nr + ',' + nc;
          if (!visited[key] && !grid[nr][nc].revealed && !grid[nr][nc].bomb) {
            visited[key] = true;
            queue.push({ r: nr, c: nc, depth: d + 1 });
          }
        });
      }
    }

    for (var w = 0; w < waves.length; w++) {
      (function (wave, delay) {
        var t = setTimeout(function () {
          for (var i = 0; i < wave.length; i++) {
            revealOne(wave[i].r, wave[i].c);
          }
          if (revealedCount >= totalSafe && !gameOver) {
            doVictory();
          }
        }, delay);
        pendingTimeouts.push(t);
      })(waves[w], w * 30);
    }
  }

  function doVictory() {
    gameOver = true;
    var bombs = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].bomb) bombs.push({ r: r, c: c });
      }
    }
    for (var i = 0; i < bombs.length; i++) {
      (function (b, delay) {
        var t = setTimeout(function () {
          var tile = container.querySelector('[data-r="' + b.r + '"][data-c="' + b.c + '"]');
          if (tile) {
            tile.classList.add('revealed', 'victory-reveal');
          }
        }, delay);
        pendingTimeouts.push(t);
      })(bombs[i], i * 60);
    }
    var t = setTimeout(function () {
      showModal(true);
    }, bombs.length * 60 + 300);
    pendingTimeouts.push(t);
  }

  function doGameOver(clickedR, clickedC) {
    gameOver = true;
    var bombs = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].bomb) {
          var dist = Math.abs(r - clickedR) + Math.abs(c - clickedC);
          bombs.push({ r: r, c: c, dist: dist });
        }
      }
    }
    bombs.sort(function (a, b) { return a.dist - b.dist; });

    for (var i = 0; i < bombs.length; i++) {
      (function (b, delay) {
        var t = setTimeout(function () {
          var tile = container.querySelector('[data-r="' + b.r + '"][data-c="' + b.c + '"]');
          if (tile) tile.classList.add('revealed');
        }, delay);
        pendingTimeouts.push(t);
      })(bombs[i], i * 80);
    }

    var t = setTimeout(function () {
      showModal(false);
    }, bombs.length * 80 + 400);
    pendingTimeouts.push(t);
  }

  function showModal(won) {
    gameOver = true;
    modalInner.innerHTML =
      '<h2 style="color:' + (won ? '#00FF66' : '#FF2222') + '">' + (won ? 'MINEFIELD CLEARED!' : 'YOU BLEW UP!') + '</h2>' +
      '<button id="ms-restart">Play Again</button>';
    modal.classList.add('active');
    document.getElementById('ms-restart').onclick = function () {
      modal.classList.remove('active');
      init();
    };
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var wrap = document.getElementById('minesweeper-wrap');
      var newCols = Math.max(2, Math.floor(wrap.clientWidth / TILE_MIN));
      var newRows = Math.min(3, Math.max(2, Math.floor(wrap.clientHeight / TILE_MIN)));
      if (newCols !== cols || newRows !== rows) {
        init();
      }
    }, 250);
  });

  document.addEventListener('DOMContentLoaded', init);
})();
