var renderer = getCookie("renderer") === "canvas" ? Phaser.CANVAS : Phaser.AUTO;
var gameSoundMuted = false;

var config = {
    type: renderer,
    width: 1920,
    height: 1080,
    parent: "game",
    scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        width: 1920,
        height: 1080,
        max: {
            width: 1920,
            height: 1080
        },
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 0}
        }
    },
    dom: {
        createContainer: true
    }
};

var game = new Phaser.Game(config);

game.scene.add("LoaderScene", LoaderScene, true, { x: 960, y: 540 });