/* This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on player and enemy objects 
 */
// This code tells the page to run the init function
// when the page finishes loading so the field exists
// by the time that the function is run.
window.onload = init;

// Game state
// Create the variables we'll be used within this game
var ctx;

var player;
player = new Player();
var playerImage = new Image();
playerImage.src = "images/char-cat-girl.png";

var enemyImage = new Image();
enemyImage.src = "images/enemy-bug.png";

var star;
star = new Star();
var starImage = new Image();
starImage.src = "images/Star.png";

var heart;
heart = new Heart();
var heartImage = new Image();
heartImage.src = "images/Heart.png";

var key = new Key();
var keyImage = new Image();
keyImage.src = "images/Key.png";

var isPlaying;
var lastTime;

// The score
var score = 0;

var lives = 5;

// A cross-browser requestAnimationFrame
var requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

// Initialization. This function does some initial setup													
function init() {
	// Create the canvas
	var canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');	
	canvas.width = 505;
	canvas.height = 606;
	document.body.appendChild(canvas);

	ctx.restore();
	render();
	renderTopBar();
	draw();
	startLoop();
	resetLives();
	resetScore();
	startCreatingEnemies();
	
	// for key presses
	document.addEventListener('keydown', function(e) {
		var allowedKeys = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			80: 'pause'
		};

		if (isPlaying) {
			player.handleInput(allowedKeys[e.keyCode]);	
		}
	});
}

// Create the Top Bar, Player's score and lives
function renderTopBar() {
	ctx.save();
	ctx.font = "bold 26px courier";
	ctx.textAlign = "start";
	ctx.fillStyle = "black";

	var topBarTextLeft = "Score:" + score;
	if(isPlaying) {
		ctx.fillText(topBarTextLeft, 7, 35);
		var topBarTextRight = "Lives:" + lives;
		ctx.textAlign = "end";
		ctx.fillText(topBarTextRight, 490, 35);
	}else {
		ctx.fillText(topBarTextLeft, 7, 35);
	}
	ctx.restore();
}

function resetLives() {
	lives = 5;
}

function resetScore() {
	score = 0;
}

// Draw background/map
var imageBg = new Image();
imageBg.src = "images/water-block.png";
	
function render() {
	ctx.save();
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,505,606);
	
	var mapRows = 6;
	var mapCols = 5;

	for (var row = 0; row < mapRows; row++) {
		for (var col = 0; col < mapCols; col++) {

			switch (mapArray[row][col]) {
				case 'w':
				ctx.drawImage(water, col*101, row*83);
				break;
				case 's':
				ctx.drawImage(stone, col*101, row*83);
				break;
				case 'g':
				ctx.drawImage(grass, col*101, row*83);
				break;
			}				
		}
	}
}
	// Map representation, as an array of Tiles, where tile width = 101, tile height = 83
    // 'w' for water
    // 's' for stone
    // 'g' for grass
	var mapArray = [
		['w','w','g','w','w'],
		['s','s','s','s','s'],
		['s','s','s','s','s'],
		['s','s','s','s','s'],
		['g','g','g','g','g'],
		['g','g','g','g','g']
	];

	var water = new Image();
	var stone = new Image();
	var grass = new Image();

	water.src = "images/water-block.png";
	stone.src = "images/stone-block.png";
	grass.src = "images/grass-block.png";

// The game loop

// Creating, adding Enemies
var spawnInterval;
var spawnTime = 10000;
var spawnAmount = 1;

function startCreatingEnemies() {
	stopCreatingEnemies();
	spawnInterval = setInterval(function(){spawnEnemies(spawnAmount);}, spawnTime);
}

function stopCreatingEnemies() {
	clearInterval(spawnInterval);	
}

function loop() {
	if(isPlaying) {

		var now = Date.now();
		var	dt = (now - lastTime) / 1000.0;
		render();
		renderTopBar();
		draw();
		update(dt);
		spawnEnemies();

		lastTime = now;
		requestAnimFrame(loop);
	}
}

function startLoop() {
	isPlaying = true;
	loop();
	startCreatingEnemies();
}

// Update game objects
function update() {
	renderTopBar();
	player.update();

	for(var i = 0; i < allEnemies.length; i++) {
		allEnemies[i].update();
	}

	for (var k = 0; k < extraObjects.length; k++) {
		extraObjects[k].update();
	}
}

// Draw everything
function draw() {
	player.draw();

	for(var i = 0; i < allEnemies.length; i++) {
		allEnemies[i].draw();
	}

	for (var k = 0; k < extraObjects.length; k++) {
		extraObjects[k].draw();
	}
}

// Create Player
function Player() {
	// Player position
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 200;
	this.drawY = 390;
	this.width = 101;
	this.height = 171;
	this.stepX = 101;
	this.stepY = 82;
	// Player speed
	this.speed = 3;
	// The image for the player
	this.sprite = "images/char-cat-girl.png";
}

// Draw the player on the screen
Player.prototype.draw = function() {
	ctx.drawImage(playerImage, this.srcX, this.srcY, this.width, this.height,
		 this.drawX, this.drawY, this.width, this.height);
};

