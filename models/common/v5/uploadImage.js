const AWS = require('aws-sdk');
var fs = require('fs');

const uploadImage = function () {}


uploadImage.prototype.uploadImage_func = function (req, res, callback) {
    var da = new Date();
    var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
    var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);

    console.log('storage location is ', req + '/' + req.file.path);
    var url = req.file.path.split("/").pop();
    res.status(200).json({
        "success": true,
        "message": "Updated Successfully",
        "url": `https://${req.hostname}:3002/uploads/${url}`
    })
}

module.exports = new uploadImage()