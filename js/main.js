/* screen controls */

/* colors */
const BLACK = "transparent";
const TEAL = "var(--teal)";
const TEAL_DARK = "var(--teal-dark)";
const ORANGE = "var(--orange)";
const PINK = "var(--pink)";

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
    }, TICK / 2);
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        if (i % 2 == 0) {
            on(snake[i][0], snake[i][1], TEAL);
        } else {
            on(snake[i][0], snake[i][1], TEAL_DARK);
        }
    }
}


/* game mechanics */

/* initial values */
const LEN_START = 4;
const X_START = 7;
const Y_START = 8;
const SCORE_START = 1000;

/* game state */
let intervalID = null;
let block = false; // do not allow keyboard input
let score = SCORE_START;
const POINTS_PER_FOOD = 150;

let direction = 'e'; // direction of movement
let inputs = []; // stack of user key strokes
let snake = []; // each pixel of snake's body
let food = []; // coords of food

/* game tick duration */
const TICK = 140;

function clear() {
    clearInterval(intervalID);
    snake = [];
    food = [];
    score = SCORE_START;
    direction = 'e';
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
    on(x, y, ORANGE);
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
        score += POINTS_PER_FOOD;
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
        blink(getHead()[0], getHead()[1], PINK);
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
}


/* general game states */
function controls() {
    document.getElementById('menu').classList.add('hide');
    document.getElementById('controls').classList.remove('hide');
}

function play() {
    if (!block) {
        block = true;
        clear();
        document.getElementById('screen').classList.add('hide-cursor');
        document.getElementById('game').classList.remove('hide');
        document.getElementById('game-over').classList.add('hide');
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
        }, TICK * i);
    }

    setTimeout(() => {
        blink(X_START, Y_START, TEAL_DARK);
        setTimeout(() => {
            blink(X_START, Y_START, TEAL_DARK);
            setTimeout(() => {
                blink(X_START, Y_START, TEAL_DARK);
            }, TICK);
        }, TICK);
    }, TICK * (totalTime += 10));

    setTimeout(() => {
        placeFood(X_START + 5, Y_START);
    }, TICK * (totalTime += 10));

    setTimeout(() => {
        blink(X_START + 5, Y_START, PINK);
        setTimeout(() => {
            blink(X_START + 5, Y_START, PINK);
            setTimeout(() => {
                blink(X_START + 5, Y_START, PINK);
            }, TICK);
        }, TICK);
    }, TICK * (totalTime += 10));

    setTimeout(() => {
        initControls();
        intervalID = setInterval(tick, TICK);
        block = false;
    }, TICK * (totalTime += 10));
}

function die() {
    clearInterval(intervalID);

    setTimeout(() => {
        blink(getHead()[0], getHead()[1], PINK);
        setTimeout(() => {
            blink(getHead()[0], getHead()[1], PINK);
            setTimeout(() => {
                blink(getHead()[0], getHead()[1], PINK);
            }, TICK);
        }, TICK);
    }, TICK);

    setTimeout(() => {
        for (let i = 1; i < snake.length; i++) {
            setTimeout(() => {
                blink(snake[i][0], snake[i][1], PINK);
                setTimeout(() => {
                    off(snake[i][0], snake[i][1]);
                }, TICK)
            }, TICK * i);
        }
        setTimeout(() => {
            gameOver();
        }, TICK * (snake.length + 10));
    }, TICK * 10);
}

function gameOver() {
    document.getElementById('screen').classList.remove('hide-cursor');
    document.getElementById('game-over').classList.remove('hide');
    document.getElementById('game').classList.add('hide');
    document.getElementById('score').innerText = score;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('menu').classList.toggle('hide');
    }, 2000);
});