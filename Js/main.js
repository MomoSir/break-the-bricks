var Width = $(window).width(),
	Height = $(window).height();

var target = document.getElementById("container");
// Draggable.create(".i-hold", {type:"x", edgeResistance:0.65, bounds:"#container", throwProps:true});
// touch.on(target, 'swiperight', function(event){
//     if (parseInt($(".i-hold").css('left')) + event.distanceX > Width) {
//         TweenMax.to(".i-hold", 0.5, {left: Width - 40});
//     } else{
//         TweenMax.to(".i-hold", 0.5, {left:'+=' + event.distanceX / 1.5});
//     };
// });

// touch.on(target, 'swipeleft', function(event){
//     if (parseInt($(".i-hold").css('left')) + event.distanceX < 40) {
//         TweenMax.to(".i-hold", 0.5, {left:40});
//     } else{
//         TweenMax.to(".i-hold", 0.5, {left:'+=' + event.distanceX / 1.5});
//     };
// });

init(50,"container",Width,Height,main,LEvent.INIT);



// 声明变量
// 进度条显示层，背景层，方块绘制层，方块预览层
var playLayer,backLayer,graphicsLayer,obstacleLayer;
var play_v;
var r,vx,vy;
var keydown,speed;
var score;

var scoreText,speedText;

function main(){
	backLayer = new LSprite();
	backLayer.graphics.drawRect(1,"#DBDBDB",[0,0,LGlobal.width,LGlobal.height],true,"#DBDBDB");
	LStage.setDebug(true);
	LSystem.screen(LStage.FULL_SCREEN);

	//背景显示
	addChild(backLayer);
	gameInit();
}
//读取完所有图片，进行游戏标题画面的初始化工作
function gameInit(){
	//显示游戏标题
	// var title = new LTextField();
	// title.x = 50;
	// title.y = 100;
	// title.size = 30;
	// title.color = "#ffffff";
	// title.text = "游戏";
	// title.font = "微软雅黑";
	// backLayer.addChild(title);
	//显示说明文
	// backLayer.graphics.drawRect(1,"#ffffff",[50,240,220,40]);
	var txtClick = new LTextField();
	txtClick.size = 19;
	txtClick.color = "#000";
	txtClick.text = "点击开始";
	txtClick.font = "微软雅黑";
	txtClick.x = (LGlobal.width - txtClick.getWidth())/2;
	txtClick.y = (LGlobal.height - txtClick.getHeight())/2;
	backLayer.addChild(txtClick);

	backLayer.addEventListener(LMouseEvent.MOUSE_UP,gameToStart);
}

//游戏画面初始化
function gameToStart(){
	//背景层清空
	backLayer.die();
	backLayer.removeAllChild();
	
	backLayer.graphics.drawRect(1,"#DBDBDB",[0,0,LGlobal.width,LGlobal.height],true,"#DBDBDB");
	
	backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
	
	LEvent.addEventListener(LGlobal.window,LKeyboardEvent.KEY_DOWN,onkeydown);
	LEvent.addEventListener(LGlobal.window,LKeyboardEvent.KEY_UP,onkeyup);
	
	keydown=0;
	play_v=12;
	speed=1;
	
	score=0;




	graphicsLayer= new LSprite();
	r=15;
	graphicsLayer.graphics.drawArc(2,"#000",[r, r, r, 0,2*Math.PI,false],true,"#000");
	graphicsLayer.x=400;
	graphicsLayer.y=400;
	backLayer.addChild(graphicsLayer);
	vx=8;
	vy=-8;
	
	
	playLayer= new LSprite();
	playLayer.graphics.drawRect(1,"#000",[0,0,150,25],true,"#000");
	playLayer.x=(LGlobal.width - playLayer.getWidth())/2;
	playLayer.y = LGlobal.height - playLayer.getHeight();
	// playLayer.y=graphicsLayer.y+r*4+2;
	backLayer.addChild(playLayer);
	
	obstacleLayer=[];
	var i;
	var obstacle_w=50;
	var obstacle_h=15;
	var obstacle_x=0;// (LGlobal.width - 6*obstacle_w)/2
	var obstacle_y=0;
	for(i=0;i<40;i++){
		obstacleLayer[i]=new LSprite();
		obstacleLayer[i].graphics.drawRect(1,"#929292",[0,0,obstacle_w,obstacle_h],true,"#B5B5B5");
		obstacleLayer[i].x=obstacle_x+i%8*obstacle_w;
		obstacleLayer[i].y=obstacle_y+Math.floor(i/8)*obstacle_h;
		backLayer.addChild(obstacleLayer[i]);
	}
	
	
	
	scoreText = new LTextField();
	scoreText.x = 30;
	scoreText.y = 50;
	scoreText.size = 20;
	scoreText.color = "#ffffff";
	scoreText.text = "撞击砖块次数："+score;
	backLayer.addChild(scoreText);
	
	// speedText = new LTextField();
	// speedText.x = 30;
	// speedText.y = 100;
	// speedText.size = 20;
	// speedText.color = "#ffffff";
	// speedText.text = '速度'+speed;
	// backLayer.addChild(speedText);
	
	// start=1;
}

