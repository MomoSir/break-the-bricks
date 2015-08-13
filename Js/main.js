var Width = $(window).width(),
	Height = $(window).height();
// 生成主场景
init(50,"container",Width,Height,main,LEvent.INIT);
// 声明变量
// 进度条显示层，背景层，方块绘制层，方块预览层
var playLayer,// 底部横条
	backLayer,// 背景层
	graphicsLayer,// 小球
	obstacleLayer,// 顶部砖块
	play_v,// 横条移动速度
	r,vx,vy,
	angle,// 小球移动角度
	speed,// 速度
	keydown,
	score,
	scoreText,// 统计砖块撞击次数
	speedText;// 预留速度缓动显示
function main(){
	backLayer = new LSprite();
	backLayer.graphics.drawRect(1,"#DBDBDB",[0,0,LGlobal.width,LGlobal.height],true,"#DBDBDB");
	LSystem.screen(LStage.FULL_SCREEN);
	// 背景显示
	addChild(backLayer);
	addChild(new FPS());
	gameInit();
}
// 进行游戏标题画面的初始化工作
function gameInit(){
	//显示游戏标题
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
// 游戏画面初始化
function gameToStart(){
	// 背景层清空
	backLayer.die();
	backLayer.removeAllChild();
	backLayer.graphics.drawRect(1, "#DBDBDB", [0, 0, LGlobal.width, LGlobal.height], true, "#DBDBDB");
	backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
	// 事件监听
	LEvent.addEventListener(LGlobal.window, LKeyboardEvent.KEY_DOWN, onkeydown);
	LEvent.addEventListener(LGlobal.window, LKeyboardEvent.KEY_UP, onkeyup);
	backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, onmousedown);
	backLayer.addEventListener(LMouseEvent.MOUSE_UP, onmouseup);
	keydown = 0;
	play_v = 12;
	speed = 15;
	score = 0;
	graphicsLayer= new LSprite();
	r = 15;
	// 绘制小球
	graphicsLayer.graphics.drawArc(2, "#000", [r, r, r, 0, 2 * Math.PI, false], true, "#000");
	graphicsLayer.x = LGlobal.width / 2;
	graphicsLayer.y = LGlobal.height - 25;
	backLayer.addChild(graphicsLayer);
	angle = (Math.random() * 120 + 30) * Math.PI / 180; // 初始随机角度
	vx = Math.cos(angle) * speed;
	vy = -Math.sin(angle) * speed;
	// 绘制底部横条
	playLayer= new LSprite();
	playLayer.graphics.drawRect(1,"#000",[0,0,150,25],true,"#000");
	playLayer.x=(LGlobal.width - playLayer.getWidth())/2;
	playLayer.y = LGlobal.height - playLayer.getHeight();
	backLayer.addChild(playLayer);
	// 绘制顶部砖块
	obstacleLayer = [];
	var i;
	var obstacle_w = 50;
	var obstacle_h = 15;
	var obstacle_x = 0; // (LGlobal.width - 6*obstacle_w)/2
	var obstacle_y = 0;
	for (i = 0; i < 40; i++) {
		obstacleLayer[i] = new LSprite();
		obstacleLayer[i].graphics.drawRect(1, "#929292", [0, 0, obstacle_w, obstacle_h], true, "#B5B5B5");
		obstacleLayer[i].x = obstacle_x + i % 8 * obstacle_w;
		obstacleLayer[i].y = obstacle_y + Math.floor(i / 8) * obstacle_h;
		backLayer.addChild(obstacleLayer[i]);
	}

	scoreText = new LTextField();
	scoreText.x = 30;
	scoreText.y = 50;
	scoreText.size = 20;
	scoreText.color = "#ffffff";
	scoreText.text = "撞击砖块次数："+score;
	backLayer.addChild(scoreText);
}

function onframe(){
	if (keydown == 1 && playLayer.x > 0) {
		playLayer.x -= play_v;
	} else if (keydown == 2 && playLayer.x + playLayer.getWidth() < LGlobal.width) {
		playLayer.x += play_v;
	}
	if(move() === 0){
		return false;
	}
	
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
	if(iswin==1){
		gameOver();
	}
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
	}
	return 1;
}
function check(layer) {
	var chec = check_collect(graphicsLayer, layer);
	if (chec !== 0) {
		if (chec == 1) {
			vy *= -1;
			graphicsLayer.y = layer.y - r * 2 - 2;
		} else if (chec == 2) {
			vy *= -1;
			graphicsLayer.y = layer.y + layer.getHeight() + 2;
		} else if (chec == 3) {
			vx *= -1;
			graphicsLayer.x = layer.x - r * 2 - 2;
		} else if (chec == 4) {
			vx *= -1;
			graphicsLayer.x = layer.x + layer.getWidth() + 2;
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

// 键盘按下事件
function onkeydown(event){
	if(keydown !== 0)return;
	if(event.keyCode == 37){//left
		keydown=1;
	}else if(event.keyCode == 39){//right
		keydown=2;
	}
}
// 键盘弹起事件
function onkeyup(event){
	keydown=0;
}
// 触摸事件
function onmousedown(event){
	if(keydown !== 0)return;
	if(event.offsetX < (LGlobal.width /2)){//left
		keydown=1;
	}else if(event.offsetX > (LGlobal.width /2)){//right
		keydown=2;
	}
}
// 触摸事件结束
function onmouseup(event){
	keydown=0;
}

// 游戏结束
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