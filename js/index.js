/* screen controls */

/* colors */
const BLACK = "transparent";
const PRIM = "var(--primary)";
const PRIM_DARK = "var(--primary-dark)";
const SECONDARY = "var(--secondary)";
const FOOD = "var(--food)";

function pixel(x, y) {
    return document.querySelector(`#row-${y} #col-${x}`);
}

function on(x, y, color) {
    pixel(x, y).style.background = color;
}

function off(x, y) {
    pixel(x, y).style.background = BLACK;
}

function blink(x, y, color) {
    let curColor = pixel(x, y).style.background;
    on(x, y, color);
    setTimeout(() => {
        on(x, y, curColor);
    }, tickDur / 2);
}

function blinkBacklight(color) {
    let machine = document.querySelector('main');
    if (color === PRIM) {
        machine.classList.add('backlit-primary');
        setTimeout(() => {
            machine.classList.remove('backlit-primary');
        }, 50);
    } else {
        machine.classList.add('backlit-secondary');
        setTimeout(() => {
            machine.classList.remove('backlit-secondary');
        }, 50);
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        if (i % 2 == 0) {
            on(snake[i][0], snake[i][1], PRIM);
        } else {
            on(snake[i][0], snake[i][1], PRIM_DARK);
        }
    }
}


/* game mechanics */

/* initial values */
const LEN_START = 4;
const X_START = 7;
const Y_START = 8;
const SCORE_START = 0;

/* game state */
let intervalID = null;
let block = false; // do not allow keyboard input
let score = SCORE_START;
const POINTS_PER_FOOD = 256;

let direction = 'e'; // direction of movement
let inputs = []; // stack of user key strokes
let snake = []; // each pixel of snake's body
let food = []; // coords of food

/* game tick duration */
let TICK_DUR_START = 150;
let tickDur = TICK_DUR_START;

function clear() {
    clearInterval(intervalID);
    score = SCORE_START;
    direction = 'e';
    inputs = [];
    snake = [];
    food = [];
    tickDur = TICK_DUR_START;
    document.getElementById('score-counter').innerText = "";
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            off(i + 1, j + 1);
        }
    }
}

function getHead() {
    return snake[0];
}

function addSeg(x, y) {
    snake.unshift([x, y]);
}

function delSeg() {
    let seg = snake.pop();
    off(seg[0], seg[1]);
}

function placeFood(x, y) {
    food = [x, y];
    on(x, y, FOOD);
}

function spawnFood() {
    newFoodX = Math.floor(Math.random() * 16) + 1;
    newFoodY = Math.floor(Math.random() * 16) + 1;
    newFoodOnSnake = false;
    for (let i = 0; i < snake.length; i++) {
        if (snake[i][0] === newFoodX && snake[i][1] === newFoodY) {
            newFoodOnSnake = true;
        }
    }
    if (newFoodOnSnake) {
        spawnFood();
    } else {
        placeFood(newFoodX, newFoodY);
    }
}

function eat(x, y) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i][0] === x && snake[i][1] === y) {
            die();
        }
    }
    addSeg(x, y);
    if (getHead()[0] === food[0] && getHead()[1] === food[1]) {
        blinkBacklight(SECONDARY);
        tickDur -= 1;
        clearInterval(intervalID);
        intervalID = setInterval(tick, tickDur);
        spawnFood();
        return true;
    } else {
        delSeg();
        return false;
    }
}

function tick() {
    let x = snake[0][0];
    let y = snake[0][1];
    let newDirection = inputs.shift();
    if (newDirection) {
        if (
            direction == 'n' && newDirection != 's' ||
            direction == 's' && newDirection != 'n' ||
            direction == 'e' && newDirection != 'w' ||
            direction == 'w' && newDirection != 'e'
        ) {
            direction = newDirection;
        }
    }

    if (direction == 'n') {
        if (y == 1) {
            y = 16;
        } else {
            y -= 1;
        }
    } else if (direction == 's') {
        if (y == 16) {
            y = 1;
        } else {
            y += 1;
        }
    } else if (direction == 'e') {
        if (x == 16) {
            x = 1;
        } else  {
            x += 1;
        }
    } else {
        if (x == 1) {
            x = 16;
        } else {
            x -= 1;
        }
    }
    let ate = eat(x, y);
    drawSnake();
    if (ate) {
        blink(getHead()[0], getHead()[1], SECONDARY);
    }
}

