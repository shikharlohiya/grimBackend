const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database // connects to Database


var test = function () {};

var da = new Date();
var unix_time = da.getTime();
var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
var day = ("0" + (da.getDate())).slice(-2);
var month = ("0" + (da.getMonth() + 1)).slice(-2);
var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);

test.prototype.test_func = function (req, res, callback) {
    console.log(req.query);
    mysqlPool.getConnection(function (err, connection) {
        var insert_query = `INSERT INTO user_details (first_name, last_name, company) VALUES ('${req.query.first_name}','${req.query.last_name}', '${req.query.company}')`
        connection.query(insert_query, function (ierr, iresult) {
            if (ierr) {
                console.log(ierr);
                
                res.json({
                    "success": false,
                    "message": ierr
                });
            } else {
                res.json({
                    "success": true,
                    "message": "Inserted successfully"
                });
                console.log(iresult);

            }
        });
    });
}
module.exports = new test();