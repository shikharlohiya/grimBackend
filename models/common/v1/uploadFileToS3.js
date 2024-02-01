const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const AWS = require('aws-sdk');
var fs = require('fs');

const uploadFileToS3 = function () {}


uploadFileToS3.prototype.uploadFileToS3_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.files, '---------file------');
        console.log(req.body, '---------user------');

        var da = new Date();
        var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
        var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);


        if (typeof req.files.pdfFile !== 'undefined' && req.files.pdfFile !== null && req.files.pdfFile !== '') {

            AWS.config.update({
                accessKeyId: 'AKIAJGE3KLWVHSNFJQLA',
                secretAccessKey: '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',
                region: 'ap-south-1'
            });
            var file = req.files.pdfFile;
            var s3bucket = new AWS.S3();


            fs.readFile(file.path, function (err, data) {

                var params = {
                    Bucket: "grimfiles",
                    Key: req.body.user_id + '/' + file.name + '/' + dateTime,
                    Body: data
                };

                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        return res.status(400).json(err);
                        console.log('ERROR MSG: ', err);
                    } else {
                        console.log(data.Location);
                        res.status(200).json(data);
                    }
                });

            });
        } else {
            return res.status(400).json('No files were uploaded.');
        }
    })
}

module.exports = new uploadFileToS3()