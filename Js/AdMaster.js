var _smq = _smq || [];
var AdMaster = {
    Switch:true,
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