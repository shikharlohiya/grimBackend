const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const md_approval = function () {}


md_approval.prototype.md_approval_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE user_orders set md_approval = '0' WHERE id = ${req.body.order.id}`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                con.release();
                res.status(200).json({
                    "success": true,
                    "message": "Approved Successfully"
                })
            }
        });
    });
}

module.exports = new md_approval()