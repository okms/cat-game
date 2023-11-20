const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const LEVEL_WIDTH = 2400;

let camera = {
    x: 0,
    width: canvas.width
};

let characterImage = new Image();
characterImage.src = 'assets/sprites/cat.png'; // Replace with the path to your character image

let bossImage = new Image();
bossImage.src = 'assets/sprites/boss.png'; // Replace with the path to your boss image

let backgroundImage = new Image();
backgroundImage.src = 'assets/sprites/background.png'; // Replace with the actual path to your background image

let doorImage = new Image();
doorImage.src = 'assets/sprites/door.png'; // Replace with the path to your door image

let platformImage = new Image();
platformImage.src = 'assets/sprites/platform.png'; // Replace with the path to your platform image

let character = {
    x: 50,
    y: 550,
    width: 60,
    height: 60,
    color: 'orange',
    speed: 2,
    jumpPower: -5,
    isJumping: false,
    velocityY: 0
};

let boss = {
    width: 90,
    height: 90,
    color: 'red',
    jumpPower: -8,
    isJumping: false,
    velocityY: 0,
    x: LEVEL_WIDTH - 200,
    y: canvas.height - 90,
};

let door = {
    x: LEVEL_WIDTH-100,
    y: canvas.height - 100 - 20,
    width: 100,
    height: 100,
    color: 'blue'
};

let platforms = [];
const numberOfPlatforms = 5; // You can adjust the number of platforms
let gameOver = false;
let gameWon = false;

let keys = {
    right: false,
    left: false,
    up: false,
};

canvas.width = 800;
canvas.height = 600;

// Function to generate platforms
function generatePlatforms() {
    platforms = [];
    let maxHeightJump = 120; // Maximum height the player can jump
    let lastPlatformY = canvas.height - 100; // Start from the bottom

    for (let i = 0; i < numberOfPlatforms; i++) {
        let gapX = 100 + Math.random() * 150; // Horizontal gap between platforms
        let gapY = -50 + Math.random() * maxHeightJump; // Vertical gap (upwards)

        let platform = {
            width: 100, // Fixed width for simplicity
            height: 20, // Fixed height
            x: (i === 0) ? 50 : platforms[i - 1].x + gapX, // First platform or position after the gap from the previous one
            y: Math.max(100, lastPlatformY + gapY) // Ensure it's not too high or too low
        };

        platforms.push(platform);
        lastPlatformY = platform.y;
    }
}


// Event listeners for keyboard input
document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowRight') {
        keys.right = true;
    }
    if (event.code === 'ArrowLeft') {
        keys.left = true;
    }
    if (event.code === 'ArrowUp') {
        keys.up = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowRight') {
        keys.right = false;
    }
    if (event.code === 'ArrowLeft') {
        keys.left = false;
    }
    if (event.code === 'ArrowUp') {
        keys.up = false;
    }
});

function checkPlatformCollision() {
    for (let platform of platforms) {
        if (character.x < platform.x + platform.width &&
            character.x + character.width > platform.x &&
            character.y < platform.y + platform.height &&
            character.y + character.height > platform.y) {
            // Collision detected
            return platform;
        }
    }
    return null;
}

function checkBossCollision() {
    if (character.x < boss.x + boss.width &&
        character.x + character.width > boss.x &&
        character.y < boss.y + boss.height &&
        character.y + character.height > boss.y) {
        // Collision with boss detected
        return true;
    }
    return false;
}

function checkDoorCollision() {
    if (character.x < door.x + door.width &&
        character.x + character.width > door.x &&
        character.y < door.y + door.height &&
        character.y + character.height > door.y) {
        // Collision with door detected
        return true;
    }
    return false;
}

function updateCharacter() {
    // Character movement
    if (keys.right) {
        character.x += character.speed;
        facingLeft = false; // Character is facing right
    }
    if (keys.left) {
        character.x -= character.speed;
        facingLeft = true; // Character is facing left
    }

    // Implement jumping
    if (keys.up && !character.isJumping) {
        character.isJumping = true;
        character.velocityY = character.jumpPower;
    }

    // Apply gravity
    character.y += character.velocityY;
    character.velocityY += 0.2; // gravity

    // Collision detection with platforms
    let platform = checkPlatformCollision();
    if (platform && character.velocityY >= 0) {
        character.isJumping = false;
        character.y = platform.y - character.height;
        character.velocityY = 0;
    }

    // Falling off the platforms
    if (character.y >= canvas.height - character.height && !platform) {
        character.isJumping = false;
        character.y = canvas.height - character.height;
        character.velocityY = 0;
    }

    // Check for collision with the boss
    if (checkBossCollision()) {
        gameOver = true;
    }

    // Check for reaching the door
    if (checkDoorCollision()) {
        gameWon = true;
    }
}

