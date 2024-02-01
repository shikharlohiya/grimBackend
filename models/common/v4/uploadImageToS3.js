const AWS = require('aws-sdk');
var fs = require('fs');

const uploadImageToS3 = function () {}


uploadImageToS3.prototype.uploadImageToS3_func = function (req, res, callback) {
  var da = new Date();
  var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
  var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);


  if (typeof req.files.uImage !== 'undefined' && req.files.uImage !== null && req.files.uImage !== '') {

    AWS.config.update({
      accessKeyId: 'AKIAJGE3KLWVHSNFJQLA',
      secretAccessKey: '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',
      region: 'ap-south-1'
    });
    var file = req.files.uImage;
    var s3bucket = new AWS.S3();


    fs.readFile(file.path, function (err, data) {

      var params = {
        Bucket: "grimimages",
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
}

module.exports = new uploadImageToS3()