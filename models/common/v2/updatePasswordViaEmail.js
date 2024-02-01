const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const updatePasswordViaEmail = function () {}


updatePasswordViaEmail.prototype.updatePasswordViaEmail_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);

                var da = new Date();
                var date =
                    da.getFullYear() +
                    "-" +
                    ("0" + (da.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + da.getDate()).slice(-2) +
                    " " +
                    ("0" + da.getHours()).slice(-2) +
                    ":" +
                    ("0" + da.getMinutes()).slice(-2) +
                    ":" +
                    ("0" + da.getSeconds()).slice(-2);
                    var nullData = null;
                    var selectQuery = `SELECT id, email, first_name, password FROM user_details where resetPasswordToken = '${req.body.token}' AND resetPasswordExpires > STR_TO_DATE('${date}', '%Y-%m-%d %H:%i:%s')`;
                    console.log(selectQuery);
                    
                con.query(selectQuery, function (c_err, c_result) {
                    if (c_err) {
                        console.log(c_err);
                        con.rollback(function () {
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        });
                    } else if (c_result.length == 0) {
                        con.release();
                        res.status(200).json({
                            "success": false,
                            "message": "Password reset link is invalid or has expired"
                        })
                    } else {
                        if (req.body.type == 'check') {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "message": "OK"
                            })
                        } else {
                            var query = `UPDATE user_details set is_password_changed = 'YES', password = '${req.body.new_password}', resetPasswordToken = ${nullData}, resetPasswordExpires=${nullData}, updated_at = now() WHERE id = ${c_result[0].id}`
                            con.query(query, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else {
                                    con.query(`INSERT INTO password_history ( old_password, new_password, created_by, created_at) VALUES ('${c_result[0].password}', '${req.body.new_password}',${c_result[0].id} , now())`, function (os_err, i_result) {
                                        if (os_err) {
                                            console.log(os_err);
                                            con.rollback(function () {
                                                con.release();
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint"
                                                })
                                            });
                                        } else {
                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        throw err;
                                                    });
                                                }
                                                con.release();
                                                res.status(200).json({
                                                    "success": true,
                                                    "message": "Password Updated Successfully Please Login"
                                                })
                                            });
                                        }
                                    });
                                }
                            })
                        }
                    }
                })
            }
        })
    })
}

module.exports = new updatePasswordViaEmail()