/// <reference path="../../Js/CmnTools/WechatShare.js"/*tpa=http://www.kinderino.com.cn/Js/CmnTools/WechatShare.js*/ />
/// <reference path="../../Js/ThirdLib/jquery.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/jquery.js*/ />
/// <reference path="../../Js/ThirdLib/TweenMax.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/TweenMax.min.js*/ />
/// <reference path="../../Js/Cmn.js"/*tpa=http://www.kinderino.com.cn/Js/Cmn.js*/ />

var SiteFunc = {
    //接口地址
    ItfUrl: "http://www.kinderino.com.cn/Itf/Php/DataItf.php",
    //用户代码
    UserID: Cmn.Func.Cookie.Get("kinder_UserID"),
    //openid
    OpenID: Cmn.Func.Cookie.Get("kinder_OpenID"),
    //是否是新进用户
    IsNewUser: true,
    //设置分享的次数
    SetShareCount: 0,
    ShareContent : {
        Title: "奇趣多屏弹弹球，儿童节带孩子玩个新花样！",
        Content: "奇趣多屏弹弹球，儿童节带孩子玩个新花样！",
        Image: "http://" + Cmn.Func.GetMainDomain() + "/mobile/images/share1.jpg",
        Url: Cmn.Func.GetAbsoluteUrl("http://www.kinderino.com.cn/mobile/Js/index.html")
    },
    SetShare: function (title, content, callback) {
        if (Cmn.Func.IsWeiXin() && SiteFunc.SetShareCount==0) {
            // 微信Js API Config
            CallJsApiWXConfigItf("http://wechat.cagoe.com/JsApiWXConfig.aspx");
        }

        title && (SiteFunc.ShareContent.Title = title);
        content && (SiteFunc.ShareContent.Content = content);
        if (Cmn.Func.IsWeiXin()) {
            SetWechatShare(SiteFunc.ShareContent.Title,
                SiteFunc.ShareContent.Content,
                SiteFunc.ShareContent.Url,
                SiteFunc.ShareContent.Image, function () {

                setTimeout(function () {
                    window.location.href = "http://taoquan.taobao.com/coupon/unify_apply.htm?sellerId=2200445718&activityId=5443b360532747fdbe456ba4f4adeb7b";
                }, 500);
                callback && callback();
                });

            SetWechatShareToTimeline(SiteFunc.ShareContent.Content, SiteFunc.ShareContent.Content);
        }

        SiteFunc.SetShareCount++;
    },
   
    GetItfUrl : function (methodName) {
         /// <summary>获取接口地址</summary>
         /// <param name="methodName" type="String">方法名称</param>
        return this.ItfUrl + "?method=" + methodName;
    },
    GetDevice: function () {
        /// <summary>获取设备名称</summary>

        var _device = Cmn.Func.IsMobile() ? "Mobile" : "PC";
        return _device;
    },
    GetSource : function () {
        /// <summary>获取来源</summary>
        return Cmn.Func.GetMainDomain();
    },
    //创建用户
    CreateUser: function (callback) {

        var _UserDesc = "";
        //没有用户存在
        if (SiteFunc.OpenID == "" && SiteFunc.UserID == "") {

            SiteFunc.OpenID = Cmn.Func.GetParamFromUrl("OpenID");
            _UserDesc = Cmn.Func.GetParamFromUrl("NickName");

            //微信浏览器 
            if (Cmn.Func.IsWeiXin() && SiteFunc.OpenID == "") {

                if (SiteFunc.OpenID == "") {
                    var _url = encodeURIComponent(Cmn.Func.GetAbsoluteUrl("index.html?rid=" + Cmn.Func.GetParamFromUrl("rid") + "&u=" + Cmn.Func.GetParamFromUrl("u") + "&p=" + Cmn.Func.GetParamFromUrl("p")));
                    _url = encodeURIComponent("http://wechat.cagoe.com/Oauth.aspx?OauthType=snsapi_base&ReturnUrl=" + _url);
                    _url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3627c694125ae3ff&redirect_uri=" + _url +
                        "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
                    window.location.href = _url;
                    return false;
                }

                Cmn.Func.Cookie.Set("kinder_OpenID", SiteFunc.OpenID);
            }
        }
       
        //创建用户
        CmnAjax.PostData(SiteFunc.GetItfUrl("CreateUser"), { device: SiteFunc.GetDevice(), source: SiteFunc.GetSource(), openid: SiteFunc.OpenID, userdesc: _UserDesc, game_id: "1" }, callback);
        //随机服务
        this.RandomService();
    },
    P: "",
    U:"",
    //随机服务
    RandomService: function () {

        //获取页面url上的 服务器数据
        this.P = Cmn.Func.GetParamFromUrl("p");
        this.U = Cmn.Func.GetParamFromUrl("u");

        var _serverLocalCfg = [[10000, "http://www.kinderino.com.cn/mobile/Js/42.159.233.162"], [10001, "http://www.kinderino.com.cn/mobile/Js/42.159.233.162"]],
            _connetionCfg = null;

        if (this.P == "" && this.U=="") {
            _connetionCfg = _serverLocalCfg[Cmn.Math.Random(0, 1)];
            if (!!_connetionCfg && _connetionCfg.length > 0) {
                this.P = _connetionCfg[0];
                this.U = _connetionCfg[1];
            }
            else {
                _connetionCfg = _serverLocalCfg[1];
                this.P = _connetionCfg[0];
                this.U = _connetionCfg[1];
            }
        }
        
         ClientConfig.ConnectionCfg = { Prot: this.P, ServerUrl: "http://" + this.U + ":" + this.P };
    }
}


