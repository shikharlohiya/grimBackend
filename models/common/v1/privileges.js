const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const privileges = function () {}


privileges.prototype.privileges_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.query);
        var role_id = req.query.role_id;
        con.query("SELECT * FROM role_privileges where json_contains(`roles`,'" + role_id  + "')", function (err, result, fields) {
            if (err) {
                console.log(err);
                
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "privileges": result
                })
            }
        });
    })
}

module.exports = new privileges()