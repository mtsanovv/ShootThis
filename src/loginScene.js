class LoginScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loadingPercentage;
        this.loginLogo;
        this.loginElementsAlpha = -0.5;
        this.usernameFieldAsset;
        this.usernameField;
        this.passwordFieldAsset;
        this.passwordField;
        this.username = "";
        this.password = "";
        this.rememberAccount;
        this.saveAccount = false;
        this.loginBtn;
        this.loginBtnText;
        this.messageContainer;
        this.messageTitle;
        this.messageText;
        this.messageNoBtn;
        this.messageOkBtn;
        this.messageYesBtn;
        this.okText;
        this.yesText;
        this.noText;
        this.hasConnected = false;
        this.goingForward = true;
        this.loadingText;
    }

    preload() 
    {

        this.loadingPercentage = this.add.text(960, 830, "Loading: ", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);
        //Login scene assets
        this.load.image('loginbg', 'assets/loginbg.png');
        this.load.image('loginlogo', 'assets/loginlogo.png');
        this.load.multiatlas('formFields', 'assets/forms/fields.json', 'assets/forms');
        this.load.multiatlas('rememberAccount', 'assets/forms/checkbox.json', 'assets/forms');
        this.load.multiatlas('loginBtn', 'assets/forms/mediumBtn.json', 'assets/forms');
        this.load.image('shadow', 'assets/shadow.png');
        this.load.image('messageBG', 'assets/messageBG.png');
        //Login plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'js/rextexteditplugin.min.js', true);

		this.load.on('progress', this.onProgress, {loadingPercentage: this.loadingPercentage});
		this.load.on('complete', this.onComplete, {loadingPercentage: this.loadingPercentage});
	}

    onProgress(percentage) 
    {
		percentage = percentage * 100;
        this.loadingPercentage.setText("Loading: " + percentage.toFixed(0) + "%");
	}

    onComplete() 
    {
        game.scene.remove("LoaderScene");
        this.loadingPercentage.destroy();
    }
    
    create()
    {
        var loginBtnClicked = this.anims.generateFrameNames('loginBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'mediumBtn', suffix: '.png'
        });

        this.anims.create({ key: 'loginBtnClicked', frames: loginBtnClicked, frameRate: 24});

        this.messageContainer = this.add.container(0, 0);
        var shadow = this.add.image(960, 540, "shadow");
        var msgbg = this.add.image(960, 540, "messageBG");
        this.messageTitle = this.add.text(960, 420, "WARNING", { fontFamily: 'Rubik', fontSize: '64px', color: "#fff", fontStyle: "bold"});
        this.messageTitle.setOrigin(0.5, 0.5);
        this.messageText = this.add.text(960, 520, "This is some warning/error message and we have a placeholder here.\n\nAnd this is a place holder for a new line.", { fontFamily: 'Rubik', fontSize: '32px', color: "#fff"});
        this.messageText.setAlign("center");
        this.messageText.setOrigin(0.5, 0.5);
        this.messageYesBtn = this.add.sprite(548, 670, 'loginBtn', 'mediumBtn0001.png');
        this.yesText = this.add.text(548, 650, "Yes", { fontFamily: 'Rubik', fontSize: '64px'});
        this.yesText.setOrigin(0.5, 0.5);
        this.messageOkBtn = this.add.sprite(960, 670, 'loginBtn', 'mediumBtn0001.png');
        this.okText = this.add.text(960, 650, "OK", { fontFamily: 'Rubik', fontSize: '64px'});
        this.okText.setOrigin(0.5, 0.5);
        this.messageNoBtn = this.add.sprite(1372, 670, 'loginBtn', 'mediumBtn0001.png');
        this.noText = this.add.text(1372, 650, "No", { fontFamily: 'Rubik', fontSize: '64px'});
        this.noText.setOrigin(0.5, 0.5);
        this.messageContainer.add(shadow);
        this.messageContainer.add(msgbg);
        this.messageContainer.add(this.messageTitle);
        this.messageContainer.add(this.messageText);
        this.messageContainer.add(this.messageYesBtn);
        this.messageContainer.add(this.yesText);
        this.messageContainer.add(this.messageOkBtn);
        this.messageContainer.add(this.okText);
        this.messageContainer.add(this.messageNoBtn);
        this.messageContainer.add(this.noText);
        this.messageContainer.setDepth(100);
        this.messageContainer.alpha = 0;


        this.add.image(960, 540, 'loginbg');
        
        var loadingShadow = this.add.image(960, 540, "shadow");
        this.loadingText = this.add.sprite(0, 479, 'loadingScreen', 'loading/loading0001.png');

        this.loadingPercentage = this.add.text(960, 730, "Connecting to login server...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);

        var loadingFrames = this.anims.generateFrameNames('loadingScreen', {
            start: 1, end: 45, zeroPad: 4,
            prefix: 'loading', suffix: '.png'
        });

        this.anims.create({ key: 'moveLogo', frames: loadingFrames, frameRate: 24, repeat: -1 });
        this.loadingText.anims.play('moveLogo');

        try
        {
            if(jQuery.isEmptyObject(loginConfig))
            {
                loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. Please try again later or contact us.");
            }
            else
            {
                for(var server in loginConfig)
                {
                    if(loginConfig[server].address && loginConfig[server].port && loginConfig[server].protocol)
                    {
                        var socket = io(loginConfig[server].protocol + loginConfig[server].address + ":" + loginConfig[server].port, {secure: true, reconnectionAttempts: 2, transport: ['websocket']});
                        socket.on('connect', () => {
                            loadingShadow.destroy();
                            this.loadingText.destroy();
                            this.loadingPercentage.destroy();
                            this.onConnection(socket);
                        });
                        socket.on('reconnect_failed', () => {
                            if(!this.hasConnected)
                            {
                                try 
                                {
                                    this.socket.destroy();
                                } 
                                catch(e){}
                                loadingShadow.destroy();
                                this.loadingText.destroy();
                                this.loadingPercentage.destroy();
                                this.showMessage("CONNECTION FAILURE", "ShootThis is unable to connect. It may be your connection or an issue on our end.\n\nPlease try again later or contact us.");
                            }
                        });
                        socket.on('disconnect', () => {
                            if(this.hasConnected)
                            {
                                try 
                                {
                                    this.socket.destroy();
                                } 
                                catch(e){} 
                                this.showMessage("DISCONNECTED", "You have been disconnected from ShootThis. Please refresh the page to connect again.");
                            }
                        });
                    }
                    else
                    {
                        loadingShadow.destroy();
                        this.loadingText.destroy();
                        this.loadingPercentage.destroy();
                        this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. One or more servers may not be configured properly.\n\nPlease try again later or contact us.");
                        return;
                    }
                }
            }
        }
        catch(e)
        {
            loadingShadow.destroy();
            this.loadingText.destroy();
            this.loadingPercentage.destroy();
            this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. Please try again later or contact us.");
            return;
        }

    }

    showMessage(title, message, yesno = "none", yesCallback = function() {this.messageYesBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, noCallback = function() {this.messageNoBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, okCallback = function() {this.messageOkBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;})
    {
        this.messageTitle.text = title;
        this.messageText.text = message;

        this.messageYesBtn.removeInteractive();
        this.messageNoBtn.removeInteractive();
        this.messageOkBtn.removeInteractive();

        switch(yesno)
        {
            case "true":
                this.messageYesBtn.alpha = 1;
                this.yesText.alpha = 1;
                this.messageOkBtn.alpha = 0;
                this.okText.alpha = 0;
                this.messageNoBtn.alpha = 1;
                this.noText.alpha = 1;
                messageYesBtn.setInteractive().on('pointerdown', yesCallback);
                messageYesBtn.setInteractive().on('pointerdown', noCallback);
                break;
            case "false":
                this.messageYesBtn.alpha = 0;
                this.yesText.alpha = 0;
                this.messageOkBtn.alpha = 1;
                this.okText.alpha = 1;
                this.messageNoBtn.alpha = 0;
                this.noText.alpha = 0;
                messageOkBtn.setInteractive().on('pointerdown', okCallback);
                break;
            default:
                this.messageYesBtn.alpha = 0;
                this.yesText.alpha = 0;
                this.messageOkBtn.alpha = 0;
                this.okText.alpha = 0;
                this.messageNoBtn.alpha = 0;
                this.noText.alpha = 0;
                break;
        }

        this.messageContainer.alpha = 1;
    }
    
    onConnection(socket)
    {
        this.hasConnected = true;
        
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.usernameFieldAsset = this.add.sprite(960, 480, 'formFields', 'field0001.png');
        this.usernameFieldAsset.alpha = 0;

        this.usernameField = this.add.text(950, 480, "Username", { fontFamily: 'Rubik', fontSize: '48px', fixedWidth: 700, color: "#ABABAB"});
        this.usernameField.setOrigin(0.5, 0.5);
        this.usernameField.alpha = 0;

        var onCloseUsernameEditor = function (txtObj)
        {
            txtObj.style.color = "rgb(171 171 171)";
            this.username = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Username";
            this.scene.usernameFieldAsset.setFrame("field0001.png");
        };

	    this.usernameField.setInteractive().on('pointerdown', () => {
            this.usernameFieldAsset.setFrame("field0002.png");
            if(this.usernameField.text == "Username") 
                this.usernameField.text = "";
            this.usernameField.style.color = "rgb(0 0 0)";
            this.usernameEditor = this.rexUI.edit(this.usernameField, {}, onCloseUsernameEditor);
        });

        this.passwordFieldAsset = this.add.sprite(960, 570, 'formFields', 'field0001.png');
        this.passwordFieldAsset.alpha = 0;

        this.passwordField = this.add.text(950, 570, "Password", { fontFamily: 'Rubik', fontSize: '48px', fixedWidth: 700, color: "#ABABAB"});
        this.passwordField.setOrigin(0.5, 0.5);
        this.passwordField.alpha = 0;

        var onClosePasswordEditor = function (txtObj)
        {
            txtObj.style.color = "rgb(171 171 171)";
            this.password = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Password";
            else
            {
                txtObj.style.color = "rgb(0 0 0)";
                for(var c in txtObj.text)
                    txtObj.text = txtObj.text.substr(0, c) + '●' + txtObj.text.substr(c + 1);
            }
            this.scene.passwordFieldAsset.setFrame("field0001.png");
        };

	    this.passwordField.setInteractive().on('pointerdown', () => {
            this.passwordFieldAsset.setFrame("field0002.png");
            if(this.passwordField.text == "Password") this.passwordField.text = "";
            this.passwordField.style.color = "rgb(0 0 0)";
            this.passwordEditor = this.rexUI.edit(this.passwordField, {type: "password"}, onClosePasswordEditor);
        });

        this.rememberAccount = this.add.sprite(960, 650, 'rememberAccount', 'checkbox0001.png');
        this.rememberAccount.alpha = 0;

        var checkboxClicked = this.anims.generateFrameNames('rememberAccount', {
            start: 9, end: 20, zeroPad: 4,
            prefix: 'checkbox', suffix: '.png'
        });

        this.anims.create({ key: 'checkboxClicked', frames: checkboxClicked, frameRate: 24});

        this.rememberAccount.setInteractive().on('pointerdown', () => {
            if(this.rememberAccount.frame.name == "checkbox0001.png")
            {
                this.rememberAccount.anims.play('checkboxClicked');
                this.saveAccount = true;
            }
            else
            {
                this.rememberAccount.setFrame("checkbox0001.png");
                this.saveAccount = false;
            }
        });

        this.loginBtn = this.add.sprite(960, 800, 'loginBtn', 'mediumBtn0001.png');
        this.loginBtn.alpha = 0;

        this.loginBtnText = this.add.text(960, 780, "Login", { fontFamily: 'Rubik', fontSize: '64px'});
        this.loginBtnText.setOrigin(0.5, 0.5);
        this.loginBtnText.alpha = 0;

        this.loginBtn.setInteractive().on('pointerdown', () => {
            this.loginBtn.anims.play('loginBtnClicked');
            //initiate login sequence
        });
    }
    update(time, delta)
    {
        if(this.hasConnected)
        {
            if(this.loginElementsAlpha < 1)
            {
                if(this.loginElementsAlpha >= 0)
                    this.loginLogo.alpha += delta / 1000;
                this.loginElementsAlpha += delta / 1000;
            }
            else if(this.loginElementsAlpha >= 1 && this.loginElementsAlpha < 2)
            {
                this.usernameFieldAsset.alpha += delta / 300;
                this.usernameField.alpha += delta / 300;
                this.loginElementsAlpha += delta / 300;
            }
            else if(this.loginElementsAlpha >= 2 && this.loginElementsAlpha < 3)
            {
                this.passwordFieldAsset.alpha += delta / 300;
                this.passwordField.alpha += delta / 300;
                this.loginElementsAlpha += delta / 300;
            }
            else if(this.loginElementsAlpha >= 3 && this.loginElementsAlpha < 4)
            {
                this.rememberAccount.alpha += delta / 300;
                this.loginElementsAlpha += delta / 300;
            }
            else if(this.loginElementsAlpha >= 4 && this.loginElementsAlpha < 5)
            {
                this.loginBtn.alpha += delta / 300;
                this.loginBtnText.alpha += delta / 300;
                this.loginElementsAlpha += delta / 300;
            }
        }
        else
        {
            if(this.goingForward)
            {
                if(this.loadingText.x < 1478)
                    this.loadingText.x += delta / 1.33;
                else 
                    this.goingForward = false;
            }
            else
            {
                if(this.loadingText.x > 0)
                    this.loadingText.x -= delta / 1.33;
                else
                    this.goingForward = true;
            }
        }
    }
}