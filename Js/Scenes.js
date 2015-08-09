/// <reference path="../../Js/ThirdLib/jquery.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/jquery.js*/ />
/// <reference path="../../Js/ThirdLib/TweenMax.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/TweenMax.min.js*/ />
/// <reference path="../../Js/Cmn.js"/*tpa=http://www.kinderino.com.cn/Js/Cmn.js*/ />

function Scenes() {
    var _Self = this;
    //场景id
    _Self.ID = "";
    //显示之前
    _Self.OnShow = new Cmn.Event(this);
    //现实之后
    _Self.AfterShow = new Cmn.Event(this);
    //隐藏之前
    _Self.OnHide = new Cmn.Event(this);
    //隐藏之后
    _Self.AfterHide = new Cmn.Event(this);
    //场景切换动画执行之前
    _Self.BeforAnimateRun = new Cmn.Event(this);
     
    _Self.FadeToPage = function (target) {
        if (target && !!target.ID) {
            try {  target.OnShow.Trigger([$("#" + target.ID)]);  } catch (e) {  }
            $("#" + target.ID).css({ "z-index": "0", "display": "block" });
            target.AfterShow.Trigger([$("#" + target.ID)]);
            _Self.OnHide.Trigger([$("#" + _Self.ID)]);
            $("#" + _Self.ID).css({ "z-index": "1" }).fadeOut(500, function () {  _Self.AfterHide.Trigger([$(this)]); });
        }
    }
     
    //专职game2切换 
    _Self.Game2ToPage = function (target) {
        alert("a");
        if (target && !!target.ID) {
            alert("b");
            target.OnShow.Trigger([$("#" + target.ID)]);
            alert("c");
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
                TweenMax.to($("#" + target.ID).find(".jscCirclePadding"), 0.4, {
                    delay: 0.2, scaleX: 0, scaleY: 0, ease:Linear.easeIn, onComplete: function () {
                        target.AfterShow.Trigger([$("#" + target.ID)]);
                    }
                });
            }
            else { target.AfterShow.Trigger([$("#" + target.ID)]); }
            
            _Self.OnHide.Trigger([$("#" + _Self.ID)]);
            $("#" + _Self.ID).hide();
            _Self.AfterHide.Trigger([$("#" + _Self.ID)]);
        }
    }

}