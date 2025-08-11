document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Game variables
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150; // milliseconds
    let gameInterval;
    let gameRunning = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    
    // Initialize high score display
    highScoreElement.textContent = highScore;
    
    // Initialize game
    function initGame() {
        // Create initial snake (3 segments)
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // Generate initial food
        generateFood();
        
        // Reset game state
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameSpeed = 150;
        
        // Draw initial state
        draw();
    }
    
    // Generate food at random position
    function generateFood() {
        // Generate random coordinates
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * gridWidth);
            foodY = Math.floor(Math.random() * gridHeight);
            
            // Check if food is not on snake
            validPosition = true;
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        food = {x: foodX, y: foodY};
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50'; // Green head
            } else {
                ctx.fillStyle = '#8BC34A'; // Lighter green body
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Add a border to make segments distinct
            ctx.strokeStyle = '#222';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
        
        // Draw food
        ctx.fillStyle = '#FF5722'; // Orange food
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Update game state
    function update() {
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for collisions
        if (checkCollision(head)) {
            gameOver();
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Generate new food
            generateFood();
            
            // Increase game speed slightly
            if (gameSpeed > 50) {
                gameSpeed -= 5;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // Remove tail if snake didn't eat
            snake.pop();
        }
        
        // Draw updated state
        draw();
    }
    
    // Check for collisions
    function checkCollision(head) {
        // Check wall collision
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            return true;
        }
        
        // Check self collision (skip the last segment as it will be removed)
        for (let i = 0; i < snake.length - 1; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = 'Start Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Game loop
    function gameLoop() {
        update();
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', (event) => {
        if (!gameRunning) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
    
    // Start/Pause button
    startButton.addEventListener('click', () => {
        if (gameRunning) {
            // Pause game
            clearInterval(gameInterval);
            gameRunning = false;
            startButton.textContent = 'Resume Game';
        } else {
            // Start or resume game
            if (snake.length === 0) {
                initGame();
            }
            gameInterval = setInterval(gameLoop, gameSpeed);
            gameRunning = true;
            startButton.textContent = 'Pause Game';
        }
    });
    
    // Reset button
    resetButton.addEventListener('click', () => {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = 'Start Game';
        initGame();
    });
    
    // Initialize game on load
    initGame();
});