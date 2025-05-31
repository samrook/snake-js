// Constants
const FPS = 20;

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

const DEFAULT_DIRECTION = DIRECTION_RIGHT;

const APPLE_COLOUR = 'red';
const BACKGROUND_COLOUR = 'black';
const SNAKE_COLOUR = 'green';

// Game state
let snake;
let apple;
let isPaused = true;
let isDead = false;
let isStarted = false;
let nextDirection = DEFAULT_DIRECTION;

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
        snake.direction = nextDirection;
        const removedCell = snake.move();
        if (checkIfHitWall() || checkIfHitSelf()) {
            playerDied(removedCell);
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
        snake.tail.push({x: apple.x, y: apple.y});
        apple = new Apple();
    }
}

function playerDied(removedCell) {
    isDead = true;

    // restore previously removed cell to prevent snake appearing off-screen
    snake.tail.pop();
    snake.tail.unshift(removedCell);
}

function init() {
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
    const text = `Score: ${score}`;
    const deadText = "You died, press SPACE to start again.";
    const pausedText = "Paused, press SPACE to resume.";
    const startText = "Welcome to snake, press SPACE to start.";

    drawCenteredText(text, 18);

    if (! isStarted) {
        drawCenteredText(startText, 40);
    } else if (isDead) {
        drawCenteredText(deadText, 40);
    } else if (isPaused) {
        drawCenteredText(pausedText, 40);
    }
}

function drawCenteredText(text, y) {
    context.font = "20px Arial";
    context.fillStyle = "#00FF42";
    context.fillText(text, (canvas.width / 2) - (text.length*4.5), y);
}

function handleInput(event) {
    switch (event.code) {
        case RIGHT_ARROW:
            if (snake.direction !== DIRECTION_LEFT) {
                nextDirection = DIRECTION_RIGHT;
            }
            break;

        case LEFT_ARROW:
            if (snake.direction !== DIRECTION_RIGHT) {
                nextDirection = DIRECTION_LEFT;
            }
            break;

        case DOWN_ARROW:
            if (snake.direction !== DIRECTION_UP) {
                nextDirection = DIRECTION_DOWN;
            }
            break;

        case UP_ARROW:
            if (snake.direction !== DIRECTION_DOWN) {
                nextDirection = DIRECTION_UP;
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
                init();
            }

            break;
    }
}

function startGame() {
    const renderLoop = new AnimationFrame(FPS, main);

    init();
    renderLoop.start();
}

class Snake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tail = [{x: this.x, y: this.y}];
        this.direction = DEFAULT_DIRECTION;
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
        const snakeHead = this.tail[this.tail.length - 1];
        const removedCell = this.tail.shift();
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

        this.tail.push(newCell);

        return removedCell;
    }

    getHead() {
        return this.tail[this.tail.length - 1];
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

class AnimationFrame {
    constructor(fps = 60, animate) {
        this.requestID = 0;
        this.fps = fps;
        this.animate = animate;
    }

    start() {
        let then = performance.now();
        const interval = 1000 / this.fps;
        const tolerance = 0.1;

        const animateLoop = (now) => {
            this.requestID = requestAnimationFrame(animateLoop);
            const delta = now - then;

            if (delta >= interval - tolerance) {
                then = now - (delta % interval);
                this.animate(delta);
            }
        };
        this.requestID = requestAnimationFrame(animateLoop);
    }

    stop() {
        cancelAnimationFrame(this.requestID);
    }
}

window.addEventListener('load', startGame);
window.addEventListener('keydown', handleInput);