function onframe(){
	
	if(keydown==1&&playLayer.x>0) playLayer.x-=play_v;
	else if(keydown==2&&playLayer.x+playLayer.getWidth()<LGlobal.width) playLayer.x+=play_v;
	
	if(move()==0) return;
	
	check(playLayer);
	var i,iswin=1;
	for(i=0;i<40;i++)
	if (obstacleLayer[i] != null) {
		iswin = 0;
		if (check(obstacleLayer[i]) != 0) {
			backLayer.removeChild(obstacleLayer[i]);
			obstacleLayer[i] = null;
			score++;
			scoreText.text = "撞击砖块次数：" + score;
			break;
		}
	}
	if(iswin==1)
		gameOver();
}



function move(){
	graphicsLayer.x+=vx;
	graphicsLayer.y+=vy;
	if(graphicsLayer.x<0){
		vx*=-1;
		graphicsLayer.x=0;
	}
	if(graphicsLayer.x+r*2>LGlobal.width){
		vx*=-1;
		graphicsLayer.x=LGlobal.width-r*2;
	}
	
	if(graphicsLayer.y<0){
		vy*=-1;
		graphicsLayer.y=0;
	}
	if(graphicsLayer.y+r*2>LGlobal.height){
		gameOver();
		return 0;
		//vy*=-1;
		//graphicsLayer.y=LGlobal.height-r*2;
	}
	
	return 1;
}
function check(layer){
	var chec=check_collect(graphicsLayer,layer);
	
	if(chec!=0){
		if(chec==1){
			vy*=-1;
			graphicsLayer.y=layer.y-r*2-2;
		}
		else if(chec==2){
			vy*=-1;
			graphicsLayer.y=layer.y+layer.getHeight()+2;
		}
		else if(chec==3){
			vx*=-1;
			graphicsLayer.x=layer.x-r*2-2;
		}
		else if(chec==4){
			vx*=-1;
			graphicsLayer.x=layer.x+layer.getWidth()+2;
		}
		
	}
	return chec;
}

function check_collect(layer1,layer2){
	var a=[
		layer1.y+layer1.getHeight()/2-(layer2.y-layer1.getHeight()/2),
		(layer2.y+layer2.getHeight()+layer1.getHeight()/2)-(layer1.y+layer1.getHeight()/2),
		layer1.x+layer1.getWidth()/2-(layer2.x-layer1.getWidth()/2),
		(layer2.x+layer2.getWidth()+layer1.getWidth()/2)-(layer1.x+layer1.getWidth()/2)];
	var i;
	for(i=0;i<4;i++)
		if(a[i]<0)
		return 0;
	var min=0;
	for(i=1;i<4;i++)
		if(a[i]<a[min])
		min=i;
	return min+1;
}




//键盘按下事件
function onkeydown(event){
	if(keydown != 0)return;
	if(event.keyCode == 37){//left
		keydown=1;
	}else if(event.keyCode == 38){//up
		keydown=3;
		if(speed==1){
			speed=2;
			vx*=2;
			vy*=2;
		}
		else{
			speed=1;
			vx/=2;
			vy/=2;
		}
		speedText.text = '速度'+speed;
	}else if(event.keyCode == 39){//right
		keydown=2;
	}else if(event.keyCode == 40){//down
		//myKey.keyControl = "down";
	}
}
//键盘弹起事件
function onkeyup(event){
	keydown=0;
}


//游戏结束
function gameOver(){
	backLayer.die();
	backLayer.removeAllChild();
	backLayer.graphics.drawRect(1,"#DBDBDB",[0,0,LGlobal.width,LGlobal.height],true,"#DBDBDB");
	var txt = new LTextField();
	txt.color = "#111";
	txt.size = 40;
	txt.text = "点击重新开始";
	txt.font = "Microsoft Yahei";
	txt.x = (LGlobal.width - txt.getWidth())*0.5;
	txt.y = 200;
	backLayer.addChild(txt);
	
	backLayer.addEventListener(LMouseEvent.MOUSE_UP,gameToStart);
}