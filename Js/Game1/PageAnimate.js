/// <reference path="../../../Js/ThirdLib/TweenMax.min.js"/*tpa=http://www.kinderino.com.cn/Js/ThirdLib/TweenMax.min.js*/ />
var TTAnimate = {

    Home: new function () {
        /// <summary>首页小男孩动画</summary>
        var _Tween = null,
            _Tween2 = null,
            _Runing = true;

        this.Start = function () {
            _Runing = true; 
             
            //马车转圈圈
            TweenMax.set($(".jscCircusWrap")[0], { x: 0, y: -30, rotation: "17" });

            var _scalew = $(window).width() / 640,
                _scaleh = $(".HomeBgLawn img").height() / 180;

            _Tween2 = new TweenMax($(".jscCircusWrap")[0], 5, {
                //repeat: -1,
                bezier: [
                    { x: -70 * _scalew, y: -40 * _scaleh, rotation: "+=2" },
                    { x: -180 * _scalew, y: -70 * _scaleh, rotation: "-=2" },
                    { x: -360 * _scalew, y: -85 * _scaleh, rotation: "-=15" },
                    { x: -480 * _scalew, y: -73 * _scaleh, rotation: "-=24" },
                    { x: -650 * _scalew, y: -25 * _scaleh, rotation: "-=38" }
                ],
                ease: Quad.easeInOut
            });

        }

        this.Stop = function () {
            _Runing = false;
            if (_Tween != null) {
                _Tween.pause(false);
                _Tween2.pause(false);
                $(".jscVillain").removeAttr("style");
                $(".jscCircusWrap").removeAttr("style");
            }
        }

    },
    SelectMode: new function () {
        /// <summary>选择模式界面火箭动画</summary>
        var _Tween = null,
            _Runing = true;

        this.Start = function () {
         
            if (_Tween != null) { _Tween.resume(); return false; }
            
            TweenMax.set($(".jscPenguin")[0], { x: 0, y: 0, rotation: "0" });

            var _scale = $(window).width() / 640;

            _Tween = new TweenMax($(".jscPenguin")[0], 7, {
                repeat:-1,
                bezier: [
                    { x: -450 * _scale, y: -380 * _scale, rotation: "-20" },
                    { x: -780 * _scale, y: 0, rotation: "-120" }
                ],
                ease: Quart.easeIn
            });

        }

        this.Stop = function () {
            if (_Tween != null) { _Tween.pause(true); $(".jscPenguin").removeAttr("style");}
        }

    }


} 