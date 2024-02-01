const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const user_details = function () {}


user_details.prototype.user_details_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

        if (req.body.role_id == 3) {
            var orderQuery = `SELECT a.*,(SELECT department_name FROM departments WHERE id = a.department ) as department_name, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, (SELECT first_name  from user_details where id = a.manager_id) as reporting_to  from user_details as a where a.id = ${req.body.user_id}`
        } else {
            var orderQuery = `SELECT *,(SELECT department_name FROM departments WHERE id = department ) as department_name, (SELECT role FROM user_roles WHERE id = role_id ) as role from user_details where id = ${req.body.user_id}`
        }

        con.query(orderQuery, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                res.status(200).json({
                    "success": true,
                    "user": result
                })
            } else {
                res.status(200).json({
                    "success": true,
                    "user": []
                })
            }
        });
    })
}

module.exports = new user_details()