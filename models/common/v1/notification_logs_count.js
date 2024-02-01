const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const notification_logs_count = function () {}

notification_logs_count.prototype.notification_logs_count_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT count(id) as count FROM notification_user_logs  where read_notification = 1 and receiver_id = ${req.body.user_id}`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(uresult);
                    res.status(200).json({
                        "success": true,
                        "notification_logs_count": uresult
                    })
            }
        });
    })
}

module.exports = new notification_logs_count()