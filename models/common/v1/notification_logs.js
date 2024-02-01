const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const notification_logs = function () {}

notification_logs.prototype.notification_logs_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT a.*, (SELECT name FROM material_items WHERE material_sap_id =a.product_id) as name FROM notification_user_logs as a  where a.read_notification = 1 and a.receiver_id = ${req.body.user_id}  ORDER BY a.created_at DESC limit 50`, function (uerr, uresult, fields) {
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
                        "notification_logs": uresult
                    })
            }
        });
    })
}

module.exports = new notification_logs()