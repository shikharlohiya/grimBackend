const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const SENDGRID_API_KEY = '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';
const mailer = require('sendgrid-mailer').config(SENDGRID_API_KEY);
require('dotenv/config')

const create_user = function () {}

create_user.prototype.create_user_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);

                var user = req.body.user;
                user.doj = req.body.user.doj || null;
                user.manager_id = req.body.user.manager_id || null;
                user.last_name = req.body.user.last_name || null;
                user.location_id = req.body.user.location_id || null;
                user.store_locations = req.body.user.store_locations || [0];
                user.delivery_locations = req.body.user.delivery_locations || [0];


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
                con.query(`SELECT id, email FROM user_details where email = "${req.body.user.email}"`, function (c_err, c_result) {
                    if (c_err) {
                        console.log(c_err);
                        con.rollback(function () {
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        });
                    } else {
                        if (c_result.length > 0) {
                            con.rollback(function () {
                                res.status(200).json({
                                    "success": false,
                                    "message": "This Email Already Exists...!"
                                })
                            });
                        } else {
                            con.query(`INSERT INTO user_details (sap_user_id, first_name, last_name, role_id, manager_id, email, password, mobile_no, status, location_id, doj, department, designation,store_locations, created_by, created_at) VALUES ('${user.sap_id}', '${user.first_name}', '${user.last_name}',${user.role_id}, ${user.manager_id}, '${user.email}', '${user.password}','${user.mobile_no}', ${user.status}, ${user.location_id}, '${user.doj}', '${user.department}', '${user.designation}', JSON_ARRAY(${user.store_locations}),  1 , '${date}')`, function (cu_err, cu_result) {
                                if (cu_err) {
                                    console.log(cu_err);
                                    con.rollback(function () {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else {
                                    if (user.delivery_locations.length == 0) {
                                        con.commit(function (err) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                            const email1 = {
                                                to: user.email,
                                                from: 'IBGroup <grim@ibgroup.in>',
                                                subject: 'Welcome to GRIM',
                                                templateId: '84882598-27a3-4331-8c97-205699bd7e18',
                                                substitutions: {
                                                    '%|first_name|%': user.first_name,
                                                    '%|email|%': user.email,
                                                    '%|password|%': user.password,
                                                    '%|link|%': process.env.link

                                                }
                                            };

                                            const email = [email1];
                                            mailer.send(email1).then(() => {
                                                console.log(email);
                                            }).catch((error) => {
                                                console.log('error', error, email);
                                                console.log(error.response.body.errors)
                                            });
                                            res.status(200).json({
                                                "success": true,
                                                "message": "User Created Successfully"
                                            })
                                        });
                                    } else {
                                        con.query('INSERT INTO user_locations (user_id, location_id, created_by, created_at) VALUES ?',
                                            [user.delivery_locations.map(location => [cu_result.insertId, location, 1, date])],
                                            function (l_err, l_result) {
                                                if (l_err) {
                                                    console.log(l_err);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint"
                                                        })
                                                    });
                                                } else {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            connection.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        const email1 = {
                                                            to: user.email,
                                                            from: 'IBGroup <grim@ibgroup.co.in>',
                                                            subject: 'Welcome to GRIM',
                                                            templateId: '84882598-27a3-4331-8c97-205699bd7e18',
                                                            substitutions: {
                                                                '%|first_name|%': user.first_name,
                                                                '%|email|%': user.email,
                                                                '%|password|%': user.password,
                                                                '%|link|%': process.env.link

                                                            }
                                                        };

                                                        const email = [email1];
                                                        mailer.send(email1).then(() => {
                                                            console.log(email);
                                                        }).catch((error) => {
                                                            console.log('error', error, email);
                                                            console.log(error.response.body.errors)
                                                        });
                                                        res.status(200).json({
                                                            "success": true,
                                                            "message": "User Created Successfully"
                                                        })
                                                    });
                                                }
                                            });
                                    }

                                }
                            });
                        }

                    }

                });

            }
        })
    })
}

module.exports = new create_user()