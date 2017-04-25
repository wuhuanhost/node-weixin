var fs = require('fs');
var path = require('path');
var request = require('request');
var crypto = require('crypto');
var xml2js = require('xml2js');
var moment = require('moment');

var readWXConfig = function() {
    var wxConf = fs.readFileSync(path.resolve(__dirname, '../', 'config/', 'weixin_config.json'));
    return wxConf;
};

var writeWXConfig = function(wxConf) {
    fs.writeFileSync(path.resolve(__dirname, '../', 'config/', 'weixin_config.json'), JSON.stringify(wxConf, null, 4));
};

/**
 * 获取微信的基础access_token,微信access_token临时保存地方，7200秒刷新一次，修改本文件里面新获取到的access_token相关的值
 * @return {[type]} [description]
 */
exports.getAccessToken = function() {
    console.log("获取access_token");
    var wxConf = JSON.parse(readWXConfig());
    var APPID = wxConf.appid;
    var APPSECRET = wxConf.secret;
    var getAccessTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET;
    request.get(getAccessTokenUrl, function(err, response, body) {
        console.log(err + "dfasfsdfsdfsdfsd")
        if (!err && response.statusCode == 200) { //成功
            var accessToken = JSON.parse(body).access_token;
            wxConf.access_token = accessToken;
            console.log("access_token  success!!!");
            getJsapiTicket(wxConf, accessToken);
        } else {
            console.error(err);
        }
    });
    var timer = null;
    if (timer === null) {
        setTimeout(function() {
            clearTimeout(timer);
            timer = null;
            getAccessToken();
        }, 7000000)
    }
};

/**
 * 根据access_token获取签名所需要的jsapi_ticket
 * @param  {[type]} access_token [description]
 * @return {[type]}              [description]
 */
exports.getJsapiTicket = function(wxConf, accessToken) {
    console.log("获取jsapi_ticket");
    var getTicketUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + accessToken + "&type=jsapi";
    request.get(getTicketUrl, function(err, response, body) {
        wxConf.jsapi_ticket = JSON.parse(body).ticket;
        writeWXConfig(wxConf);
    });
};

/**
 * 第二步：通过code换取网页授权access_token(user_access_token)
 * @param  {[type]}   code     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUserAccessToken = function(code, callback) {
    console.log("获取用户信息的access_token");
    var wxConf = JSON.parse(readWXConfig());
    var APPID = wxConf.appid;
    var APPSECRET = wxConf.secret;
    var accessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + APPID + "&secret=" + APPSECRET + "&code=" + code + "&grant_type=authorization_code";
    request.post(accessTokenUrl, function(err, response, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

/**
 * 刷新获取用户访问的access_token（ user_access_token）
 * @return {[type]} [description]
 */