// Player update
Player.prototype.update = function() {

		// Check Player bounds
		if(this.drawX < 0) {this.drawX = 0;}
		if(this.drawX > 404) {this.drawX = 404;}
		if(this.drawY < -30) {this.drawY = -30;}
		if(this.drawY > 390) {this.drawY = 390;}

	// check for Player reaches "island"-"grass" and enemy-bug collisions
	if(this.drawX >= 200 &&
		this.drawX <=205 &&
		this.drawY < 5) 
		{ this.drawX = 200; this.drawY = 390;
			// Add score
			score = score + 200;
		}

	for(var i = 0; i < allEnemies.length; i++) {

		if(Math.abs(this.drawX - allEnemies[i].drawX) <= 68 &&
			Math.abs(this.drawY - allEnemies[i].drawY) <= 70)
		{ this.drawX = 200; this.drawY = 390; 
			lives --;
		}
	}
	
	// the end game and reset game/scores condition 
	if(lives < 0) { 
		alert('GAME OVER!\nYou scored '+score+' points!');
		score = 0; lives = 5;
		heart.drawX = 20;
		heart.drawY = 120;
		star.drawX = 420;
		star.drawY = 102;
		key.drawX = 120;
		key.drawY = 190;
		allEnemies.length = 3;
	}

	// Check collision between Player and Heart
	if(this.drawX <= heart.drawX + 65 &&
		this.drawX + 101 > heart.drawX &&
		this.drawY < heart.drawY + 20 &&
		this.drawY + 60 > heart.drawY) {
			heart.drawX = Math.floor(Math.random() * 50) - 505;
			heart.drawY = Math.floor(Math.random() * 50) - 606;
			// Add live
			lives += 2;
		}

	// Check collision between Player and Star
	if(this.drawX < star.drawX + 100 &&
		this.drawX + 100 > star.drawX &&
		this.drawY < star.drawY + 42 &&
		this.drawY + 42 > star.drawY) {
			star.drawX = Math.floor(Math.random() * 50) - 505;
			star.drawY = Math.floor(Math.random() * 60) - 606;

			key.drawX = 120;
			key.drawY = 190;
			// Add score
			score = score + 300;
		}	
	// Check collision between Player and Key
	if(this.drawX < key.drawX + 65 &&
		this.drawX + 101 > key.drawX &&
		this.drawY < key.drawY + 10 &&
		this.drawY + 50 > key.drawY) {
			key.drawX = Math.floor(Math.random() * 50) - 505;
			key.drawY = Math.floor(Math.random() * 60) - 606;

			star.drawX = 420;
			star.drawY = 102;
			// Add score
			score = score + 300;
		}	
};

// Create Enemies

function spawnEnemies(count) {

	for(var i = 0; i < count; i++) {
		allEnemies.push(new Enemy(i));
	}
}

var allEnemies = [];
for (var i = 0; i < 3; i++) {
	allEnemies[i] = new Enemy();
}

function Enemy() {
	// Enemy position
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = Math.floor(Math.random() * 350) - 505;
	this.drawY = Math.floor(Math.random() * 350) - 83;
	this.width = 101;
	this.height = 171;
	// Enemy speed
	this.speed = 1 + Math.random() * 3;
}

// Draw the Enemy on the screen
Enemy.prototype.draw = function() {
	ctx.drawImage(enemyImage, this.srcX, this.srcY, this.width, this.height,
		 this.drawX, this.drawY, this.width, this.height);
};

Enemy.prototype.update = function() {
	this.drawX += this.speed;

	// Check Enemies bounds
	if(this.drawX > 505) {
		this.drawX = Math.floor(Math.random() * 350) - 505;
	}

	if(this.drawY < 60) {this.drawY = 60;}
	if(this.drawY > 60 && this.drawY < 140) {this.drawY = 140;}
	if(this.drawY > 140 && this.drawY < 222) {this.drawY = 222;}
	if(this.drawY > 222) {this.drawY = 222;}
};

// Create other Extra Objects
var extraObjects = [star, key, heart];
for (var k = 0; k < extraObjects.length; k++) {
}

// Create Stars, they add score 
function Star() {
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 420;
	this.drawY = 102;
	this.width = 101;
	this.height = 171;
	this.sprite = "images/Star.png";
}

Star.prototype.draw = function() {
	ctx.drawImage(starImage, this.srcX, this.srcY, this.width, this.height,
		 this.drawX, this.drawY, 70, 118);
};

Star.prototype.update = function() {
	this.drawX = 420;
};

// Create Keys, they add score
function Key() {
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 120;
	this.drawY = 190;
	this.width = 101;
	this.height = 171;
	this.sprite = "images/Key.png";
}

Key.prototype.draw = function() {
	ctx.drawImage(keyImage, this.srcX, this.srcY, this.width, this.height,
		 this.drawX, this.drawY, 65, 110);
};

Key.prototype.update = function() {
	this.drawX = 120;
};

// Create Hearts, they add lives
function Heart() {
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 20;
	this.drawY = 120;
	this.width = 101;
	this.height = 171;
	this.sprite = "images/Heart.png";
}

Heart.prototype.draw = function() {
	ctx.drawImage(heartImage, this.srcX, this.srcY, this.width, this.height,
		 this.drawX, this.drawY, 60, 101);
};

Heart.prototype.update = function() {
	this.drawX = 20;
};

// for key
Player.prototype.handleInput= function(keyPressed) {
    //Input handling
    //Player is moved according to the pressed key
    switch (keyPressed) {
        case 'left':
            this.drawX -= this.stepX;
            break;
        case 'right':
            this.drawX += this.stepX; 
            break;
        case 'up':
            this.drawY -= this.stepY;
            break;
        case 'down':
            this.drawY += this.stepY;
            break;
        case 'pause':
        	isPlaying = false;
        break;
    }
};
