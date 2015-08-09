/// <reference path="TTGameManage.js"/*tpa=http://www.kinderino.com.cn/mobile/Js/Game1/TTGameManage.js*/ />
/// <reference path="../../../Js/ThirdLib/Box2dWeb-2.1.a.3.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/Box2dWeb-2.1.a.3.min.js*/ />
/// <reference path="../../../Js/ThirdLib/lufylegend-1.9.9.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/lufylegend-1.9.9.min.js*/ />
(function () {
    if (!window.Game) { window.Game = {}; }

    window.Game.Egg = function (image, index, isMuleiPlayer) {
        /// <summary>蛋类</summary>
        /// <param name="image" type="Json">蛋蛋的图片对象</param>
        base(this, LSprite, []);

        var _Self = this; 

        _Self.EggIndex = index || (isMuleiPlayer?Cmn.Math.Random(1, 6):Cmn.Math.Random(2, 6));

        if (_Self.EggIndex == 1 || _Self.EggIndex == 3) {  _Self.EggIndex = Cmn.Math.Random(1, 6);  }
        if (_Self.EggIndex == 1 || _Self.EggIndex == 3) { _Self.EggIndex = Cmn.Math.Random(1, 6); }
       
        _Self.width = image["Egg" + _Self.EggIndex].width;
        _Self.height = image["Egg" + _Self.EggIndex].height;
        _Self.Scale = 0.35;
       
        _Self.IsLight = false;
        //名称
        _Self.Name = "Egg";

        _Self.Egg = new LSprite(),
            _eggBitmap = new LBitmap(new LBitmapData(image["Egg" + _Self.EggIndex]));
        _Self.Egg.addChild(_eggBitmap);
        _Self.addChild(_Self.Egg);
        _Self.scaleX = _Self.scaleY = 0;
        _Self.y = 200;
        _Self.x = LGlobal.width / 2;
        _Self.scaleX = _Self.scaleY = _Self.Scale;
       
    }

    //设置刚体
    window.Game.Egg.prototype.SetBody = function () {
        /// <summary>设置刚体</summary>
        var _Self = this;
        _Self.addBodyCircle(_Self.getHeight()/2, _Self.getWidth()/2, _Self.getHeight()/2, 1, 5, 0.3, 0.2);
    }

    //发光
    window.Game.Egg.prototype.Light = function (image) {
        /// <summary>发光</summary>
        var _Self = this;
        if (_Self.IsLight) { return false; }
        _Self.IsLight = true;
        var _light= new LSprite(),
            _lightBitmap = new LBitmap(new LBitmapData(image));
        _light.addChild(_lightBitmap);
        _light.x = (_Self.Egg.getWidth() - _lightBitmap.getWidth()) / 2;
        _light.y = (_Self.Egg.getHeight() - _lightBitmap.getHeight()) / 2;
        _Self.addChildAt(_light,0);
        TweenLite.to(_lightBitmap, 1, {
            rotate: 360 * 4,
            onComplete: function () {
                TweenLite.to(_lightBitmap, 0.3, {
                    alpha: 0,
                    onComplete: function () {
                        _light.remove();
                        _Self.IsLight = false;
                    }
                });
            }
        });

    }

})();

