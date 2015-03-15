
(function(){  
   
    var priceLimit = parseInt(/\d+/.exec($(".fore4 del").html())*1*0.6);
    var addr = document.location.href;
    if("http://auction.jd.com/".indexOf(addr)>=0){
        return;
    }
    var uid = /[\d]{4,8}/.exec(addr)[0];
    var isauto=false,timeDelayId,timeIntervalId,blanksp="&nbsp;&nbsp;&nbsp;&nbsp;";
    var code = "<div id='qp_div'>"
            + "商品6折价：<input type='text' id='qp_price_limit' readonly />"+blanksp
            + "最高出价<input type='text' id='qp_max_price' />"+blanksp
            + "<input type='button' value='后台开抢' id='qp_btn_begin' class='qp_btn'/>"+blanksp
            + "<input type='button' value='仅刷价格' id='qp_btn_refresh' class='qp_btn' />"+blanksp
            + "<input type='button' value='自动拍' id='qp_btn_auto' class='qp_btn' />"+blanksp
            + "【开启控制台可查看抢拍提示】</div>";
    $('body').prepend(code);
    $('#qp_price_limit').val(priceLimit);
    $('#qp_max_price').val(priceLimit);

    $('#qp_btn_refresh').on('click', function(){queryPrice(uid, priceLimit);});
    $('#qp_btn_begin').on('click', function(){crazyBuying(uid, priceLimit);});
    $('#qp_btn_auto').on('click', autoBuying);

    function queryPrice(uid, priceLimit) {
        console.info("自动报价，"+uid+"自动输入价格。");
        var price;
        var priceMax = $('#qp_max_price').val();
        var time = new Date().getTime();
        var queryIt = "http://auction.jd.com/json/paimai/bid_records?t="
                + time + "&pageNo=1&pageSize=1&dealId=" + uid;
        $.get(queryIt, function(data){
            price = data.datas[0].price*1+1;
            if (price<=priceMax) {
               $("#quantityFormId ").find(".quantity-text:last").val(price);
            } else {
                console.info("超出限制价格，不自动输入抢拍价！");
                $('#qp_btn_auto').val("自动抢");
                clearTimeout(timeDelayId);
                clearTimeout(timeIntervalId);
            }
        });
    }

    function crazyBuying(uid, priceLimit) {
        console.info("抢拍商品"+uid+"自动提交抢拍价。");
        var price;
        var priceMax = $('#qp_max_price').val();
        var time = new Date().getTime();
        var queryIt = "http://auction.jd.com/json/paimai/bid_records?t="
                + time + "&pageNo=1&pageSize=1&dealId=" + uid;
        $.get(queryIt, function(data){
            price = data.datas[0].price*1+1;
            if (price<=priceMax) {
                var buyIt = "http://auction.jd.com/json/paimai/bid?t="
                    + time + "&dealId=" + uid + "&price=" + price;
                $.get(buyIt, function(data){
                    sayMsg(data);
                }, 'json');
            } else {
                console.info("超出限制价格，停止抢购！");
                $('#qp_btn_auto').val("自动抢");
                clearTimeout(timeDelayId);
                clearTimeout(timeIntervalId);
            }
        });
    }

    function autoBuying(){
        isauto=!isauto;
        var $btn=$("#qp_btn_auto");
        if(isauto){   
            //拍卖未结束
            var overTime=$('#product-intro').find(".over-time").text();
            var delayTime=0;
            if(overTime.indexOf("小时")>0){
                delayTime+=parseInt(overTime.substring(0,overTime.indexOf("小时")))*3600*1000;
            }
            if(overTime.indexOf("分")>0){
                delayTime+=parseInt(overTime.substring(overTime.indexOf("分")-2,overTime.indexOf("分")))*60*1000;
            }
            if(overTime.indexOf("秒")>0){
                delayTime+=parseInt(overTime.substring(overTime.indexOf("秒")-2,overTime.indexOf("秒")))*1000;
            }
            if(delayTime>0){
                $btn.val("抢拍中");
                if(delayTime<=3500){
                    delayTime=0;
                }else{
                    delayTime-=3500;
                }
                console.log("定时抢拍中......");
                timeDelayId = setTimeout(startBuying,delayTime);
            }else{
                $btn.val("拍卖结束");
            }
        }else{
           $btn.val("自动抢");
           clearTimeout(timeDelayId);
           clearTimeout(timeIntervalId);
        }
    }
    
    function startBuying(){
        timeIntervalId=setInterval(function(){crazyBuying(uid, priceLimit);},500);
    }

    function sayMsg(response) {
        if (response.code == "200") {
            doErrorMsg("恭喜您！","出价成功");
        } else {
            if (response.code == "453") {
                doErrorMsg("哎呀！出价失败~","请您不要连续出价~");
            }
            if (response.code == "451") {
                doErrorMsg("哎呀！出价失败~","出价不得低于当前价格~");
            }
            if (response.code == "452") {
                doErrorMsg("哎呀！出价失败~","拍卖尚未开始，暂不能出价~");
            }
            if (response.code == "450") {
                doErrorMsg("哎呀！出价失败~","拍卖已经结束，您略晚了一步~");

            }
    /*            if (response.code == "455") {
                alert("您的京豆不足或三次试拍机会已用完！");
            }*/
            if (response.code == "457") {
                doErrorMsg("哎呀！出价失败~","您暂无参拍资格~");
            }
    /*           if (response.code == "467") {
                alert("银牌及以上会员京豆小于等于0，不能出价!");
            }*/
            if (response.code == "459") {
                doErrorMsg("哎呀！出价失败~","出价不能低于商品起拍价~");
            }
            if (response.code == "460") {
                doErrorMsg("哎呀！出价失败~","每次加价不得低于最低加价~");
            }
            if (response.code == "461") {
                doErrorMsg("哎呀！出价失败~","每次加价不得高于最高加价~");
            }
            if (response.code == "462") {
                doErrorMsg("哎呀！出价失败~","您所出的价格不能超过该商品的京东价~");
            }
            if (response.code == "463") {
                doErrorMsg("哎呀！出价失败~","出价格式不对！所出价格必须为正整数~");
            }
            if (response.code == "464") {
                doErrorMsg("哎呀！出价失败~","您来晚了一步，本次拍卖已关闭~");
            }
            if (response.code == "465") {
                doErrorMsg("哎呀！出价失败~","您来晚了一步，本次拍卖已删除~");
            }
            if (response.code == "466") {
                doErrorMsg("哎呀！出价失败~","您的账户异常，请稍后再试~");
            }
            if (response.code == "468") {
                doErrorMsg("哎呀！出价失败~","出价异常，请稍后再试~");
            }
            if (response.code == "469") {
                doErrorMsg("哎呀！出价失败~","尊敬的京东会员,您的京豆需要大于0才可参与拍卖！");
            }
            if (response.code == "470") {
                doErrorMsg("哎呀！出价失败~","尊敬的京东会员,您的京豆需要大于等于0才可参与拍卖！");
            }
            if (response.code == "471") {
                doErrorMsg("尊敬的京东会员,为了保障您的账户安全,请先设置京东支付密码!","<a href='http://safe.jd.com/user/paymentpassword/safetyCenter.action' target='blank'>【点我设置支付密码】</a>");
            }
            if (response.code == "4201") {
                doErrorMsg("哎呀！出价失败~","您同时在拍的商品不得超过5个！");
            }
            if (response.code == "4202") {
                doErrorMsg("哎呀！出价失败~","您在夺宝岛获拍且未支付的拍卖不得超过5个!");
            }
            if (response.code == "4203") {
                doErrorMsg("哎呀！出价失败~","您于夺宝岛在拍或未支付的商品总数不得超过5个!");
            }

            if (response.code == "400") {
                doErrorMsg("哎呀！出价失败~","系统异常，请稍后再试~");
            }
            if (response.code == "403") {
                 doErrorMsg("哎呀！出价失败~","你还没登录~");
                 return ;
            }
            if (response.code == "402") {
                doErrorMsg("哎呀！出价失败~","系统响应异常，请稍后再试~");
            }
        }
    }

    function doErrorMsg(title, msg) {
        console.log(title + " %c "+msg, "color:red;" )
    }
})();







