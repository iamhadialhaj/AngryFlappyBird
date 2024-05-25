const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startDialog = document.getElementById('startDialog');
const gameOverDialog = document.getElementById('gameOverDialog');
const retryButton = document.getElementById('retryButton');

canvas.width = 320;
canvas.height = 480;

const birdImg = new Image();
birdImg.src = 'https://i.postimg.cc/8F4Nxcmg/bird.png';

const pipeImg = new Image();
pipeImg.src = 'https://i.postimg.cc/R6JpKbFp/pipe.png';

const bird = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    gravity: 0.3,
    lift: -8,
    velocity: 0
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = 120;
let frameCount = 0;
let score = 0;
let gameStarted = false;
let gameOver = false;

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe flipped vertically
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
        ctx.scale(1, -1);
        ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.top / 2, pipeWidth, pipe.top);
        ctx.restore();

        // Draw bottom pipe normally
        ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function updateBird() {
    // Apply acceleration and damping
    bird.velocity += bird.gravity;
    bird.velocity *= 0.9; // Damping factor (adjust as needed)
    bird.y += bird.velocity;

    // Ensure bird stays within canvas bounds
    bird.y = Math.max(0, Math.min(canvas.height - bird.height, bird.y));

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (frameCount % 120 === 0) {
        const top = Math.random() * (canvas.height - pipeGap - 20) + 20;
        const bottom = canvas.height - top - pipeGap;
        pipes.push({ x: canvas.width, top, bottom, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }

        // Improved collision detection (using bounding boxes)
        const birdBox = { x: bird.x, y: bird.y, width: bird.width, height: bird.height };
        const pipeBox = { x: pipe.x, y: 0, width: pipeWidth, height: pipe.top };
        const pipeBottomBox = { x: pipe.x, y: canvas.height - pipe.bottom, width: pipeWidth, height: pipe.bottom };

        if (checkCollision(birdBox, pipeBox) || checkCollision(birdBox, pipeBottomBox)) {
            endGame();
        }

        // Check if the bird has passed the pipe
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
        }
    });
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function endGame() {
    gameOver = true;
    gameOverDialog.style.display = 'block';
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameOverDialog.style.display = 'none';
    gameStarted = false;
    startDialog.style.display = 'block';
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 25);
}

function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawScore();

    updateBird();
    updatePipes();

    frameCount++;
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        // Game over: Show the final score
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
        document.getElementById('finalScore').textContent = `Your Score: ${score}`; // Update the game over dialog
    }
}

startDialog.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startDialog.style.display = 'none';
        gameLoop();
    }
});

canvas.addEventListener('click', () => {
    if (gameStarted) {
        bird.velocity = bird.lift;
    }
});

retryButton.addEventListener('click', () => {
    resetGame();
    gameLoop();
});

// Hide the game over dialog initially
gameOverDialog.style.display = 'none';

// Start the game when the page loads
startDialog.style.display = 'block';