//-----------------------------------------------------------------------------------------
//网面
(function () {

    window.Game.Net = function (imageData) {
        /// <summary>蛋类</summary>
        /// <param name="imageData" type="Json">网所需要的图片集合</param>
        base(this, LSprite, []);

        var _Self = this;

        _Self.graphics.drawRect(0, "#000", [0, 0, _Self.width, _Self.height], true, "rgba(0, 0, 0, 0)");

        _Self.Name = "Net";
        //状态 0常态 1放大 -1 缩小
        _Self.State = 0;
        //网面缩放比
        _Self.NetScale = 0.7;
        //创建网面容器
        _Self.NetImageData = imageData["Net"];
        _Self.Net1ImageData = imageData["Net1"];
        _Self.NetWidth = _Self.NetImageData.width;
        _Self.Net = new LSprite();
       
        var _netBitmap = new LBitmap(new LBitmapData(_Self.NetImageData));
        _Self.Net.scaleX = _Self.Net.scaleY = _Self.NetScale;
        _Self.Net.width = _netBitmap.getWidth();
        _Self.Net.addChild(_netBitmap);

        //创建支架1
        _Self.NetStand = new LSprite(),
           _netStandBitmap = new LBitmap(new LBitmapData(imageData["NetStand"]));
        _Self.NetStand.scaleX = 0.6;
        _Self.NetStand.scaleY = 0.6;
        _Self.NetStand.addChild(_netStandBitmap);

        //创建支架2
        _Self.NetStand1 = new LSprite(),
         _netStandBitmap1 = _netStandBitmap.clone();
        _Self.NetStand1.scaleX = -0.6;
        _Self.NetStand1.scaleY = 0.6;
        _Self.NetStand1.addChild(_netStandBitmap1);

        //计算盒子的大小
        _Self.width = 300 - (imageData["NetStand"].width * (1 - _Self.NetStand.scaleX) * 2) - (imageData["Net"].width * (1 - _Self.Net.scaleX));
        _Self.height = 185 - (imageData["NetStand"].height * (1 - _Self.NetStand.scaleY));

        _Self.addChild(_Self.Net);
        _Self.addChild(_Self.NetStand);
        _Self.addChild(_Self.NetStand1);

        //定位 底座
        _Self.x = (LGlobal.width - _Self.width) / 2;
        _Self.y = LGlobal.height - _Self.height;

        //网面定位
        _Self.Net.x = (_Self.width - _Self.Net.getWidth()) / 2;
        //支架1
        _Self.NetStand.y = 15;
        //支架2
        _Self.NetStand1.y = 15;
        _Self.NetStand1.x = _Self.width;

        //底座
        _Self.addBodyPolygon(_Self.width, _Self.height, 0);

    }

    //绑定拖动
    window.Game.Net.prototype.BindDrag = function (stage) {
        /// <summary>绑定拖动</summary>
        var _Self = this;

        //鼠标点下
        _Self.addEventListener(LMouseEvent.MOUSE_DOWN, _netBackMouseDown);
        //创建鼠标移动事件
        stage.addEventListener(LMouseEvent.MOUSE_MOVE, _stageMouseMove);
        //创建弹起
        stage.addEventListener(LMouseEvent.MOUSE_UP, _stageMouseUp);

        //鼠标点击的x坐标
        var _mouseStartX = null,
            //移动目标刚体的初始x位置
            _targetBodyStartX = 0;
        //鼠标在网上按下的事件句柄
        function _netBackMouseDown(e) { _mouseStartX = e.offsetX; _targetBodyStartX = _Self.box2dBody.GetPosition().x; }
        //鼠标在屏幕上面滑动的事件句柄
        function _stageMouseMove(e) {

            if (_mouseStartX != null) {

                //目标的x位置
                var _targetX = _targetBodyStartX + (e.offsetX - _mouseStartX) / LGlobal.box2d.drawScale;
                if (_targetX > 0 && _targetX <= 21.3) {
                    _Self.box2dBody.SetPosition(new LGlobal.box2d.b2Vec2(_targetX, _Self.box2dBody.GetPosition().y));
                    _Self.box2dBody.SetAwake(true);
                }
            }
        }
        //鼠标在屏幕上弹起的事件句柄
        function _stageMouseUp(e) { _mouseStartX = null; }
    }

    //绑定重力感应
    window.Game.Net.prototype.DeviceMotion = function () {
        /// <summary>绑定拖动</summary>
        var _Self = this;

          //移动目标刚体的初始x位置
        var _targetBodyStartX = _Self.box2dBody.GetPosition().x;

        window.addEventListener("deviceorientation", function (event) {
           
            var _gamma = Math.ceil(event.gamma);//当前的gamma值
            if (!_Self.box2dBody || !_Self.box2dBody.SetPosition) { return;}
            //目标的x位置
            var _targetX = _targetBodyStartX + (_gamma * Math.floor(LGlobal.width / 2 / 50)) / LGlobal.box2d.drawScale;
            // 21.3
            if (_targetX > 0 && _targetX <= (LGlobal.width / LGlobal.box2d.drawScale)) {
                _Self.box2dBody.SetPosition(new LGlobal.box2d.b2Vec2(_targetX, _Self.box2dBody.GetPosition().y));
                _Self.box2dBody.SetAwake(true);
            }
             
        }, true);
    }

    //缩小
    window.Game.Net.prototype.Narrow = function () {
        /// <summary>缩小</summary>
        _Self = this;

        //如果当前在放大状态 那么就还原
        if (_Self.State == -1 || _Self.State == 2) { return false; }
        else if (_Self.State == 1) { _Self.Reduction(); return false; }

        var _scale = (_Self.NetScale - (_Self.NetScale*0.5));
        var _netScaleStep = _Self.NetWidth * _scale;

        LTweenLite.to(_Self, .5, { ease: LEasing.Back.easeOut, width: _Self.width - _netScaleStep, x: _Self.x + _netScaleStep / 2 });
        LTweenLite.to(_Self.NetStand1, .5, { ease: LEasing.Back.easeOut, x: _Self.NetStand1.x - _netScaleStep });
        LTweenLite.to(_Self.Net, .5, {
            ease: LEasing.Back.easeOut,
            scaleX: _scale,
            onComplete: function () {
                _Self.clearBody();
                _Self.addBodyPolygon(_Self.width, _Self.height, 0);
                _Self.State = -1;
                LGlobal.box2d.synchronous();
            }
        });

        _Self.State = 2;

    }

    //放大
    window.Game.Net.prototype.Enlarge = function () {
        /// <summary>放大</summary>
        _Self = this;

        //如果当前在缩小状态 那么就还原
        if (_Self.State == 1 || _Self.State == 2) { return false; }
        else if (_Self.State == -1) { _Self.Reduction(); return false; }

        var _scale = (_Self.NetScale - (_Self.NetScale * 0.5));
        var _netScaleStep = _Self.NetWidth * _scale;

        LTweenLite.to(_Self.Net, .5, { ease: LEasing.Back.easeOut, scaleX: _Self.NetScale + _scale });
        LTweenLite.to(_Self, .5, { ease: LEasing.Back.easeOut, width: _Self.width + _netScaleStep, x: _Self.x - _netScaleStep/2 });
        LTweenLite.to(_Self.NetStand1, .5, {
            ease: LEasing.Back.easeOut, x: _Self.NetStand1.x + _netScaleStep,
            onComplete: function () {
                _Self.clearBody();
                _Self.addBodyPolygon(_Self.width, _Self.height, 0);
                _Self.State = 1;
                LGlobal.box2d.synchronous();
            }
        });

        _Self.State = 2;
    }

    //还原
    window.Game.Net.prototype.Reduction = function () {
        /// <summary>还原</summary>
        _Self = this;

        //如果当前在缩小状态 那么就还原
        if (_Self.State == 0 || _Self.State == 2) { return false; }

        var _scale = (_Self.NetScale - (_Self.NetScale * 0.5));
        var _netScaleStep = _Self.NetWidth * _scale;

        LTweenLite.to(_Self, .5, { ease: LEasing.Back.easeOut, width: _Self.width - _netScaleStep * _Self.State, x: _Self.x + (_netScaleStep  * _Self.State) });
        LTweenLite.to(_Self.NetStand1, .5, { ease: LEasing.Back.easeOut, x: _Self.NetStand1.x - _netScaleStep * _Self.State });
        LTweenLite.to(_Self.Net, .5, {
            ease: LEasing.Back.easeOut,
            scaleX: _Self.NetScale,
            onComplete: function () {
                _Self.clearBody();
                _Self.addBodyPolygon(_Self.width, _Self.height, 0);
                _Self.State = 0;
                LGlobal.box2d.synchronous();
            }
        });

        _Self.State = 2;
    }
  
    //缩小0.1
    window.Game.Net.prototype.Narrow01 = function () {
        /// <summary>缩小0.1</summary>
        _Self = this;
      
        if (_Self.State == 0) {
            var _scale = (_Self.NetScale - (_Self.NetScale * 0.9));
            var _netScaleStep = _Self.NetWidth * _scale;

            _Self.width = _Self.width - _netScaleStep;
            _Self.x = _Self.x + _netScaleStep / 2;
            _Self.NetStand1.x = _Self.NetStand1.x - _netScaleStep;
            _Self.Net.scaleX = _Self.NetScale * 0.9;

            _Self.clearBody();
            _Self.addBodyPolygon(_Self.width, _Self.height, 0);
            _Self.NetScale = _Self.NetScale * 0.9;
            LGlobal.box2d.synchronous();
        }

    }

    //切换网面状态
    window.Game.Net.prototype.SwtichNetState = function () {
        var _Self = this;
        _Self.Net.removeAllChild()
        var _netBitmap = new LBitmap(new LBitmapData(_Self.Net1ImageData));
        _Self.Net.addChild(_netBitmap);

        setTimeout(function () {
            _Self.Net.removeAllChild()
            var _netBitmap = new LBitmap(new LBitmapData(_Self.NetImageData));
            _Self.Net.addChild(_netBitmap);

        }, 200);

    }

})();