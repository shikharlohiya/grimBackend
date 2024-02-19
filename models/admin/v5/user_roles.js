const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const user_roles = function () {}


user_roles.prototype.get_user_roles_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT *  FROM user_roles`, function (err, result, fields) {
        if (err) {
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "user_roles": result
            })
        }
    });
}

user_roles.prototype.user_roles_update_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT *  FROM user_roles`, function (err, result, fields) {
        if (err) {
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "user_roles": result
            })
        }
    });
}


module.exports = new user_roles()