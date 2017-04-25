var baseUtils=require('base_utils.js');
/**
 * 生成签名字符串
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 */
exports.signature = function(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    console.log(string);
    return string;
};


exports.signatureForPaySign = function(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    console.log(string);
    return string;
};


/**
 * @synopsis 签名算法 
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
exports.sign = function(url) {
    var ret = {
        jsapi_ticket: JSON.parse(readWXConfig()).jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    };
    var string = sha1(signature(ret));
    ret.signature = string;
    ret.appid = JSON.parse(readWXConfig()).appid
    return ret;
};