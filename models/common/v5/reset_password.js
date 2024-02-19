const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const reset_password = function () {}


reset_password.prototype.reset_password_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);
                var query = `UPDATE user_details set is_password_changed = 'YES', password = '${req.body.new_password}', updated_at = now() WHERE id = ${req.body.user_id}`
                con.query(query, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        con.rollback(function () {

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        });
                    } else {
                        con.query(`INSERT INTO password_history ( old_password, new_password, created_by, created_at) VALUES ('${req.body.old_password}', '${req.body.new_password}',${req.body.user_id} , now())`, function (os_err, i_result) {
                            if (os_err) {
                                console.log(os_err);
                                con.rollback(function () {

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": os_err
                                    })
                                });
                            } else {
                                con.commit(function (err) {
                                    if (err) {
                                        con.rollback(function () {
                                            throw err;
                                        });
                                    }

                                    res.status(200).json({
                                        "success": true,
                                        "message": "Updated Successfully"
                                    })
                                });
                            }
                        });
                    }
                })
            }
        })
    })
}

module.exports = new reset_password()