function updateCamera() {
    // Calculate the right edge of the camera view
    let cameraRightEdge = camera.x + camera.width;

    // If the character approaches the right edge of the camera view, move the camera
    if (character.x > cameraRightEdge - 200) { // 200 is the offset from the right edge
        camera.x = Math.min(character.x - (camera.width - 200), LEVEL_WIDTH - camera.width);
    }
    // If the character moves left, adjust the camera to follow but not beyond the level start
    else if (character.x < camera.x + 200) { // 200 is the offset from the left edge
        camera.x = Math.max(character.x - 200, 0);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText("Game Over", canvas.width / 2 - 140, canvas.height / 2);
}

let facingLeft = false; // A new variable to keep track of the character's facing direction

function drawCharacter() {
    ctx.save(); // Save the current context state

    if (facingLeft) {
        // Flip the image horizontally if facing left
        ctx.scale(-1, 1);
        ctx.translate(-character.width, 0);
        ctx.drawImage(characterImage, -character.x, character.y, character.width, character.height);
    } else {
        // Draw the image normally if facing right
        ctx.drawImage(characterImage, character.x, character.y, character.width, character.height);
    }

    ctx.restore(); // Restore the original context state
}

function drawPlatforms() {
    // Draw each platform relative to the camera position
    platforms.forEach(platform => {
        if (platform.x + platform.width > camera.x && platform.x < camera.x + canvas.width) {
            // Only draw platforms that are within the camera view
            ctx.drawImage(platformImage, platform.x - camera.x, platform.y, platform.width, platform.height);
        }
    });
}


// Draw Door Function - considering camera
function drawDoor() {
    ctx.drawImage(doorImage, door.x - camera.x, door.y, door.width, door.height);
}

function drawGameWon() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText("You Win!", canvas.width / 2 - 120, canvas.height / 2);
}

function drawBackground() {
    // The x position to start drawing the background from
    // Ensuring it's always a multiple of the background image width
    let startX = Math.floor(camera.x / backgroundImage.width) * backgroundImage.width;

    // The x position to stop drawing the background
    let endX = startX + canvas.width + backgroundImage.width; // One extra width to cover scrolling

    for (let x = startX; x < endX; x += backgroundImage.width) {
        // Draw each segment of the background
        ctx.drawImage(backgroundImage, x - camera.x, 0, backgroundImage.width, canvas.height);
    }
}


function updateBoss() {
    // Boss jumping mechanics
    if (!boss.isJumping) {
        // Randomly decide to jump
        if (Math.random() < 0.02) { // Adjust probability as needed
            boss.isJumping = true;
            boss.velocityY = boss.jumpPower;
        }
    }

    // Apply gravity to the boss
    boss.y += boss.velocityY;
    boss.velocityY += 0.15; // gravity

    // Landing
    if (boss.y >= 520) {
        boss.isJumping = false;
        boss.y = 520;
        boss.velocityY = 0;
    }
}

// Update the drawBoss function to consider camera position
function drawBoss() {
    ctx.save(); // Save the current context state

    // Flip the image horizontally if facing left
    if (facingLeft) {
        ctx.scale(-1, 1);
        ctx.translate(-boss.x - boss.width - 2 * (boss.x - camera.x), 0);
        ctx.drawImage(bossImage, -boss.x + camera.x, boss.y, boss.width, boss.height);
    } else {
        // Draw the image normally if facing right
        ctx.drawImage(bossImage, boss.x - camera.x, boss.y, boss.width, boss.height);
    }

    ctx.restore(); // Restore the original context state
}

function gameLoop() {
    updateCamera(); // Update the camera each frame based on character position

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Draw the background with camera adjustment
    if (!gameOver && !gameWon) {
        drawPlatforms();
        updateCharacter();
        drawCharacter();
        updateBoss();
        drawBoss();
        drawDoor();
    } else if (gameWon) {
        drawGameWon();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}


// Modify the keydown event listener to handle game restart
document.addEventListener('keydown', function(event) {
    if (gameOver || gameWon) {
        gameOver = false;
        gameWon = false;
        character.x = 50; // Reset character position
        character.y = 550;
        generatePlatforms(); // Regenerate platforms
        // Reset boss position
        boss.y = 550;
    }
});

// Generate platforms and start the game loop
generatePlatforms();
gameLoop();
