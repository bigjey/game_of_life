(function() {
  var params = {
    cellSize: 10,
    chance: 10,
    rainbow: 1,
    trail: 1
  };

  if (location.search.length > 1) {
    var queryParams = location.search
      .substr(1)
      .split("&")
      .map((pair) => pair.split("="))
      .reduce(
        (params, [name, value]) => ((params[name] = parseInt(value)), params),
        {}
      );
    Object.assign(params, queryParams);
  } else {
    var queryString = Object.keys(params)
      .map((name) => `${name}=${params[name]}`)
      .join("&");

    history.replaceState(null, null, `?${queryString}`);
  }

  var W = params.w || (window.innerWidth / params.cellSize) | 0;
  var H = params.h || (window.innerHeight / params.cellSize) | 0;

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  var COLOR_BG = "#000";
  var COLOR_TRAIL = "#111";
  var COLOR_CELL = "#fff";

  canvas.width = params.cellSize * W;
  canvas.height = params.cellSize * H;

  document.body.appendChild(canvas);

  var grid = new Array(H);

  for (var y = 0; y < H; y++) {
    grid[y] = new Array(W);

    for (var x = 0; x < W; x++) {
      var alive = Math.random() <= params.chance / 100 ? 1 : 0;
      var hue = 360 * ((x + y) / (W + H));

      grid[y][x] = {
        trail: 0,
        prev: -1,
        value: alive,
        hue
      };
    }
  }

  function drawGrid() {
    var color, x, y, cell;
    var byColor = {};

    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        cell = grid[y][x];

        if (cell.value === cell.prev) continue;

        color = cell.value
          ? params.rainbow
            ? `hsl(${cell.hue}, 100%, 50%)`
            : COLOR_CELL
          : params.trail && cell.trail
            ? COLOR_TRAIL
            : COLOR_BG;

        if (byColor[color] === undefined) {
          byColor[color] = [];
        }

        byColor[color].push([x, y]);
      }
    }

    for (color in byColor) {
      ctx.fillStyle = color;

      for ([x, y] of byColor[color]) {
        ctx.fillRect(
          x * params.cellSize,
          y * params.cellSize,
          params.cellSize - 1,
          params.cellSize - 1
        );
      }
    }
  }

  function nextGen() {
    var x, y, cell, around, alive;

    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        grid[y][x].prev = grid[y][x].value;
      }
    }

    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        cell = grid[y][x];

        around = neighbours(x, y);
        alive = cell.prev === 1;

        if (around < 2 && alive) {
          cell.value = 0;
        } else if (around > 3 && alive) {
          cell.value = 0;
        } else if (around === 3 && !alive) {
          cell.value = 1;
          cell.trail = 1;
        }
      }
    }
  }

  function neighbours(x, y) {
    var count = 0,
      xx,
      yy;

    for (yy = y - 1; yy <= y + 1; yy++) {
      for (xx = x - 1; xx <= x + 1; xx++) {
        if (
          yy < 0 ||
          xx < 0 ||
          yy > H - 1 ||
          xx > W - 1 ||
          (yy === y && xx === x)
        )
          continue;

        if (grid[yy][xx].prev) {
          count++;
        }
      }
    }

    return count;
  }

  var drawing = false;
  canvas.addEventListener("mousedown", function(e) {
    drawing = true;

    var x = (e.clientX / params.cellSize) | 0;
    var y = (e.clientY / params.cellSize) | 0;

    grid[y][x].prev = 0;
    grid[y][x].value = 1;
    grid[y][x].trail = 1;
  });

  canvas.addEventListener("mouseup", function(e) {
    drawing = false;
  });

  canvas.addEventListener("mousemove", function(e) {
    if (!drawing) return;

    var x = (e.clientX / params.cellSize) | 0;
    var y = (e.clientY / params.cellSize) | 0;

    grid[y][x].prev = 0;
    grid[y][x].value = 1;
    grid[y][x].trail = 1;
  });

  function tick() {
    nextGen();
    drawGrid();

    requestAnimationFrame(tick);
  }

  drawGrid();
  tick();
})();
