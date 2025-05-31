const canvas = document.getElementById('main');
const context = canvas.getContext('2d');

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

const DEFAULT_DIRECTION = DIRECTION_RIGHT;

const APPLE_COLOUR = 'red';
const BACKGROUND_COLOUR = 'black';
const SNAKE_COLOUR = 'green';

let snake;
let apple;
let isPaused = true;
let isDead = false;

function main() {
    if (! isDead) {
        updateValues();
        drawFrame();
    }

    setTimeout(() => requestAnimationFrame(main), 1000 / FPS);
}

function updateValues() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (! isPaused) {
        snake.move();
        checkIfHitWall();
        checkIfHitSelf();

        if (shouldEatApple()) {
            eatApple();
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

function shouldEatApple() {
    return snake.tail[snake.tail.length - 1].x === apple.x
        && snake.tail[snake.tail.length - 1].y === apple.y;
}

function eatApple() {
    snake.tail[snake.tail.length] = {x: apple.x, y: apple.y};
    apple = new Apple();
}

function checkIfHitWall() {
    let headTail = snake.tail[snake.tail.length -1];

    if (headTail.x === -CELL_SIZE || headTail.x === canvas.width || headTail.y === -CELL_SIZE || headTail.y === canvas.height) {
        playerDied();
    }
}

function checkIfHitSelf() {
    let headTail = snake.tail[snake.tail.length -1];

    for (let i = 0; i < (snake.tail.length - 1); i++) {
        if (snake.tail[i].x === headTail.x && snake.tail[i].y === headTail.y) {
            playerDied();
        }
    }
}

function playerDied() {
    isDead = true;
}

function init() {
    snake = new Snake(canvas.width / 2, canvas.height / 2);
    apple = new Apple();
}

function updateText() {
    const score = snake.tail.length - 1;
    const text = `Score: ${score}`;
    const deadText = "You died, press SPACE to start again.";
    const pausedText = "Paused, press SPACE to resume.";
    context.font = "20px Arial";
    context.fillStyle = "#00FF42";
    context.fillText(text, (canvas.width / 2) - (text.length*4.5), 18);

    if (isDead) {
        context.fillText(deadText, (canvas.width / 2) - (deadText.length*4.5), 40);
    } else if (isPaused) {
        context.fillText(pausedText, (canvas.width / 2) - (pausedText.length*4.5), 40);
    }
}

window.addEventListener('keydown', (event) => {
    setTimeout(() => {
        switch (event.code) {
            case RIGHT_ARROW:
                if (snake.direction !== DIRECTION_LEFT) {
                    snake.direction = DIRECTION_RIGHT;
                }
                break;

            case LEFT_ARROW:
                if (snake.direction !== DIRECTION_RIGHT) {
                    snake.direction = DIRECTION_LEFT;
                }
                break;

            case DOWN_ARROW:
                if (snake.direction !== DIRECTION_UP) {
                    snake.direction = DIRECTION_DOWN;
                }
                break;

            case UP_ARROW:
                if (snake.direction !== DIRECTION_DOWN) {
                    snake.direction = DIRECTION_UP;
                }
                break;

            case SPACE_BAR:
                isPaused = ! isPaused;
                if (isDead) {
                    isDead = false;
                    init();
                }
                break;
        }
    }, 1000 / FPS);
})

function drawGrid() {
    createRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOUR);
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
        let newRect;
        switch (this.direction) {
            case DIRECTION_RIGHT:
                newRect = {
                    x: this.tail[this.tail.length - 1].x + CELL_SIZE,
                    y: this.tail[this.tail.length - 1].y,
                };
                break;

            case DIRECTION_LEFT:
                newRect = {
                    x: this.tail[this.tail.length - 1].x - CELL_SIZE,
                    y: this.tail[this.tail.length - 1].y,
                };
                break;

            case DIRECTION_DOWN:
                newRect = {
                    x: this.tail[this.tail.length - 1].x,
                    y: this.tail[this.tail.length - 1].y + CELL_SIZE,
                };
                break;

            case DIRECTION_UP:
                newRect = {
                    x: this.tail[this.tail.length - 1].x,
                    y: this.tail[this.tail.length - 1].y - CELL_SIZE,
                };
                break;
        }


        this.tail.shift();
        this.tail.push(newRect);
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

window.addEventListener('load', () => {
    init();
    requestAnimationFrame(main);
})