function initControls() {
    document.onkeydown = (key) => {
        if (!block) {
            key = key.key || key.keyCode;
            if (key == '8') {
                inputs.push('n');
            } else if (key == '5') {
                inputs.push('s');
            } else if (key == '6') {
                inputs.push('e');
            } else if (key == '4') {
                inputs.push('w');
            } else {
            }
        }
    }

    let xDown = null;
    let yDown = null;
    let xUp = null;
    let yUp = null;

    document.addEventListener('touchstart', (e) => {
        xDown = e.touches[0].screenX;
        yDown = e.touches[0].screenY;
    });

    document.addEventListener('touchmove', (e) => {
        xUp = e.touches[0].screenX;
        yUp = e.touches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
        if (!block && xDown && yDown && xUp && yUp) {
            xDelta = xDown - xUp;
            yDelta = yDown - yUp;

            if (Math.abs(xDelta) > Math.abs(yDelta)) {
                if (xDelta > 0) {
                    inputs.push('w');
                } else {
                    inputs.push('e');
                }
            } else {
                if (yDelta > 0) {
                    inputs.push('n');
                } else {
                    inputs.push('s');
                }
            }
        }
    });
}


/* general game states */
function controls() {
    document.getElementById('start').classList.add('hide');
    document.getElementById('controls').classList.remove('hide');
}

function play() {
    if (!block) {
        block = true;
        clear();
        document.getElementById('screen').classList.add('hide-cursor');
        document.getElementById('game').classList.remove('hide');
        document.getElementById('score').classList.add('hide');
        document.getElementById('controls').classList.add('hide');
        setTimeout(() => {
            init();
        }, 2000);
    }
}

function init() {
    let totalTime = LEN_START;

    for (let i = 0; i < LEN_START; i++) {
        setTimeout(() => {
            addSeg(X_START - LEN_START + i + 1, Y_START);
            drawSnake();
        }, tickDur * i);
    }

    setTimeout(() => {
        blink(X_START, Y_START, PRIM_DARK);
        setTimeout(() => {
            blink(X_START, Y_START, PRIM_DARK);
            setTimeout(() => {
                blink(X_START, Y_START, PRIM_DARK);
            }, tickDur);
        }, tickDur);
    }, tickDur * (totalTime += 10));

    setTimeout(() => {
        placeFood(X_START + 5, Y_START);
    }, tickDur * (totalTime += 10));

    setTimeout(() => {
        blink(X_START + 5, Y_START, SECONDARY);
        setTimeout(() => {
            blink(X_START + 5, Y_START, SECONDARY);
            setTimeout(() => {
                blink(X_START + 5, Y_START, SECONDARY);
            }, tickDur);
        }, tickDur);
    }, tickDur * (totalTime += 10));

    setTimeout(() => {
        intervalID = setInterval(tick, tickDur);
        block = false;
    }, tickDur * (totalTime += 10));
}

function die() {
    clearInterval(intervalID);
    off(food[0], food[1]);
    blinkBacklight(PRIM);
    tickDur = TICK_DUR_START;

    setTimeout(() => {
        blink(getHead()[0], getHead()[1], SECONDARY);
        setTimeout(() => {
            blink(getHead()[0], getHead()[1], SECONDARY);
            setTimeout(() => {
                blink(getHead()[0], getHead()[1], SECONDARY);
            }, tickDur);
        }, tickDur);
    }, tickDur);

    score = 0;
    document.getElementById('score-counter').innerText = score;
    document.getElementById('score-counter').classList.remove('hide');
    setTimeout(() => {
        for (let i = 1; i < snake.length; i++) {
            setTimeout(() => {
                blink(snake[i][0], snake[i][1], SECONDARY);
                blinkBacklight(SECONDARY);
                score += POINTS_PER_FOOD;
                document.getElementById('score-counter').innerText = score;
                setTimeout(() => {
                    off(snake[i][0], snake[i][1]);
                }, tickDur)
            }, tickDur * i);
        }
        setTimeout(() => {
            gameOver();
        }, tickDur * (snake.length + 10));
    }, tickDur * 10);
}

function gameOver() {
    document.getElementById('screen').classList.remove('hide-cursor');
    document.getElementById('score-counter').classList.add('hide');
    document.getElementById('score').classList.remove('hide');
    document.getElementById('game').classList.add('hide');
    document.getElementById('score-total').innerText = score;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('start').classList.toggle('hide');
    }, 2000);
    initControls();
});
