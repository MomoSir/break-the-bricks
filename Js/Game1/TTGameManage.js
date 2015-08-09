
/// <reference path="../../../Js/Cmn.js"/*tpa=http://www.kinderino.com.cn/Js/Cmn.js*/ />
/// <reference path="../../../Js/ThirdLib/lufylegend.1.9.7.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/lufylegend.1.9.7.js*/ />
/// <reference path="../../../Js/ThirdLib/Box2dWeb-2.1.a.3.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/Box2dWeb-2.1.a.3.min.js*/ />
/// <reference path="EntityClass.js"/*tpa=http://www.kinderino.com.cn/mobile/Js/Game1/EntityClass.js*/ />
 

(function (window) {
    if (!window.Game) { window.Game = {}; }
    Game.TTGameManage = new function () {
         
        //资源列表
        var _Self = this;

        //加载完成的资源列表
        _Self.SourceData = {}; 
        //是否是多人
        _Self.IsMuleiPlayer = false;
        //是否是游戏中
        _Self.Gameing = null;
        //超出顶部的事件
        _Self.OnBeyondTheTop = new Cmn.Event(this);
        //资源加载过程中事件
        _Self.OnLoadProgress = new Cmn.Event(this);
        //资源加载完成事件
        _Self.OnLoadComplete = new Cmn.Event(this);
        //游戏结束的事件
        _Self.OnGameOver = new Cmn.Event(this);
        //Flip的事件
        _Self.OnFlip = new Cmn.Event(this);
        //私有事件 
        _OnFrame = new Cmn.Event(this);

        //舞台层
        var _StageLayer = new LSprite(),
            //资源列表
            _SourceList = [],
            //弹床
            _Net = null,
            //蛋蛋
            _Egg = null,
            //是否创建道具
            _IsCreateProps = true,
            //弹的次数
            _Count = 0,
            //计时
            _GameTime = 0,
            //游戏开始的时间
            _StartTime = 0,
            //时间文本
            _TimeText = null,
            //道具层
            _PropsLayer = new LSprite(),
            //吃道具的时间
            _EatPropsTime = 0,
            //吃道具的弹起的次数
            _EatPropsCount = 0;
            //初始化kinder
            _InitKinderIndex= 6,
            //困难等级
            _Level = 1,
            //网面缩放
            _EggSpeed = 1,
            //网面弹力力道
            _NetVce = -1800;
 

        //设置资源
        _Self.SetSource = function (arr) {
            /// <summary>设置资源</summary>
            /// <param name="arr" type="Array">添加的资源数组</param>
            _SourceList = arr;
            _Self.SourceData = {};
        }
         
        //创建舞台
        _Self.CreateStage = function (selector, width, height) {
            /// <summary>创建舞台</summary>
            /// <param name="selector" type="String">舞台选择器</param>
            /// <param name="width" type="String">宽度</param>
            /// <param name="height" type="height">高度</param>

            LGlobal.preventDefault = true;

            init(45, selector, width, height, function () {

                LLoadManage.load(_SourceList, function (progress) {
                    _Self.OnLoadProgress.Trigger([progress]);
                },
                function (result) {
                    //缓存加载完成的资源
                    _Self.SourceData = result;
 
                    _Self.OnLoadComplete.Trigger([_Self]);
                });

            }, LEvent.INIT);
        }

        //加载完毕之后
        _Self.OnLoadComplete.Add(function () {  _Self.Init();  }, "TT_StageInitComplete");

        //创建舞台对象
        _Self.Init = function () {

            _Self.Destroy();

            //实例化 box2d
            if (Cmn.Func.GetParamFromUrl("test") != "") { LGlobal.setDebug(true); }
        
            LGlobal.box2d = new LBox2d();
           
            //设置透明层
            _StageLayer.graphics.drawRect(0, "#000", [0, 0, LGlobal.width, LGlobal.height], true, "rgba(244, 238, 238, 0)");
            //添加舞台对象
            addChild(_StageLayer);
           
 
        }

        //准备游戏
        _Self.Ready = function (IsHomeowners) {
            /// <summary>准备游戏</summary>
            if (_Self.Gameing) { return false;}
            _Self.Gameing = true;
            _IsCreateProps = true;
            _Count = 0;
            _GameTime = 0;
            _StartTime = 0;
            _EatPropsTime = 0;
            _EatPropsCount = 0;
            _Level = 1;

            if (_Self.IsMuleiPlayer) { _NetVce = -1500; }
            else { _NetVce = -1300; }
         
            _TimeText = null;
            _PropsLayer = new LSprite();
            _InitKinderIndex = 6;
            //对象不存在的时候
            _TimeText = new LTextField();
            _TimeText.size = 40;
            _TimeText.weight = 800;
            _TimeText.color = "#fff";
            _TimeText.font = "微软雅黑";
            _TimeText.text = "00'00";
            _TimeText.x = 20;
            _TimeText.y = 20;
            _StageLayer.addChild(_TimeText);
           
            //启用时间轴事件
            _StageLayer.addEventListener(LEvent.ENTER_FRAME, function () { _OnFrame.Trigger(); });

            _ReadyAnimate(function () {

                //多人游戏 并且是房主的时候或者是单人游戏的时候
                if ((_Self.IsMuleiPlayer && IsHomeowners) || !_Self.IsMuleiPlayer) {
                    //创建蛋蛋
                    if (!_Self.IsMuleiPlayer) { _InitKinderIndex = undefined; }
                    _Egg = new Game.Egg(_Self.SourceData, _InitKinderIndex, _Self.IsMuleiPlayer);
                    _InitKinderIndex = undefined;
                    _StageLayer.addChild(_Egg);
                    //蛋蛋入场
                    LTweenLite.to(_Egg, 0.8, {
                        scaleX: _Egg.Scale,
                        scaleY: _Egg.Scale,
                        x: _Egg.x - _Egg.getWidth() / 2,
                        ease: LEasing.Back.easeOut,
                        onComplete: function () {

                            _Egg.SetBody();
                            LGlobal.box2d.synchronous();
                            var _vec = new LGlobal.box2d.b2Vec2(0, 500);
                            _Egg.box2dBody.ApplyImpulse(_vec, _Egg.box2dBody.GetWorldCenter());
                            //游戏开始
                            _Self.Start();
                        }
                    });

                }

                //默认围墙高度
                var _wallHeight = LGlobal.height * 5;
                //不是多人游戏的话 围墙刚刚吧屏幕围满
                if (!_Self.IsMuleiPlayer) { _wallHeight = LGlobal.height; }
                //创建围墙
                var _wall = _CreateWallLayer(LGlobal.width, _wallHeight);
                //添加围墙
                _StageLayer.addChild(_wall);

                //是否支持传感器
                if (window.DeviceMotionEvent) { _Net.DeviceMotion(); }
                    //开启拖动
                else {  _Net.BindDrag(_StageLayer);  }

                //pc测试
                if (Cmn.Func.GetParamFromUrl("test") != "") { _Net.BindDrag(_StageLayer); }

                //设置游戏开始的时间
                _StartTime = new Date().getTime();

                //倒计时
                _CountDwon();

                //矫正位置
                LGlobal.box2d.synchronous();
            });

            //道具层
            _StageLayer.addChild(_PropsLayer);

            //创建弹床
            window.Net = _Net = new Game.Net(_Self.SourceData);
            _Self.Net = _Net;
            _StageLayer.addChild(_Net);

            //矫正位置
            LGlobal.box2d.synchronous();


        }

        //监听球是否出界
        _Self.TT_IsBeuondTheTop = function () {
            //时间轴 监听球是否飞出屏幕
            var _isRePos = false;
            //监听是否超出顶部
            _OnFrame.Add(function () {
                if (_Egg && _Egg.y <= -_Egg.getHeight()-1 && _isRePos == false) {

                    //移除刚体
                    _Egg.clearBody();
                    _Egg.y = -_Egg.getHeight();
                    _Egg.alpha = 0;
                    _isRePos = true;
                    _Self.OnBeyondTheTop.Trigger([{ x: _Egg.x, rotate: _Egg.rotate }]);
                    _StageLayer.removeChild(_Egg);
                    _Egg = null;
                    _OnFrame.Remove("TT_IsBeuondTheTop");
                }
                if (_Egg && _Egg.box2dBody && _Egg.box2dBody.GetPosition().y > 0 && _isRePos) { _isRePos = false; }

            }, "TT_IsBeuondTheTop");
        }

        //开始游戏
        _Self.Start = function () {
            /// <summary>开始游戏</summary>
           
            //多人游戏才会需要监听是否超出
            if (_Self.IsMuleiPlayer) {  _Self.TT_IsBeuondTheTop();  }

            //第一次提示语
            if (_Count == 0) {
                _SayText("Tip1",function (say) {
                    LTweenLite.to(say, 0.3, { delay: 1.5, alpha: 0, onComplete: function () { say.remove() } });
                });
            }

            //监听道具高度
            _OnFrame.Add(function () {

                if (_PropsLayer.childList.length > 0) {

                    for (var _propsKey in _PropsLayer.childList) {
                        var _props = _PropsLayer.childList[_propsKey];

                        if (_props.ClassName == "Props") {
                            _props.y += 6;

                            //检测道具与网是否碰撞
                            if (LGlobal.hitTestPolygonArc([[_Net.x, _Net.y], [_Net.x + _Net.width, _Net.y],
                                                           [_Net.x + _Net.width, _Net.y + _Net.height], [_Net.x, _Net.y + _Net.height]],
                                [_props.x + _props.getWidth() / 2 - 12, _props.y + _props.getHeight() / 2 - 12, 55, 55 * 55])) {

                                _props.ClassName == "";
                                (function (props) {
                                    LTweenLite.to(props, 0.3, { alpha: 0, onComplete: function () { props.remove(); } });

                                    if (props.Name == "EnlargeProps") {
                                        _Net.Enlarge();
                                    }
                                    else if (props.Name == "NarrowProps") {
                                        _Net.Narrow();
                                    }
                                    //减速
                                    else if (props.Name == "SlowDownProps") {
                                        _EggSpeed = 2;
                                    }
                                    //加速
                                    else if (props.Name == "SpeedUpProps") {
                                        _EggSpeed = 0;
                                    }
                                    //设置吃道具的时间
                                    _EatPropsTime = _GameTime;
                                    _Egg && _Egg.Light(_Self.SourceData["LoadingLight"]);
                                })(_props);
                            }
                            else  if (_props.y >= LGlobal.height-30) {
                                _props.ClassName == "";
                                (function (props) {
                                    LTweenLite.to(props, 0.3, {  alpha: 0, onComplete: function () {  props.remove();  }  });
                                })(_props);
                               
                            }
                        }
                        
                    }
                }
            }, "TT_PropsTop");

            //上一次增加游戏难度的时间
            var _beforAddLevelTime = 0,
                //上一次创建道具的时间
                _beforCreatePropsTime = 0,
                //丢失的次数
                _MissCount = 0;
            //随游戏事件变更游戏难度
            _OnFrame.Add(function () {
                //每隔一分钟增加一次难度(!_Self.IsMuleiPlayer) && 
                if (_GameTime - _beforAddLevelTime >= 20000) {
                    //设置困难等级
                    _Net && _Net.Narrow01();
                    _beforAddLevelTime = _GameTime;
                }

                //每隔20秒来个道具
                if (_Egg == null) {
                    if (_GameTime - _beforCreatePropsTime >= 12000) {
                        _IsCreateProps = true;
                        _RandomCreateProps();
                        _beforCreatePropsTime = _GameTime;
                    }
                }
                else {
                    if (_GameTime - _beforCreatePropsTime >= 20000) {
                        _IsCreateProps = true;
                        _beforCreatePropsTime = _GameTime;
                    }
                }
               

                //距离吃道具的时间 6秒之后 还原网面size
                if ((!_Self.IsMuleiPlayer) && (_GameTime - _EatPropsTime >= 6000)) {
                    if (_Net.State != 0) { _Net.Reduction(); }
                    _EggSpeed = 1;
                }

                //自动修复跳出去的kinder 只有单人游戏有可能出现这种情况
                if ((!_Self.IsMuleiPlayer)) {
                     
                    //弹出去了游戏结束
                    if (_Egg.y < -_Egg.getHeight() || _Egg.x > LGlobal.width || _Egg.x + _Egg.getWidth() < 0) {
                        _MissCount++;
                        if (_MissCount > 50) {
                            _Self.Stop();
                            _OnFrame.Remove("TT_Timeline");
                        }
                    }
                    else { _MissCount = 0;}
                }

                //玩够5分钟 游戏结束撒
                if (_GameTime - _StartTime >= 5*60*1000) {  _Self.Stop();  }

            }, "TT_Timeline");
           
            //监听是否碰撞
            LGlobal.box2d.setEvent(LEvent.POST_SOLVE, function (contact, impulse) {

                var _bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                    _bodyB = contact.GetFixtureB().GetBody().GetUserData();

                //碰撞名称
                var _collideDesc = "";

                //检测球和网面的撞击
                if ((_bodyA.Name == "Egg" && _bodyB.Name == "Net")||
                    (_bodyA.Name == "Net" && _bodyB.Name == "Egg")) {
                    _collideDesc = "EggOrNet";
                }
                //球碰到地面了
                else if ((_bodyA.Name == "Egg" && _bodyB.Name == "BottomWall") ||
                    (_bodyA.Name == "BottomWall" && _bodyB.Name == "Egg")) {
                    _collideDesc = "EggOrBottomWall";
                }

                if (_collideDesc != "") {

                    //球落地了
                    if (_collideDesc == "EggOrBottomWall") {   _Self.Stop();  return false;  }
                   
                    var _vec = null;
                    
                    //网面接到蛋了
                    if (_collideDesc == "EggOrNet") {

                        //获取球的落点
                        var _b2WorldManifold = new LGlobal.box2d.b2WorldManifold();
                        _Net.box2dBody.GetContactList().contact.GetWorldManifold(_b2WorldManifold);

                        var _pointX = _b2WorldManifold.m_points[0].x * 30 - _Net.box2dBody.GetPosition().x * 30;
                         
                        _vec = new LGlobal.box2d.b2Vec2((_pointX * -1)  * 20, _NetVce);

                        _Self.OnFlip.Trigger([_Self.IsMuleiPlayer]);

                        //第一次弹的时候
                        if (_Count == 0) {
                            //第二次提示语
                            setTimeout(function () {
                                _SayText("Tip2", function (say) {
                                    LTweenLite.to(say, 0.3, { delay: 1.5, alpha: 0, onComplete: function () { say.remove() } });
                                });
                            }, 800);

                        }
                        else {  setTimeout(_RandomCreateProps, 10);  }

                        _Count++;
                       
                        //球速度的
                        if (_EggSpeed != 1) {
                            if (_EggSpeed == 0) {
                                if (_Self.IsMuleiPlayer) { LGlobal.setFrameRate(25); _NetVce = -3000;}
                                else { LGlobal.setFrameRate(35); }
                            }
                            if (_EggSpeed == 2) {

                                if (_Self.IsMuleiPlayer) { LGlobal.setFrameRate(80); _NetVce = -1000; }
                                else { LGlobal.setFrameRate(80); }
                               
                            }
                        }
                        else { LGlobal.setFrameRate(45); }

                        if (_Self.IsMuleiPlayer) {
                            if (_Net.State != 0) { _EatPropsCount++; }
                            else { _EatPropsCount = 0; }
                            if (_EatPropsCount % 3 == 0) { _Net.Reduction(); }
                            LGlobal.setFrameRate(45);
                            _NetVce = -1500;
                        }
                        _Net.SwtichNetState();
                        _Egg.box2dBody.ApplyImpulse(_vec, _Egg.box2dBody.GetWorldCenter());

                    }

                }

            });
          
        }

        //游戏停止
        _Self.Stop = function () {
            //蛋蛋存在的话 移除蛋蛋刚体
            if (!!_Egg) {
                _Egg.Name = "";
                setTimeout(function () { _Egg&&_Egg.clearBody(); }, 300);
            }
            _OnFrame.Remove();
            var _s = _GameTime / 1000;
            _s = _s > 300 ? 300 : _s;
            _Self.OnGameOver.Trigger([_s]);
            _Self.Gameing = false;
            LGlobal.setFrameRate(45);
        }

        //销毁游戏
        _Self.Destroy = function () {
            /// <summary>销毁游戏</summary>
            _StageLayer.removeAllEventListener();
            _OnFrame.Remove();
            _StageLayer.removeAllChild();
            
        }

        //蛋掉落
        _Self.EggDrop = function (pos) {

            //创建蛋蛋
            _Egg = new Game.Egg(_Self.SourceData, _InitKinderIndex, _Self.IsMuleiPlayer);
            _InitKinderIndex = undefined;
            _Egg.scaleX = _Egg.scaleY = _Egg.Scale;
            _Egg.y = -_Egg.getHeight();
            _Egg.x = pos.x + _Egg.getWidth() > LGlobal.width ? LGlobal.width - _Egg.getWidth() : pos.x;
            _StageLayer.addChild(_Egg);
            _Egg.SetBody();
            _Egg.box2dBody.SetAngle(pos.rotate);
            LGlobal.box2d.synchronous();

            if (_Count == 0) {  _Self.Start();   }
   
            var _vec = new LGlobal.box2d.b2Vec2((pos.x - 640) / 2 * 10 * Math.cos(pos.rotate), 1800);
            _Egg.box2dBody.ApplyImpulse(_vec, _Egg.box2dBody.GetWorldCenter());
            _Self.TT_IsBeuondTheTop();
        }

        //准备动画
        function _ReadyAnimate(complete) {

            var _readyLayer = new LSprite();
            _readyLayer.width = 84;
            _readyLayer.height = 180;
            _readyLayer.alpha = 1;
            //_readyLayer.scaleX = 1.5;
            _readyLayer.x = (LGlobal.width - _readyLayer.width) / 2;
            _readyLayer.y = (LGlobal.height - _readyLayer.height) / 2 - 150;
            _StageLayer.addChild(_readyLayer);

            var _readyText = new LBitmap(new LBitmapData(_Self.SourceData["ReadyText"]));
            _readyText.alpha = 1;
            _readyText.scaleY = 1.5;
            _readyText.scaleX = 1.5;
            _readyText.y = 30;
            _readyText.x = -_Self.SourceData["ReadyText"].width * 0.5 / 2;
            _readyLayer.addChild(_readyText);

            var _tLayer = new LSprite();
            _tLayer.width = _Self.SourceData["T3"].width;
            _tLayer.height = _Self.SourceData["T3"].height;
            _tLayer.x = (_readyLayer.width - _tLayer.width) / 2 - 10;
            _tLayer.y = (_readyLayer.height - _tLayer.height);
            _readyLayer.addChild(_tLayer);

            //预备开始的小男孩
            var _boyLayer = new LSprite();
            _boyLayer.width = _Self.SourceData["Boy"].width;
            _boyLayer.height = _Self.SourceData["Boy"].height;
            _boyLayer.x = -10;
            _boyLayer.y = (LGlobal.height - _boyLayer.height) - 50;
            _boyLayer.addChild(new LBitmap(new LBitmapData(_Self.SourceData["Boy"])));
            _StageLayer.addChild(_boyLayer);

            //准备动画
            function _readyAnimate(complete) {

                //准备俩字入场
                //LTweenLite.to(_readyText, .5, {
                //   // y: -_Self.SourceData["ReadyText"].height / 2,
                //   // x: -_Self.SourceData["ReadyText"].width / 4,
                //    scaleX: 1,
                //    alpha: 1,
                //    ease: LEasing.Back.easeOut,
                //    onComplete: function () {
                //    }
                //});

                //初始化文字3
                _countDwon(3, function () {
                    //准备俩字出场
                    LTweenLite.to(_readyLayer, .5, {
                        y: 0,
                        alpha: 0,
                        ease: LEasing.Back.easeIn,
                        onComplete: function () {
                            //小男孩预备开始
                            LTweenLite.to(_boyLayer, 0.5, {
                                y: (LGlobal.height - _boyLayer.height),
                                rotate: 20,
                                ease: LEasing.Back.easeOut
                            });
                            setTimeout(function () {
                                _boyLayer.removeAllChild();
                                _boyLayer.addChild(new LBitmap(new LBitmapData(_Self.SourceData["Boy1"])));
                            }, 200);
                            complete && complete();
                        }
                    })
                });

                //倒计时动画
                function _countDwon(num, complete) {

                    var _t = new LBitmap(new LBitmapData(_Self.SourceData["T" + num]));
                    _t.scaleX = _t.scaleY = 0.8
                    _tLayer.addChild(_t);

                    LTweenLite.to(_t, .3, {
                        x: (_t.getWidth() - _t.getWidth() * 0.8) / 2,
                        y: (_t.getHeight() - _t.getHeight() * 0.8) / 2,
                        scaleX: 1,
                        scaleY: 1,
                        ease: LEasing.Back.easeOut
                    }).to(_t, .2, {
                        delay: 0.5,
                       // x: (_t.getWidth() - _t.getWidth() * 0.1) / 2,
                       // y: (_t.getHeight() - _t.getHeight() * 0.1) / 2,
                        //rotate: 360,
                        scaleX: 0.1,
                        scaleY: 0.1,
                        alpha: 0,
                        onComplete: function () {
                            _tLayer.removeChild(_t);
                            if (num > 1) { _countDwon(--num, complete); }
                            else {
                                _tLayer.addChild(_t);
                                complete && complete();
                            }

                        }
                    });
                }

            }

            _readyAnimate(complete);
        }

        //创建围墙
        function _CreateWallLayer (width,height) {
            /// <summary>创建围墙</summary>

            var _wallLayer = new LSprite(),
                _wallHeight = height || LGlobal.height * 3,
                _wallWidth = width || 640;

            _wallLayer.width = _wallWidth;
            _wallLayer.height = _wallHeight;

            //左
            var _wallLeft = new LSprite();
            _wallLeft.Name = "LeftWall";
            _wallLeft.ClassName = "Wall";
            _wallLeft.x = 0;
            _wallLeft.y = -_wallHeight + LGlobal.height;
            _wallLayer.addChild(_wallLeft);
            _wallLeft.addBodyPolygon(1, _wallHeight, 0);

            //右
            var _wallRight = new LSprite();
            _wallRight.Name = "RightWall";
            _wallRight.ClassName = "Wall";
            _wallRight.x = _wallWidth;
            _wallRight.y = -_wallHeight + LGlobal.height;
            _wallLayer.addChild(_wallRight);
            _wallRight.addBodyPolygon(1, _wallHeight, 0);

            //上
            _wallUp = new LSprite();
            _wallUp.Name = "UpWall";
            _wallUp.ClassName = "Wall";
            _wallUp.x = 0;
            _wallUp.y = -_wallHeight + LGlobal.height;
            _wallLayer.addChild(_wallUp);
            _wallUp.addBodyPolygon(_wallWidth, 1, 0);

            //下
            _wallBottom = new LSprite();
            _wallBottom.x = 0;
            _wallBottom.Name = "BottomWall";
            _wallBottom.ClassName = "Wall";
            _wallBottom.y = LGlobal.height - 40;
            _wallLayer.addChild(_wallBottom);
            _wallBottom.addBodyPolygon(_wallWidth, 40, 0);
            return _wallLayer;
        }

        var _speedUpPropsCount = 0,
            _scalePropsCount = 0;
        //随机创建道具
        function _RandomCreateProps() {

            if (_IsCreateProps == false) { return false; }
            //界面上如果有道具
            if (_PropsLayer.childList.length > 0) {
                for (var _propsKey in _PropsLayer.childList) {
                    var _props = _PropsLayer.childList[_propsKey];

                    if (_props.ClassName == "Props") { return false;}
                }
            }

            _IsCreateProps = false;


            var _propsClass = "EnlargeProps";

            if (Cmn.Math.Random(0, 1) == 0) {

                if (_speedUpPropsCount == 0) {  _propsClass = "SlowDownProps";  }
                else {  _propsClass = "SpeedUpProps";  }

                _speedUpPropsCount++;
                if (_speedUpPropsCount >= 5) { _speedUpPropsCount = 0;}
            }
            else {
                if (_scalePropsCount == 0) { _propsClass = "EnlargeProps"; }
                else { _propsClass = "NarrowProps"; }

                _scalePropsCount++;
                if (_scalePropsCount >= 5) { _scalePropsCount = 0; }
            }

            //道具
            var _props = new LSprite();
            _props.ClassName = "Props";
            _props.Name = _propsClass;
            _props.x = Cmn.Math.Random(120, 520);
            _props.y = Cmn.Math.Random(20, 300);
            _props.alpha = 0;
            _props.addChild(new LBitmap(new LBitmapData(_Self.SourceData[_propsClass])));
            _PropsLayer.addChild(_props);
            LTweenLite.to(_props, 0.4, { alpha: 1 });
        }

        //倒计时
        function _CountDwon() {
            /// <summary>倒计时</summary>

            _GameTime = new Date().getTime() - _StartTime;
            _TimeText.text = _TimeFormat(_GameTime);
           
            //监听倒计时
            _OnFrame.Add(function () {
                _GameTime = new Date().getTime() - _StartTime;

                //游戏停止
                if (_GameTime >= 300 * 1000) { _Self.Stop(); }

                _TimeText.text = _TimeFormat(_GameTime);

            },"TT_CountDwon")


        }

        //格式化时间
        function _TimeFormat(ms) {
            var _m, _s, _ms = ms, _date = new Date(ms);
            _m = _date.getMinutes();
            _s = _date.getSeconds();
            _ms = Math.floor(_date.getMilliseconds() / 10);

            _m = _m <= 0 ? "0" + 0 : _m < 10 ? "0" + _m : _m;
            _s = _s <= 0 ? "0" + 0 : _s < 10 ? "0" + _s : _s;

            return _m + "'" + _s;
        };

        //说话
        function _SayText(tipName,callback) {
            var _say = new LSprite(),
                _sayBitmap = new LBitmap(new LBitmapData(_Self.SourceData[tipName]));

            _say.addChild(_sayBitmap);
            _say.scaleX = _say.scaleY = 0;
            _say.x =50;
            _say.y = LGlobal.height - 380;
            _say.alpha = 0;
            _StageLayer.addChildAt(_say,0);

            TweenLite.to(_say, 0.6, {
                scaleX: 1,
                scaleY:1,
                alpha: 1,
                ease: LEasing.Back.easeOut,
                onComplete: function () { callback && callback(_say); }
            });
        }

    }

  

})(window);
 