exports.referUserAccessToken = function(refreshToken, callback) {
    var wxConf = JSON.parse(readWXConfig());
    var APPID = wxConf.appid;
    var refreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + APPID + "&grant_type=refresh_token&refresh_token=" + refreshToken;
    request.get(refreshTokenUrl, function(err, respones, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};


/**
 * 检验获取用户信息的access_token是否过期
 * @return {[type]} [description]
 */
exports.checkUserAccessToken = function(accessToken, openId, callback) {
    var checkTokenUrl = "https://api.weixin.qq.com/sns/auth?access_token=" + accessToken + "&openid=" + openId;
    request.get(checkTokenUrl, function(err, response, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};


/**
 * 获取用户的信息
 * @param  {[type]}   userAccessToken [用户授权的access_token]
 * @param  {[type]}   openId          [description]
 * @param  {Function} callback        [description]
 * @return {[type]}                   [description]
 */
exports.getUserInfo = function(userAccessToken, openId, callback) {
    var getUserInfoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" + userAccessToken + "&openid=" + openId + "&lang=zh_CN";
    request.get(getUserInfoUrl, function(err, response, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    })
};


/**
 * 通过用户的openId获取用户的基本信息
 * @param  {[type]} openId [description]
 * @return {[type]}        [description]
 */
exports.getUserInfoByOpenId = function(openId, callback) {
    //http请求方式: GET https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN 
    var getUserInfoUrl = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + JSON.parse(readWXConfig()).access_token + "&openid=" + openId + "&lang=zh_CN";
    request.get(getUserInfoUrl, function(err, response, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    })
}



/**
 * 获取兑换二维码的Ticket,返回的结果中有二维码扫描后的链接，如果使用自己的程序生成二维码那么通过这个链接地址生成二维码即可。
 * @param  {[type]}   accessToken [description]
 * @param  {[type]}   sceneId     [description]
 * @param  {Function} cb          [description]
 * @return {[type]}               [description]
 */
exports.createQrcodeTicket = function(sceneStr, cb) {
    var requestData = { action_name: "QR_LIMIT_STR_SCENE", action_info: { scene: { "scene_str": sceneStr } } };
    var getQrcodeTicket = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + JSON.parse(readWXConfig()).access_token;
    request({
        url: getQrcodeTicket,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: requestData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        } else {
            cb(error, null);
        }
    });
}

/**
 * 创建本地二维码
 * @return {[type]} [description]
 */
exports.createQrCodeByLocal = function(params, cb) {
    var getQrcodeTicket = "http://localhost:8000/api/qrcode";
    request({
        url: getQrcodeTicket,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        } else {
            cb(error, null);
        }
    });
}


/**
 * 上传媒体素材到微信服务器
 * @param  {[type]}   data [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
exports.uploadMediaToWeixinServer = function(formData, cb) {
    var uploadUrl = "https://api.weixin.qq.com/cgi-bin/media/upload?access_token=" + JSON.parse(readWXConfig()).access_token + "&type=image";
    request.post({ url: uploadUrl, formData: formData }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("临时媒体素材上传成功！");
            cb(null, JSON.parse(body));
        } else {
            cb(error, null);
        }
    })
}



/**
 * 用户关注公众帐号的时候被动回复文本消息给用户
 * @param  {[type]}   data [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
exports.postMessageToUser = function(ToUserName, FromUserName, cb) {
    var builder = new xml2js.Builder()
    var xml = {
        xml: {
            ToUserName: ToUserName,
            FromUserName: FromUserName,
            CreateTime: new Date(),
            MsgType: "text",
            Content: "欢迎你关注“上氧微信公众帐号”"
        }
    };
    cb(null, builder.buildObject(xml));
}

/**
 * 被动回复给用户推送图文消息
 * @param  {[type]}   ToUserName   [description]
 * @param  {[type]}   FromUserName [description]
 * @param  {[type]}   mediaId      [description]
 * @param  {Function} cb           [description]
 * @return {[type]}                [description]
 */
exports.postPictureMessageToUser = function(ToUserName, FromUserName, mediaId, cb) {
    var builder = new xml2js.Builder()
    var xml = {
        xml: {
            ToUserName: ToUserName,
            FromUserName: FromUserName,
            CreateTime: new Date(),
            MsgType: "image",
            Image: {
                MediaId: mediaId
            }
        }
    };
    cb(null, builder.buildObject(xml));
};



/**
 * 发送客服图片消息（主动消息）
 * @param  {[type]}   openId [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
exports.posImagesMessage = function(openId, content, cb) {
    var url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=" + JSON.parse(readWXConfig()).access_token;
    var message = {
        "touser": openId,
        "msgtype": "image",
        "image": {
            "media_id": content
        }
    };
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: message
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}



/**
 * 发送客服文本消息（主动消息）
 * @param  {[type]}   openId [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
exports.posTxtMessage = function(openId, content, cb) {
    var url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=" + JSON.parse(readWXConfig()).access_token;
    var message = {
        "touser": openId,
        "msgtype": "text",
        "text": {
            "content": content
        }
    };
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: message
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}


/**
 * 设置模板消息行业编码
 * @param {[type]} industry_id1 [description]
 * @param {[type]} industry_id1 [description]
 * @param {[type]} data         [description]
 */
exports.setTemplateInfo = function(industry_id1, industry_id2, cb) {
    var wxConf = JSON.parse(readWXConfig());
    var url = "https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token=" + wxConf.access_token;
    var data = {
        industry_id1: industry_id1,
        industry_id2: industry_id2
    };
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}



/**
 * 获取模板消息的模板id
 * @return {[type]} [description]
 */
exports.getTemplateMessageId = function(cb) {
    var wxConf = JSON.parse(readWXConfig());
    var url = "https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=" + wxConf.access_token;
    var data = {
        template_id_short: "TM00376"
    };
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}


/**
 * 创建公众账号菜单的方法
 * @param  {[type]}   menuItem [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
exports.createWeixinMenu = function(menuItem, cb) {
    var createMenuUrl = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + JSON.parse(readWXConfig()).access_token;
    request({
        url: createMenuUrl,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: menuItem
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}

/**
 * 向用户发送模板消息
 * @param  {[type]}   data       [description]
 * @param  {[type]}   openId     [description]
 * @param  {[type]}   templateId [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
exports.postTemplateMessage = function(data, openId, templateId, cb) {
    var postTemplateMessageUrl = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + JSON.parse(readWXConfig()).access_token;
    //模板消息需要的数据
    var response = {
        touser: openId,
        template_id: templateId,
        url:"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3a185241bcdc7ec&redirect_uri=http%3a%2f%2fweixin.shangyang123.com%2fwx-cb-url&response_type=code&scope=snsapi_userinfo&state=home#wechat_redirect",
        data: data
    };
    request({
        url: postTemplateMessageUrl,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: response
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        }
    });
}


/**
 * 测试下单接口签名获取
 * @return {[type]} [description]
 */
exports.getTestUnifiedOrderApiSignkey = function(mchId, cb) {
    var builder = new xml2js.Builder({ cdata: true });
    var url = " https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey";
    var requestData = {
        mch_id: mchId,
        nonce_str: createNonceStr()
    };
    var sign_str = signature(requestData);
    requestData.sign = md5(sign_str).toUpperCase();
    console.log("向微信发送的数据=========================================>");
    var requestBody = builder.buildObject({ xml: requestData }); //请求
    console.log(requestBody);
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "text/html;"
        },
        body: requestBody.toString()
    }, function(error, response, body) {
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
