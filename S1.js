var S1 = {

preload: function() {

  game.load.spritesheet('explosion', '/assets/explode.png', 128, 128);
  game.load.bitmapFont('spacefont', '/assets/spacefont/spacefont.png', '/assets/spacefont/spacefont.xml');

  game.load.image('starfield', 'assets/starfield.png');
  game.load.image('ship', 'assets/ship.png');
  game.load.image('bullet', 'assets/bullets/bullet.png');
  game.load.image('enemy-green', 'assets/enemies/enemy2.png');
  game.load.image('enemy-blue', '/assets/enemies/enemy3.png');
  game.load.image('blueEnemyBullet', '/assets/bullets/blue-enemy-bullet.png');

  this.load.audio('dead', 'audio/dead.mp3');
  this.load.audio('s1song', 'audio/s1song.wav');
  this.load.audio('lifelost', 'audio/lifelost.wav');
  this.load.audio('shooting', 'audio/shooting.wav');
  this.load.audio('win', 'audio/win.wav');
  this.load.audio('getlife', 'audio/getlife.wav');
  this.load.audio('game_over', 'audio/gameover.wav');
  this.load.audio('explosionSo', 'audio/explosionS.wav');
  this.load.audio('backgroundmusic', 'audio/backgroundmusic.mp3');
},

create: function() {

  menus.stop();
  theme = game.add.audio('s1song');
  theme.play('',0,1,true);

  game.scale.pageAlignHorizontally = true;

  //  The scrolling starfield background
  starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

  //  The hero!
    player = game.add.sprite(100, game.height / 2, 'ship');
    player.health = 100;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.events.onKilled.add(function(){
        shipTrail.kill();
    });
    player.events.onRevived.add(function(){
        shipTrail.start(false, 5000, 10);
    });

  //  Our bullet group
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(30, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  greenEnemies = game.add.group();
  greenEnemies.enableBody = true;
  greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
  greenEnemies.createMultiple(5, 'enemy-green');
  greenEnemies.setAll('anchor.x', 0.5);
  greenEnemies.setAll('anchor.y', 0.5);
  greenEnemies.setAll('scale.x', 0.5);
  greenEnemies.setAll('scale.y', 0.5);
  greenEnemies.forEach(function(enemy){
      addEnemyEmitterTrail(enemy);
      enemy.damageAmount = 20;
      enemy.events.onKilled.add(function(){
           enemy.trail.kill();
        });
    });

    game.time.events.add(1000, launchGreenEnemy);

    //  More baddies!

    blueEnemies = game.add.group();
    blueEnemies.enableBody = true;
    blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemies.createMultiple(30, 'enemy-blue');
    blueEnemies.setAll('anchor.x', 0.5);
    blueEnemies.setAll('anchor.y', 0.5);
    blueEnemies.setAll('scale.x', 0.5);
    blueEnemies.setAll('scale.y', 0.5);
    blueEnemies.setAll('angle', 90)
    blueEnemies.forEach(function(enemy){
        enemy.damageAmount = 40;
    });

    game.time.events.add(200, launchBlueEnemy);

    //  Blue enemy's bullets
    blueEnemyBullets = game.add.group();
    blueEnemyBullets.enableBody = true;
    blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemyBullets.createMultiple(30, 'blueEnemyBullet');
    blueEnemyBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
    blueEnemyBullets.setAll('alpha', 0.9);
    blueEnemyBullets.setAll('anchor.x', 0.5);
    blueEnemyBullets.setAll('anchor.y', 0.5);
    blueEnemyBullets.setAll('outOfBoundsKill', true);
    blueEnemyBullets.setAll('checkWorldBounds', true);
    blueEnemyBullets.forEach(function(enemy){
        enemy.body.setSize(20, 20);
    });




    //  An explosion pool
  explosions = game.add.group();
  explosions.enableBody = true;
  explosions.physicsBodyType = Phaser.Physics.ARCADE;
  explosions.createMultiple(30, 'explosion');
  explosions.setAll('anchor.x', 0.5);
  explosions.setAll('anchor.y', 0.5);
  explosions.forEach( function(explosion) {
      explosion.animations.add('explosion');
    });

    //  Shields stat
  shields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health +'%', 50);
  shields.render = function () {
    shields.text = 'Shields: ' + Math.max(player.health, 0) +'%';
  };

  shields.render();




  //  And some controls to play the game with
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  //  Add an emitter for the ship's trail
  shipTrail = game.add.emitter(player.x - 20, player.y, 400);
  shipTrail.height = 10;
  shipTrail.makeParticles('bullet');
  shipTrail.setYSpeed(20, -20);
  shipTrail.setXSpeed(-140, -120);
  shipTrail.setRotation(50, -50);
  shipTrail.setAlpha(1, 0.01, 800);
  shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
  shipTrail.start(false, 5000, 10);

  //  Game over text
  gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER!', 110);
  gameOver.x = gameOver.x - gameOver.textWidth / 2;
  gameOver.y = gameOver.y - gameOver.textHeight / 3;
  gameOver.visible = false;

  //  Score
  scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 50);
  scoreText.render = function () {
   scoreText.text = 'Score: ' + score;
   };
  scoreText.render();

},

update: function() {


  			//  Scroll the background
  			starfield.tilePosition.x -= 2;

  			//  Reset the player, then check for movement keys
  			player.body.acceleration.y = 0;
  			player.body.acceleration.x = 0;

  			if (cursors.up.isDown) {
  				player.body.acceleration.y = -ACCLERATION;
  			} else if (cursors.down.isDown) {
  				player.body.acceleration.y = ACCLERATION;
  			} else if (cursors.left.isDown) {
  				player.body.acceleration.x = -ACCLERATION;
  			} else if (cursors.right.isDown) {
  				player.body.acceleration.x = ACCLERATION;
  			}

  			//  Stop at screen edges
  			if (player.x > game.width - 30) {
  				player.x = game.width - 30;
  				player.body.acceleration.x = 0;
  			}
  			if (player.x < 30) {
  				player.x = 30;
  				player.body.acceleration.x = 0;
  			}
  			if (player.y > game.height - 15) {
  				player.y = game.height - 15;
  				player.body.acceleration.y = 0;
  			}
  			if (player.y < 15) {
  				player.y = 15;
  				player.body.acceleration.y = 0;
  			}

  			//  Fire bullet
  			if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
          shooting = game.add.audio('shooting');
  				fireBullet();
          shooting.play();
  			}

  			//  Keep the shipTrail lined up with the ship
  			shipTrail.y = player.y;
  			shipTrail.x = player.x - 20;

        //  Check collisions
     game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this);
     game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);

     game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
     game.physics.arcade.overlap(bullets, blueEnemies, hitEnemy, null, this);
     game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this);

     //  Game over?
    if (! player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart,this);
            spaceRestart = fireButton.onDown.addOnce(_restart,this);
            function _restart() {
              tapRestart.detach();
              spaceRestart.detach();
              restart();
            }
        }
    }

  		}

}
