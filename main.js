// Constants
const FPS = 15;

const CELL_SIZE = 10;

const UP_ARROW = 'ArrowUp';
const DOWN_ARROW = 'ArrowDown';
const LEFT_ARROW = 'ArrowLeft';
const RIGHT_ARROW = 'ArrowRight';
const SPACE_BAR = 'Space';

const DIRECTION_RIGHT = 'right';
const DIRECTION_LEFT = 'left';
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';

const APPLE_COLOUR = 'red';
const BACKGROUND_COLOUR = 'black';
const SNAKE_COLOUR = 'green';

const DEAD_TEXT = "You died, press SPACE to start again.";
const PAUSED_TEXT = "Paused, press SPACE to resume.";
const START_TEXT = "Welcome to snake, press SPACE to start.";

// Game state
let snake;
let apple;
let isPaused = true;
let isDead = false;
let isStarted = false;
let direction = DIRECTION_RIGHT;

// HTML Elements
const canvas = document.getElementById('main');
const context = canvas.getContext('2d');

function main() {
    if (! isDead) {
        clearGrid();
        updateValues();
        drawFrame();
    }
}

function updateValues() {
    if (! isPaused) {
        snake.direction = direction;
        snake.move();
        if (checkIfHitWall() || checkIfHitSelf()) {
            playerDied();
        } else {
            checkIfHitApple();
        }
    }
}

function drawFrame() {
    drawGrid();
    apple.draw();
    snake.draw();
    updateText();
}

function createRect(x, y, width, height, colour) {
    context.fillStyle = colour
    context.fillRect(x, y, width, height)
}

function checkIfHitWall() {
    const snakeHead = snake.getHead();

    return snakeHead.x === -CELL_SIZE || snakeHead.x === canvas.width || snakeHead.y === -CELL_SIZE || snakeHead.y === canvas.height;
}

function checkIfHitSelf() {
    const snakeHead = snake.getHead();

    for (let i = 0; i < (snake.tail.length - 1); i++) {
        if (snake.tail[i].x === snakeHead.x && snake.tail[i].y === snakeHead.y) {
            return true;
        }
    }

    return false;
}

function checkIfHitApple() {
    const snakeHead = snake.getHead();

    if (snakeHead.x === apple.x && snakeHead.y === apple.y) {
        snake.addToTail({x: apple.x, y: apple.y});
        apple = new Apple();
    }
}

function playerDied() {
    isDead = true;

    // restore previously removed cell to prevent snake appearing off-screen
    snake.tail.pop();
    snake.tail.unshift(snake.lastRemovedCell);
}

function newGame() {
    snake = new Snake(canvas.width / 2, canvas.height / 2);
    apple = new Apple();
}

function drawGrid() {
    createRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
}

function clearGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function updateText() {
    const score = snake.tail.length - 1;
    const scoreText = `Score: ${score}`;

    drawCenteredText(scoreText, 18);

    if (! isStarted) {
        drawCenteredText(START_TEXT, 40);
    } else if (isDead) {
        drawCenteredText(DEAD_TEXT, 40);
    } else if (isPaused) {
        drawCenteredText(PAUSED_TEXT, 40);
    }
}

function drawCenteredText(text, y) {
    context.font = "20px Arial";
    context.fillStyle = "#00FF42";
    context.fillText(text, (canvas.width / 2) - (text.length * 4.5), y);
}

function handleInput(event) {
    switch (event.code) {
        case RIGHT_ARROW:
            if (snake.direction !== DIRECTION_LEFT) {
                direction = DIRECTION_RIGHT;
            }
            break;

        case LEFT_ARROW:
            if (snake.direction !== DIRECTION_RIGHT) {
                direction = DIRECTION_LEFT;
            }
            break;

        case DOWN_ARROW:
            if (snake.direction !== DIRECTION_UP) {
                direction = DIRECTION_DOWN;
            }
            break;

        case UP_ARROW:
            if (snake.direction !== DIRECTION_DOWN) {
                direction = DIRECTION_UP;
            }
            break;

        case SPACE_BAR:
            if (! isDead) {
                isPaused = ! isPaused;
            }
            if (! isStarted) {
                isStarted = true;
            }
            if (isDead) {
                isDead = false;
                newGame();
            }

            break;
    }
}

function boot() {
    newGame();
    (new AnimationFrameFpsLimiter(FPS, main)).start();
}

class Snake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tail = [{x: this.x, y: this.y}];
        this.direction = direction;
        this.lastRemovedCell = null;
    }

    draw() {
        for (let i = 0; i < this.tail.length; i++){
            createRect(
                this.tail[i].x,
                this.tail[i].y,
                CELL_SIZE,
                CELL_SIZE,
                SNAKE_COLOUR,
            );
        }
    }

    move() {
        const snakeHead = this.getHead();
        this.lastRemovedCell = this.tail.shift();
        let newCell;

        switch (this.direction) {
            case DIRECTION_RIGHT:
                newCell = {
                    x: snakeHead.x + CELL_SIZE,
                    y: snakeHead.y,
                };
                break;

            case DIRECTION_LEFT:
                newCell = {
                    x: snakeHead.x - CELL_SIZE,
                    y: snakeHead.y,
                };
                break;

            case DIRECTION_DOWN:
                newCell = {
                    x: snakeHead.x,
                    y: snakeHead.y + CELL_SIZE,
                };
                break;

            case DIRECTION_UP:
                newCell = {
                    x: snakeHead.x,
                    y: snakeHead.y - CELL_SIZE,
                };
                break;
        }

        this.addToTail(newCell);
    }

    getHead() {
        return this.tail[this.tail.length - 1];
    }

    addToTail(newCell) {
        this.tail.push(newCell);
    }
}

class Apple {
    constructor() {
        let isColliding;
        do {
            this.x = Math.floor(Math.random() * canvas.width / CELL_SIZE) * CELL_SIZE;
            this.y = Math.floor(Math.random() * canvas.height / CELL_SIZE) * CELL_SIZE;
            isColliding = false;

            for (let i = 0; i < snake.tail.length; i++) {
                if (snake.tail[i].x === this.x && snake.tail[i].y === this.y) {
                    isColliding = true;
                }
            }
        } while (isColliding);
    }

    draw() {
        createRect(this.x, this.y, CELL_SIZE, CELL_SIZE, APPLE_COLOUR);
    }
}

class AnimationFrameFpsLimiter {
    constructor(fps = 60, callback) {
        this.requestID = 0;
        this.fps = fps;
        this.callback = callback;
    }

    start() {
        let then = performance.now();
        const interval = 1000 / this.fps;
        const tolerance = 0.1;

        const callbackLoop = (now) => {
            this.requestID = requestAnimationFrame(callbackLoop);
            const delta = now - then;

            if (delta >= interval - tolerance) {
                then = now - (delta % interval);
                this.callback();
            }
        };
        this.requestID = requestAnimationFrame(callbackLoop);
    }

    stop() {
        cancelAnimationFrame(this.requestID);
    }
}

window.addEventListener('load', boot);
window.addEventListener('keydown', handleInput);
