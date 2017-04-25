/**
 * 生成商品的订单号，绝对唯一的字符串
 * @return {[type]} [description]
 */
exports.getOutTradeNo = function(params) {
    var _params = (params === undefined ? "" : params);
    var outTradeNo = "";
    var date = moment();
    var millisecond = date.millisecond();
    var millisecond_str = ""; //毫秒数
    if (millisecond < 10) {
        millisecond_str = "00" + millisecond;
    } else if (millisecond >= 10 && millisecond < 100) {
        millisecond_str = "0" + millisecond;
    } else {
        millisecond_str = millisecond;
    }
    var random_str = Math.floor(Math.random() * 10).toString(); //随机数
    var outTradeNo = date.format("YYYY-MM-DD HH:mm:ss").replace(/-/g, "").replace(/:/g, "").replace(" ", "") + millisecond_str + random_str + _params;
    console.log(outTradeNo);
    return outTradeNo;
};



//sha1加密
exports.sha1=function(str) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    var sha1Str = sha1.digest("hex");
    return sha1Str;
};


/**
 * 获取随机数
 * @return {[type]} [description]
 */
exports.createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};

/**
 * 获取时间戳
 * @return {[type]} [description]
 */
exports.createTimestamp = function() {
    return parseInt(new Date().getTime() / 1000) + '';
};



/**
 * md5加密
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
exports.md5 = function(str) {
    var md5 = crypto.createHash('md5');
    md5.update(str, 'utf-8');
    return md5.digest('hex');
};

/**
 * aes加密
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
exports.aesEncrypt = function(data) {
    var cipher = crypto.createCipher('aes-128-ecb', "dadasdasdasdadasd");
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};


/**
 * aes解密
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
exports.aesDecrypt = function(data) {
    var cipher = crypto.createDecipher('aes-128-ecb', "dadasdasdasdadasd");
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
};


/**
 * 解析xml格式数据为json数据
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
exports.parseEventMessage = function(data, cb) {
    console.log("xml解析");
    var parser = new xml2js.Parser({ explicitArray: false });
    //解析微信推送的数据
    parser.parseString(data.toString(), function(err, json) {
        console.warn(err)
        if (err) {
            console.error(err);
            cb(err, null);
        } else {
            cb(null, json);
        }
    });
}

/**
*req数据流转换为字符串
*@param req
*/
exports.reqStreamToStr=function(req,cb){

	  //设置字符编码
      res.setEncoding('utf8');

      //返回数据流
      var _data="";

      //数据
      res.on('data', function (chunk) {
        _data+=chunk;
        console.log('BODY: ' + chunk);
      });

      // 结束回调
      res.on('end', function(){
        console.log("REBOAK:",_data)
        cb(null,_data);
      });

      //错误回调
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
		cb(e.message,null);
      });

}