var _smq = _smq || [];
var AdMaster = {
    Switch: true,
    //ad master 检测初始化
    Init: function (siteID) {
        /// <summary>检测初始化</summary>
        /// <param name="siteID" type="string">站点代码</param>

        if (this.Switch == false) { return false; }
        _smq.push(['_setAccount', siteID, new Date()]);
        _smq.push(['pageview']);
        (function () {
            var sm = document.createElement('script'); sm.type = 'text/javascript'; sm.async = true;
            sm.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdnmaster.com/sitemaster/collect.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(sm, s);
        })();
    },
    //自定义事件 
    CustomEvent: function (type, lal) {
        /// <summary>自定义事件</summary>
        /// <param name="type" type="string">事件分类</param>
        /// <param name="lal" type="string">事件标签</param>
        if (this.Switch == false) { return false; }
        _smq.push(['custom', type, lal]);
    },
    //虚拟页面
    Pageview: function (pageUri, pageName) {
        /// <summary>虚拟页面</summary>
        /// <param name="pageUri" type="string">页面uri</param>
        /// <param name="pageName" type="string">页面名称</param>
        if (this.Switch == false) { return false; }
        _smq.push(['pageview', pageUri, pageName]);
    }

}

function Scenes() {
    var SiteFunc = this;
    //场景id
    SiteFunc.ID = "";
    //显示之前
    SiteFunc.OnShow = new Cmn.Event(this);
    //现实之后
    SiteFunc.AfterShow = new Cmn.Event(this);
    //隐藏之前
    SiteFunc.OnHide = new Cmn.Event(this);
    //隐藏之后
    SiteFunc.AfterHide = new Cmn.Event(this);
    //场景切换动画执行之前
    SiteFunc.BeforAnimateRun = new Cmn.Event(this);

    SiteFunc.FadeToPage = function (target) {
        if (target && !!target.ID) {
            try { target.OnShow.Trigger([$("#" + target.ID)]); } catch (e) { }
            $("#" + target.ID).css({ "z-index": "0", "display": "block" });
            target.AfterShow.Trigger([$("#" + target.ID)]);
            SiteFunc.OnHide.Trigger([$("#" + SiteFunc.ID)]);
            $("#" + SiteFunc.ID).css({ "z-index": "1" }).fadeOut(500, function () { SiteFunc.AfterHide.Trigger([$(this)]); });
        }
    }

    //专职game2切换 
    SiteFunc.Game2ToPage = function (target) {

        if (target && !!target.ID) {

           
            target.OnShow.Trigger([$("#" + target.ID)]);
            var _mainEle = $("#" + target.ID).find(".jscMainEle"),
                _light = $("#" + target.ID).find(".jscLight");
            if (_mainEle.length > 0) { TweenMax.set(_mainEle, { scaleX: 0, scaleY: 0, transformOrigin: "50% 100%" }); }
            if (_light.length > 0) { TweenMax.set(_light, { alpha: 0, scaleX: 0, scaleY: 0 }); }

            if ($("#" + target.ID).hasClass("Game1HomeWrap")) {
                $(".jscHomeBorder").show();
                $(".jscPart2Border").hide();
            }
            else {
                $(".jscHomeBorder").hide();
                $(".jscPart2Border").show();
            }

            $("#" + target.ID).show();

            var _circle = $("#" + target.ID).find(".jscCirclePadding");
            if (_circle.length > 0) {
                target.BeforAnimateRun.Trigger([$("#" + target.ID)]);

                if (_light.length > 0) { TweenMax.to(_light, 0.9, { delay: 0.3, alpha: 1, scaleX: 1, scaleY: 1, ease: Back.easeOut }); }

                TweenMax.to($("#" + target.ID).find(".jscCirclePadding"), 0.4, {
                    delay: 0.2, scaleX: 0, scaleY: 0, ease: Linear.easeIn, onComplete: function () {
                        target.AfterShow.Trigger([$("#" + target.ID)]);
                        if (_mainEle.length > 0) { TweenMax.to(_mainEle, 0.6, { scaleX: 1, scaleY: 1, ease: Back.easeOut }); }
                    }
                });
            }
            else {
                target.AfterShow.Trigger([$("#" + target.ID)]);
                if (_mainEle.length > 0) { TweenMax.to(_mainEle, 0.6, { scaleX: 1, scaleY: 1, ease: Back.easeOut }); }
            }

            SiteFunc.OnHide.Trigger([$("#" + SiteFunc.ID)]);
            $("#" + SiteFunc.ID).hide();
            SiteFunc.AfterHide.Trigger([$("#" + SiteFunc.ID)]);
        }
    }

}