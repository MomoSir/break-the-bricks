/// <reference path="../SiteFunc.js" />
/// <reference path="../SiteFunc.js" />
/// <reference path="../Scenes.js" />
/// <reference path="../AdMaster.js" />
/// <reference path="../../../Js/CmnAjax.js" />
/// <reference path="../../../Socket/Config/MsgTypeConfig.js" />
/// <reference path="PageAnimate.js" />
/// <reference path="TTGameManage.js" />
/// <reference path="../../../Socket/Client/Config/ClientConfig.js" />
/// <reference path="../../../Js/ThirdLib/touch.mini.js" />
/// <reference path="../../../Js/ThirdLib/jquery.js" />
/// <reference path="../../../Js/Cmn.js" />
/// <reference path="../../../Socket/Client/SocketClient.js" />
/// <reference path="../../../Js/CmnTools/WechatShare.js" />

var PageLoad = function () {


    //设置游戏资源 
    Game.TTGameManage.SetSource([
        { path: "Js/Game1/EntityClass.js?"+Math.random(), type: "js" },
        { "name": "Boy", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Boy.png" },
        { "name": "Boy1", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Boy1.png" },
        { "name": "Egg1", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg1.png" },
        { "name": "Egg2", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg2.png" },
        { "name": "Egg3", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg3.png" },
        { "name": "Egg4", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg4.png" },
        { "name": "Egg5", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg5.png" },
        { "name": "Egg6", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Egg6.png" },
        { "name": "Net", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Net.png" },
        { "name": "Net1", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Net1.png" },
        { "name": "NetStand", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/NetStand.png" },
        { "name": "ReadyText", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/ReadyText.png" },
        { "name": "Star", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Star.png" },
        { "name": "T1", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/T1.png" },
        { "name": "T2", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/T2.png" },
        { "name": "T3", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/T3.png" },
        { "name": "EnlargeProps", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/EnlargeProps.png" },
        { "name": "NarrowProps", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/NarrowProps.png" },
        { "name": "Tip1", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Tip1.png" },
        { "name": "Tip2", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/Tip2.png" },
        { "name": "LoadingLight", "path": "http://www.kinderino.com.cn/mobile/images/Public/LoadingLight.png" } ,
        { "name": "SlowDownProps", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/SlowDownProps.png" },
        { "name": "SpeedUpProps", "path": "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/SpeedUpProps.png" }
    ]);

    //初始化舞台
    Game.TTGameManage.CreateStage("jscCanvasWrap", $(window).width(), $(window).height());
  
   window.TTControl = new function () {
        /// <summary>一起弹游戏业务逻辑</summary>

        var _Self = this;
        
       //设置默认分享
        SiteFunc.ShareContent = {
            Title: "奇趣多屏弹弹球，儿童节带孩子玩个新花样！",
            Content: "奇趣多屏弹弹球，儿童节带孩子玩个新花样！",
            Image: "http://" + Cmn.Func.GetMainDomain() + "/mobile/images/share1.jpg",
            Url: Cmn.Func.GetAbsoluteUrl("index.html")
        };
        SiteFunc.SetShare();
       //创建用户
        SiteFunc.CreateUser(function (data) {

            if (!!data.UserID) {
                Cmn.Func.Cookie.Set("kinder_UserID", data.UserID);
                SiteFunc.UserID = data.UserID;
                SiteFunc.IsNewUser = data.IsNew;
                if (data.IsNew == "false") {
                    $(".jscLeaveMessagePopWrap1 .jscInputName").val(data.UserDesc);
                    $(".jscLeaveMessagePopWrap1 .jscInputTel").val(data.Phone || data.Email);
                    var _text = "轻轻松松就有" + data.Maxfraction + "分，我果然是不可战胜的！你也来感受一下？";
                    SiteFunc.SetShare(undefined, _text);
                } else {
                    SetWechatShareToFriend(" ", "奇趣多屏弹弹球，儿童节带孩子玩个新花样！");
                }
            }
        });

       //----------------------------------------------------------
        _Self.Click = function (selector,eventType,fn) {
            var _tapStartTime = 0;
            touch.on(selector, eventType, function (e) {
                var _curTime = new Date().getTime();
                if (_curTime - _tapStartTime < 5000) { return; }
                _tapStartTime = _curTime;
                fn.call(this, e);
            });
        }
       //--------------------------------------------------------------
       //游戏界面
        this.GameInterface = new function () {
            /// <summary>游戏界面</summary>
            Cmn.Object.Inherit(this, Scenes, arguments);
          
            var _self = this;
            _self.ID = "GameInterface";
            _self.IsInit = true;
            _self.PlayerCount = 1;
            _self.Outline = 0;
            
            //人齐 开始游戏
            _Self.Click(".jscPeopleEnoughBtn","tap", function () {
                
                if (_self.PlayerCount < 2) {
                    alert("当前房间人数必须大于2人才能开始哦！请耐心等待！");
                    return false;
                }
                AdMaster.CustomEvent("Game1_Multi_Mode", "Start");
                //锁定房间
                SocketClient.LockRoom();

                //通知所有人开始游戏啦
                SocketClient.SendMsg({ Action: "GameStart" }, MsgTypeConfig.AllInMyRom);

            });

            //链接成功
            SocketClient.OnConnectionSuccess.Add(function () {
                //加入房间
                if (!!SocketClient.RoomID) {
                    SocketClient.EnterRoom(SocketClient.RoomID);
                }
                    //创建房间
                else { SocketClient.CreateRoom(); }

            });

            //监听房间变化
            SocketClient.ListenForClientOperationRoom.Add(function (data) {

                _self.PlayerCount = data.ClientCount;

                if (data.State && data.Action != "OUT") {
                 
                    $(".jscYijiaruText span").text(data.ClientCount);
                  
                    if (data.IsSelf) {
                        
                        //如果自己是房主的话
                        if (data.IsHomeowners) {

                            var _local = Cmn.Func.GetAbsoluteUrl("index.html");
                            //最大五个人
                            if (data.ClientCount < 5) { _local += "?rid=" + SocketClient.RoomID + "&u=" + SiteFunc.U + "&p=" + SiteFunc.P; }
                            $(".jscWaitStartedPageTwoCode .jscCodeTowLoad").show();
                            $(".jscWaitStartedPageTwoCode .jscTowCode")[0].onload = function () {

                                $(".jscWaitStartedPageTwoCode .jscCodeTowLoad").hide();
                                $(".jscWaitStartedPageTwoCode .jscTowCode").show();
                            }

                            _local = "http://c.admaster.com.cn/c/a52002,b574067,c1766,i0,m101,h,u" + encodeURIComponent(_local);
                            $(".jscWaitStartedPageTwoCode .jscTowCode").attr("style", "display:none;");
                            $(".jscWaitStartedPageTwoCode .jscTowCode").attr("src", "http://wechat.cagoe.com/QrCode.aspx?fg=CC0000&text=" + encodeURIComponent(_local));

                            //显示开始游戏的那妞
                            $(".jscPeopleEnoughBtn").show();
                        }
                        else {

                            $(".jscWaitStartedPageTwoCode .jscCodeTowLoad").hide();
                            $(".jscWaitStartedPageTwoCode .jscTowCode").attr("src", "http://www.kinderino.com.cn/mobile/images/Game1/GameSource/ReadyText.png");
                            $(".jscWaitStartedPageTwoCode .jscTowCode").css({ " width": "150px", "height": "auto", " margin-top": "55px" }).show();

                        }
                    }
                }
                //这里是担心可能是分享出去了 尼玛房间不对 所以做的补救措施
                else {
                    //加入房间失败的
                    if (!data.State) {
                        _self.FadeToPage(_Self.ModePageWrap);
                        SocketClient.RoomID = "";
                        SocketClient.Destroy();
                        window.location.href = Cmn.Func.GetAbsoluteUrl("index.html");
                    }

                    if (data.Action == "OUT") {
                        //有人退出房间的时候触发
                        _self.Outline++;
                        //表示该房间＜1玩家在 如果在游戏中的话
                        if (Game.TTGameManage.Gameing) {
                            //此处直接结束游戏
                            Game.TTGameManage.Stop();
                            //不能忘记的哦
                        }
                        else {
                           
                            //房主退出的话
                            if (Game.TTGameManage.Gameing == null && data.IsHomeowners && SocketClient.RoomID != "") {
                                _self.FadeToPage(_Self.ModePageWrap);
                                SocketClient.RoomID = "";
                                SocketClient.Destroy();
                            }
                        }
                       
                        $(".jscYijiaruText span").text(data.ClientCount);
                        _self.PlayerCount = data.ClientCount;
                        
                    }
                    
                }

            });

            //消息的监听
            SocketClient.ListenForMessages.Add(function (data) {

                //游戏开始的行为
                if (data.Action == "GameStart") {
                    //开始游戏
                    _self.Outline=0;
                    $(".jscWaitStartedPageWrap").hide();
                    $(".jscCanvasWrap").show();
                    Game.TTGameManage.Destroy();
                    Game.TTGameManage.Ready(SocketClient.IsHomeowners);
                    _Self.GameInterface.IsInit = true;
                    AdMaster.Pageview("/Game1", "Multi/gamepage");
                }
                    //蛋掉下来
                else if (data.Action == "EggDrop") {
                    Game.TTGameManage.EggDrop(data.Pos);
                }
                    //游戏结束
                else if (data.Action == "GameOver") {
                  
                    $(".jscResultPercentageIn1").show();
                    $(".jscResultPercentageIn2").hide();
                    $(".jscGameOverNum").html(Math.round(data.Score));
                    $(".jscProportion").text(data.Proportion + "%");
                    _self.FadeToPage(_Self.GameOverPageWrap);
                    Game.TTGameManage.Gameing = false;
                }
                else if (data.Action == "GameReStart") {
                    _Self.GameInterface.IsInit = false;
                    _Self.GameOverPageWrap.FadeToPage(_Self.GameInterface);
                    //通知所有人开始游戏啦
                    if (SocketClient.IsHomeowners) {
                        SocketClient.SendMsg({ Action: "GameStart" }, MsgTypeConfig.AllInMyRom);
                    }
                }
                //通知房主添加分数
                else if (data.Action == "AddGameHis") {
                    if (SocketClient.IsHomeowners) {
                        CmnAjax.PostData(SiteFunc.GetItfUrl("AddGameHis"), { fraction: Math.ceil(data.Score), game_id: "1" }, function (dat) {
                            SocketClient.SendMsg({ Action: "GameOver", Score: data.Score, Proportion: new Number((dat.Proportion || 0) * 100).toFixed(1) }, MsgTypeConfig.AllInMyRom);
                        });
                    }
                }
                    //房主通知 其他成员 我要去玩别的游戏啦
                else if (data.Action == "GotoNextGame") {
                    if (SocketClient.IsHomeowners) {
                        setTimeout(function () {
                            location.href = "http://c.admaster.com.cn/c/a52002,b574115,c2,i0,m101,h,u" + encodeURI(Cmn.Func.GetAbsoluteUrl("index.html").replace("index.html", "") + "yqc/index.html" + "?curGame=game1");
                        }, 250);
                    }
                    else {

                       // alert("请打开二维码扫描软件等待房主创建好房间哦！");
                        $(".jscTipsWeiChatSaoYiSaoPopWrap").fadeIn();

                        //if (window.confirm("房主邀请你去玩奇趣智力大冲关游戏，是否同意邀请？")) {

                        //    //如果是微信浏览器的话
                        //    if (Cmn.Func.IsWeiXin() && !!wx && !!wx.scanQRCode) {
                        //        wx.scanQRCode({
                        //            needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                        //            scanType: ["qrCode", "barCode"]
                        //        });
                        //    }
                        //    else {
                        //        //非微信处理

                        //        alert("请打开二维码扫描软件等待房主创建好房间哦！");
                        //    }
                        //}
                    }
                }
                
            });
            
            //游戏结束
            Game.TTGameManage.OnGameOver.Add(function (score) {
                
                //单人游戏 或者多人游戏里面的房主
                if (!Game.TTGameManage.IsMuleiPlayer) {
                    $(".jscResultPercentageIn1").hide();
                    $(".jscResultPercentageIn2").show();
                    //添加分数
                    CmnAjax.PostData(SiteFunc.GetItfUrl("AddGameHis"), { fraction: Math.ceil(score), game_id: "1" }, function (data) {
                        if (data.IsSuccess == "1") {
                            if (Cmn.IsType(data.Proportion, "number")) {
                                //单人游戏
                                $(".jscGameOverNum").html(Math.ceil(score));
                                $(".jscProportion").text(new Number(data.Proportion * 100).toFixed(1) + "%");
                            }
                        }
                        _self.FadeToPage(_Self.GameOverPageWrap);
                    });
                }
                else {
                    SocketClient.SendMsg({ Action: "AddGameHis", Score: score}, MsgTypeConfig.AllInMyRom);
                }
                
            });

            //错误
            //SocketClient.OnError.Add(function (data) {
            //    alert("链接失败！有可能是服务器太拥挤哦！");
            //});


            //监听游戏弹跳
            Game.TTGameManage.OnFlip.Add(function (isMulti) {
                if (isMulti) { AdMaster.CustomEvent("Game1_Multi_Mode", "Flip"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "Flip"); }
            });

            //初始化
            _self.OnShow.Add(function () {
                /// <summary>显示之前初始化</summary> 

                //清除画布
                Game.TTGameManage.Destroy();

                if (_self.IsInit == false) { return;}

                TTAnimate.SelectMode.Stop();
                //开始按钮隐藏
                $(".jscPeopleEnoughBtn").hide();
                //初始化显示人数的那个东西
                $(".jscYijiaruText span").text("0");
               
                //多人
                if (Game.TTGameManage.IsMuleiPlayer) {

                    AdMaster.Pageview("/Game1", "Multi/homepage");

                    //多人游戏的时候 创建socket链接
                    SocketClient.Connection(ClientConfig);
 
                    $(".jscWaitStartedPageTwoCode .jscTowCode").hide();
                    //等待加入页面显示
                    $(".jscWaitStartedPageWrap").show();

                    //监听当前玩家有没有吧球弹出去
                    Game.TTGameManage.OnBeyondTheTop.Remove().Add(function (pos) {
                        //告诉下一个人球要掉了
                        SocketClient.SendMsg({ Action: "EggDrop", Pos: pos }, MsgTypeConfig.MyRoomNextClientSendMsg);
                    });

                   // AdMaster.Pageview("/Game1", "Multi");
                }
                else {
                   // AdMaster.Pageview("/Game1", "Single");
                    //单人
                    $(".jscWaitStartedPageWrap").hide();
                    $(".jscCanvasWrap").show();
                    Game.TTGameManage.Ready(SocketClient.IsHomeowners);
                    AdMaster.Pageview("/Game1", "Single/gamepage");
                }

            });

        };

       //--------------------------------------------------------------
       //首页
        this.Game1HomeWrap = new function () {
            /// <summary>首页</summary>
            Cmn.Object.Inherit(this, Scenes, arguments);
            this.ID = "Game1HomeWrap";
            var _self = this;

            //开始游戏
            $("#Game1HomeWrap").on("touchstart", function () {
                // $(".EndEventsPopWrap").fadeIn();
                // return false;
                _self.FadeToPage(_Self.ModePageWrap);
                AdMaster.CustomEvent("Game1_Total", "Start");
            });

            $(".EndEventsPopWrap").on("touchstart", function () {
                $(this).fadeOut();
            });

            $("body").on("touchstart", function (e) { e.preventDefault(); });
            $("a").on("touchstart", function (e) { e.stopPropagation(); });
            //显示之前初始化
            _self.OnShow.Add(function () {
 
                //这边是扫二维码进来的用户
                var _roomid = Cmn.Func.GetParamFromUrl("rid");
                if (_roomid != "") {
                    Game.TTGameManage.IsMuleiPlayer = true;
                    SocketClient.RoomID = _roomid;
                    _self.FadeToPage(_Self.GameInterface);
                }

                TTAnimate.Home.Start();

            });

        };

       //--------------------------------------------------------------
       //选择模式
        this.ModePageWrap = new function () {
            /// <summary>选择模式</summary>
            Cmn.Object.Inherit(this, Scenes, arguments);
            this.ID = "ModePageWrap";
            var _self = this;

            //多人模式
            _Self.Click(".jscMultiplayerModeBtn", "tap", function () {
                //设置多人
                AdMaster.CustomEvent("Game1_Total", "Multi_player");
                Game.TTGameManage.IsMuleiPlayer = true;
                _self.FadeToPage(_Self.GameInterface);
            });

            //单人模式
            _Self.Click(".jscSingleModeBtn", "tap", function () {
                AdMaster.CustomEvent("Game1_Total", "Single_player");
                Game.TTGameManage.IsMuleiPlayer = false;
                _self.FadeToPage(_Self.GameInterface);

            });


            //活动规则按钮
            $(".jscGameRuleBtn").on("touchstart", function () {
                $(".jscRulePopWrap").fadeIn(300);
            });

            //关闭活动规则
            $(".jscCloseRulePopWrap").on("touchstart", function () {

                $(".jscRulePopWrap").fadeOut(300);
            });

            $(".jscRulePopWrap").on("touchstart", function (e) {
                e.stopPropagation();
            });

            //显示之前初始化
            _self.OnShow.Add(function () {
                //选择模式里面的动画
                $(".jscCanvasWrap").hide();
                TTAnimate.Home.Stop();
                TTAnimate.SelectMode.Start();
                Game.TTGameManage.Gameing = null;

                AdMaster.Pageview("/Game1", "Mode");

            })

        };

       //--------------------------------------------------------------
       //游戏结束
        this.GameOverPageWrap = new function () {
            Cmn.Object.Inherit(this, Scenes, arguments);
            this.ID = "GameOverPageWrap";
            var _self = this;
            
            //判断是不是从第二个游戏过来
            if (Cmn.Func.GetParamFromUrl("curGame") == "game2") {
                $(".jscChallengeNextBtn ,.jscTmallBtn").hide();
                $(".jscTmall").show();
            }


            //重玩
            _Self.Click(".jscGameOverReplayBtn", "tap", function (e) {

                var $_self = $(e.target).parents(".jscGameOverReplayBtn").length > 0 ? $(e.target).parents(".jscGameOverReplayBtn") : $(e.target);

                if ($_self.hasClass("jscCharts")) {

                    $(".jscLeaderboardPopWrap").fadeOut();
                    _self.FadeToPage(_Self.ModePageWrap);

                    //多人的话 就断开连接
                    if (Game.TTGameManage.IsMuleiPlayer && SocketClient.RoomID != "") {
                        //不是房主就断开连接
                        SocketClient.Destroy();
                        SocketClient.IsHomeowners = false;
                        SocketClient.RoomID = "";
                    }

                    if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Play_again_2"); }
                    else { AdMaster.CustomEvent("Game1_Single_Mode", "Play_again_2"); }

                }
                else {

                    //点击重玩
                    //如果是房主点击的 并且房间人数大于等于2个人
                    if (Game.TTGameManage.IsMuleiPlayer &&
                        SocketClient.IsHomeowners &&
                        _Self.GameInterface.PlayerCount >= 2 &&
                        _Self.GameInterface.Outline == 0) {
                        SocketClient.SendMsg({ Action: "GameReStart" }, MsgTypeConfig.AllInMyRom);
                    }
                    else {

                        //多人的话 就断开连接
                        if (Game.TTGameManage.IsMuleiPlayer && SocketClient.RoomID != "") {
                            SocketClient.Destroy();
                            SocketClient.IsHomeowners = false;
                            SocketClient.RoomID = "";
                        }
                        
                        $(".jscLeaderboardPopWrap").fadeOut();
                        _self.FadeToPage(_Self.ModePageWrap);
                    }

                    if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Play_again_1"); }
                    else { AdMaster.CustomEvent("Game1_Single_Mode", "Play_again_1"); }
                }

            });
            
            //挑战下个游戏
            _Self.Click(".jscChallengeNextBtn", "tap", function () {

                if (Game.TTGameManage.IsMuleiPlayer) {
                    AdMaster.CustomEvent("Game1_Multi_Mode", "Play_next");

                    if (Game.TTGameManage.IsMuleiPlayer &&
                       SocketClient.IsHomeowners &&
                       _Self.GameInterface.PlayerCount >= 2) {

                        SocketClient.SendMsg({ Action: "GotoNextGame" }, MsgTypeConfig.AllInMyRom);
                    }
                    else {

                        setTimeout(function () {
                            location.href = "http://c.admaster.com.cn/c/a52002,b574115,c2,i0,m101,h,u" + encodeURI(Cmn.Func.GetAbsoluteUrl("index.html").replace("index.html", "") + "yqc/index.html" + "?curGame=game1");
                        }, 250);
                    }

                }
                else {

                    AdMaster.CustomEvent("Game1_Single_Mode", "Play_next");

                    setTimeout(function () {
                        location.href = "http://c.admaster.com.cn/c/a52002,b574115,c2,i0,m101,h,u" + encodeURI(Cmn.Func.GetAbsoluteUrl("index.html").replace("index.html", "") + "yqc/index.html" + "?curGame=game1");
                    }, 250);
                }

            });
            
            //下载app
            $(".jscBottomMenuLink").on("touchstart", function (e) {

                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "KAPP"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "KAPP"); }

                setTimeout(function () {  window.location.href = "http://app.magic-kinder.com/zh/all/home"; }, 200);
                e.stopPropagation();
            });

   
            //天猫link
            $(".jscTmall").on("touchstart", function () {

                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Tmall_2"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "Tmall_2"); }

                setTimeout(function () {
                    location.href = "http://item.yhd.com/item/49020563?tp=222.13309_0.212.2_105.43.Kpv8KYB-10-Ak`iR";
                }, 200);
            })

            //天猫link
            $(".jscTmallBtn").on("touchstart", function () {
                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Tmall_1"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "Tmall_1"); }
            })

            //留资抽奖
            _Self.Click(".jscInfoLotteryBtn", "tap", function () {
                $(".jscLeaveMessagePopWrap1").fadeIn();
                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Luck_Draw"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "Luck_Draw"); }
            });

            //查看排行榜 
            _Self.Click(".jscCheckLeaderboardBtn", "tap", function () {

                if (SiteFunc.IsNewUser == "true") { $(".jscLeaveMessagePopWrap").show(); }
                else { _self.ShowGameCharts(); }

                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Rank"); }
                else { AdMaster.CustomEvent("Game1_Single_Mode", "Rank"); }

            });

            //炫耀高分
            _Self.Click(".jscLeaderboardReplayBtn", "tap", function (e) {
                //默认出现分享浮层

                var $_self = $(e.target).parents(".jscLeaderboardReplayBtn").length > 0 ? $(e.target).parents(".jscLeaderboardReplayBtn") : $(e.target);

                if ($_self.hasClass("jscScore")) {
                    if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Share_Score"); }
                    else { AdMaster.CustomEvent("Game1_Single_Mode", "Share_Score"); }
                }
                else {
                    if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "Share_Score_1"); }
                    else { AdMaster.CustomEvent("Game1_Single_Mode", "Share_Score_1"); }
                }
 
                if (Cmn.Func.IsWeiXin()) {
                    $(".jscSharePopWrap").show();
                }
                else {
                
                    window.location.href = 'http://service.weibo.com/share/share.php?title='
                        + encodeURIComponent(SiteFunc.ShareContent.Content + "") + '&url='
                        + encodeURIComponent(SiteFunc.ShareContent.Url)
                        + '&source=&appkey=&pic=' + encodeURIComponent(SiteFunc.ShareContent.Image);
                }
            });

            //关闭浮层
            _Self.Click(".jscCloseLayer", "tap", function () {
                $(this).parents(".jscLayer").fadeOut();
            });
            
            //提交资料
            _Self.Click(".jscLeaveMessageSubmitBtn", "tap", function (e) {

                var _desc = $.trim($(e.target).parents(".jscLayer").find(".jscInputName").val()),
                    _phone = $.trim($(e.target).parents(".jscLayer").find(".jscInputTel").val()),
                    _param = { userdesc: "", phone: "", email: "" };

                var _isClose = $(e.target).attr("close") == "true",
                    __self = this;

 
                if ($.trim(_desc) == "") { alert("姓名不能为空哦！"); return false; }
                if ($.trim(_phone) == "") { alert("手机或者邮箱不能为空哦！"); return false; }

                if ((/^0?1[3|4|5|8][0-9]\d{8}$/.test($.trim(_phone)))) {
                    _param.phone = _phone;
                } else if ((/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($.trim(_phone)))) {
                    _param.email = _phone;
                }
                else{ alert("手机或者邮箱格式填写错误！"); return false;}

                if (!(/(^[A-Za-z][\w\W]{3,30}$)|(^[\u4E00-\u9FA5]{2,15})$/.test($.trim(_desc)))) { alert("用户名首个字符只能是英文或者汉字，且长度不能低于4个字符也不能超过30个字符哦！"); return false; }


                _param.userdesc = _desc;

                CmnAjax.PostData(SiteFunc.GetItfUrl("UpdateUserInfo"), _param, function (data) {
                   
                    if (data.IsSuccess == "1") {
                        if (_isClose) {
                            if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "CRM_submit2"); }
                            else { AdMaster.CustomEvent("Game1_Single_Mode", "CRM_submit2"); }

                            _self.ShowGameChartsRef();
                        }
                        else {
                            _self.ShowGameCharts();

                            if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.CustomEvent("Game1_Multi_Mode", "CRM_submit"); }
                            else { AdMaster.CustomEvent("Game1_Single_Mode", "CRM_submit"); }
                        }

                        $(__self).parents(".jscLayer").fadeOut();

                        $(".jscLeaveMessagePopWrap1 .jscInputName").val(_param.userdesc);
                        $(".jscLeaveMessagePopWrap1 .jscInputTel").val(_param.phone || _param.email);
                        $(e.target).parents(".jscLayer").find(".jscInputName").val("");
                        $(e.target).parents(".jscLayer").find(".jscInputTel").val("");
                        SiteFunc.IsNewUser = false;



                    }
                    else {
                        alert(data.ErrMsg);
                    }

                });
            });

            //轻触浮层消失
            $(".jscSharePopWrap").on("touchstart", function () { $(this).fadeOut(); }); 

            //显示之前
            _self.OnShow.Add(function () {
                var _text = "轻轻松松就有" + $(".jscGameOverNum").text() + "分，我果然是不可战胜的！你也来感受一下？";
                if (Game.TTGameManage.IsMuleiPlayer) {
                     _text = "我们全家拿了" + $(".jscGameOverNum").text() + "分，默契度战胜了银河系" + $(".jscProportion").text() + "的家庭！不服来战！";
                }
                SiteFunc.SetShare(undefined, _text);
                 
                if (Game.TTGameManage.IsMuleiPlayer) { AdMaster.Pageview("/Game1", "Single/result"); }
                else { AdMaster.Pageview("/Game1", "Multi/result"); }

                //非房主 重新开始变成返回按钮
                if (SocketClient.IsHomeowners) {
  
                    $(".jscGameOverReplayBtn img").eq(0).show();
                    $(".jscGameOverReplayBtn img").eq(1).hide();
                }
                else { 
                    if ($(".jscYijiaruText span").text() > 0) {
                        $(".jscGameOverReplayBtn img").eq(1).show();
                        $(".jscGameOverReplayBtn img").eq(0).hide();
                    } else {
                        //单人模式
                        $(".jscGameOverReplayBtn img").eq(0).show();
                        $(".jscGameOverReplayBtn img").eq(1).hide();
                    } 
                }

                
                if (!Cmn.Func.IsWeiXin()) {
                    $(".BottomMenuBgLogo").hide();
                }
                

            });

             //显示排行榜
            _self.ShowGameCharts = function () {
                 //提交成功之后 显示排行榜
                 CmnAjax.PostData("/Itf/Php/AjaxItf.php", {
                     method: "GetSqlData",
                     ItfName: "GetGameCharts",
                     game_id: "1",
                     user_id: SiteFunc.UserID
                 }, function (data) {
                   
                     var _isTop4 = false;
                     for (var _i = 0, _len = data.data.length; _i < _len; _i++) {

                         if (data.data[_i]["num"] == "") {
                             data.data[_i]["select"] = ""; 
                             data.data[_i]["num"] = _i + 1;
                         }
                         else { data.data[_i]["select"] = "Select"; }

                         if (data.data[_i]["user_id"] == data.data[_len - 1]["user_id"] && _i < _len-1) {
                             data.data[_i]["select"] = "Select";
                             _isTop4 = true;
                         }
                     }

                     if (!!data.data) {
                         if (_isTop4 == false) { data.data[_len - 2] = data.data[_len - 1];}
                         data.data.length = _len - 1;
                     }

                     Cmn.FillData(".jscLeaderboardList", data.data);
                    
                     $(".jscLeaveMessagePopWrap").hide();
                     $(".jscLeaderboardPopWrap").show();
                 });
             }

            //显示排行榜
            _self.ShowGameChartsRef = function () {
                //提交成功之后 显示排行榜
                CmnAjax.PostData("/Itf/Php/AjaxItf.php", {
                    method: "GetSqlData",
                    ItfName: "GetGameCharts",
                    game_id: "1",
                    user_id: SiteFunc.UserID
                }, function (data) {

                    var _isTop4 = false;
                    for (var _i = 0, _len = data.data.length; _i < _len; _i++) {

                        if (data.data[_i]["num"] == "") {
                            data.data[_i]["select"] = "";
                            data.data[_i]["num"] = _i + 1;
                        }
                        else { data.data[_i]["select"] = "Select"; }

                        if (data.data[_i]["user_id"] == data.data[_len - 1]["user_id"] && _i < _len - 1) {
                            data.data[_i]["select"] = "Select";
                            _isTop4 = true;
                        }
                    }

                    if (!!data.data) {
                        if (_isTop4 == false) { data.data[_len - 2] = data.data[_len - 1]; }
                        data.data.length = _len - 1;
                    }

                    Cmn.FillData(".jscLeaderboardList", data.data); 
                });
            }

        }

        AdMaster.Pageview("/Game1", "Homepage");
   }

   var _LoadCount = 0;
   var _LoadComplete = function () {
       if (++_LoadCount >= 2) {
           $(".LoadingWrap").fadeOut(500);
           //游戏1首页
           $(".jscWrap").show();
           window.TTControl.Game1HomeWrap.OnShow.Trigger();
       }
   }

   Game.TTGameManage.OnLoadComplete.Add(_LoadComplete)
   Cmn.Func.ImageLazyLoading("body", function (pro) {
       $(".LoadingVlaue").html(pro + "%");
   }, _LoadComplete);

}

CmnAjax.ShowAjaxHandleHint = function () { };

$(PageLoad);
AdMaster.Init('4dd9da9');
