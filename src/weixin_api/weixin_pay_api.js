/*
 *微信支付相关的接口模块
 */
var request = require('request');
var weixinUtils = require('weixin_base_api.js');
var xml2js = require('xml2js');
var payConf = require("../config/pay_config.json");
//统一下单接口
exports.unifiedOrderApi = function(orderObject, cb) {
    var builder = new xml2js.Builder({ cdata: true, rootName: "xml" });
    //参数签名
    // var sign_str = weixinUtils.signature(orderObject)+"&key=shangyang123shangyang123shangyan";
    var sign_str = weixinUtils.signature(orderObject) + "&key="+payConf.key;
    var requestData = orderObject;
    requestData.sign = weixinUtils.md5(sign_str).toUpperCase();
    console.log("向微信服务器请求的下单数据如下:");
    console.log("================================================>");
    var requestBody = builder.buildObject(requestData); //请求参数对象
    console.log(requestBody);
    var fs = require('fs');
    // fs.writeFileSync("./a.xml", requestBody);
    console.log("================================================>");
    // var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";

    //发送xml请求
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "text/html;"
        },
        body: requestBody.toString()
    }, function(error, response, body) {
        // console.error("<=============================================>");
        // console.log(error);
        // console.warn(response);
        // console.error("<=============================================>");
        if (!error && response.statusCode == 200) {
            console.log("微信服务器返回的下订单数据如下:");
            console.log("<====================================================");
            console.log(body);
            console.log('<=====================================================')
            cb(null, body);
        } else {
            console.log("error!!! 微信服务器返回的数据如下:");
            console.log("<====================================================");
            console.error(error);
            console.log("<====================================================");
            cb(error, null);
        }
    });
}



//测试统一下单接口
exports.testUnifiedOrderApi = function(orderObject, cb) {

    weixinUtils.getTestUnifiedOrderApiSignkey(orderObject.mch_id, function(err, result) {
        console.error(err);
        console.log(result);
    });

    var builder = new xml2js.Builder({ cdata: true });
    //参数签名
    var sign_str = weixinUtils.signature(orderObject);
    var requestData = orderObject;
    requestData.sign = weixinUtils.md5(sign_str).toUpperCase();
    var requestBody = builder.buildObject({ xml: requestData }); //请求参数对象
    // var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    var url = "https://api.mch.weixin.qq.com/sandboxnew/pay/unifiedorder";
    console.log(requestBody);
    //发送xml请求
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "text/html;"
        },
        body: requestBody.toString()
    }, function(error, response, body) {
        console.error("<=============================================>");
        console.log(error);
        console.error("<=============================================>");
        if (!error && response.statusCode == 200) {
            console.log("数据请求成功！")
            console.log(body);
            cb(null, body);
        } else {
            console.log(error);
            cb(error, null);
        }
    });
}
