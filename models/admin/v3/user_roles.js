const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const user_roles = function () {}


user_roles.prototype.get_user_roles_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT *  FROM user_roles`, function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "user_roles": result
                })
            }
        });
    })
}

user_roles.prototype.user_roles_update_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT *  FROM user_roles`, function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "user_roles": result
                })
            }
        });
    })
}


module.exports = new user_roles()