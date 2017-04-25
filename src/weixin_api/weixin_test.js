var wXUtils = require('weixin_base_api.js');
var request = require('request');

var token = "aaa123";

//验证token
var checkToken = function(req, res) {
    console.log(">>>>>>>>>>>>>>>>>>");
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var list = [token, timestamp, nonce].sort();
    var hashcode = wXUtils.sha1(list.join(''));
    console.log(hashcode);
    console.log(signature);
    if (hashcode === signature) {
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<");
        res.send(echostr);
    } else {
        res.send("");
    }
}

/**
 * 获取access_token和网页jssdk_ticket
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var getAccessToken = function(req, res) {
	wXUtils.getAccessToken();
}

module.exports = {
    checkToken: checkToken,
    getAccessToken:getAccessToken
}

