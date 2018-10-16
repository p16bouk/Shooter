var MENU = {
	preload: function() {

		game.load.image('menu', 'assets/menu.png');
		game.load.image('lvl1', 'assets/lvl1.png');
		game.load.image('lvl2', 'assets/lvl2.png');

		game.load.audio('menusong', 'audio/menusong.wav');

	},

	create: function() {

		menus = game.add.audio('menusong');
		menus.play('',0,1,true);

		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.physics.startSystem(Phaser.Physics.ARCADE);

		var s = game.add.sprite(-75, 0, 'menu');


		var btn1 = game.add.button(420 , 280, "lvl1", function(){
			game.state.start('S1');
		});
		btn1.anchor.set(0.5, 0.5);

		var btn2 = game.add.button(423, 335, "lvl2", function(){
			game.state.start('S2');
		});
		btn2.anchor.set(0.5, 0.5);

	}
}
