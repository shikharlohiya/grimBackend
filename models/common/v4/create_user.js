const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
require('dotenv/config')
const axios = require('axios');


const create_user = function () {}

create_user.prototype.create_user_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log(req.body);

                var user = req.body.user;
                user.doj = req.body.user.doj || null;
                user.manager_id = req.body.user.manager_id || null;
                user.manager2 = req.body.user.manager2 || null;
                user.hod = req.body.user.hod || null;
                user.last_name = req.body.user.last_name || null;
                user.location_id = req.body.user.location_id || null;
                user.store_locations = req.body.user.store_locations || [0];
                user.delivery_locations = req.body.user.delivery_locations || [0];
                user.sto_stores = req.body.user.sto_stores || [0];

                

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
                                "message": "Error with endpoint",
                                "err": c_err
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
                            con.query(`INSERT INTO user_details (sap_user_id, first_name, last_name, role_id, manager_id, email, password, mobile_no, status, location_id, doj, department, designation,store_locations, sto_stores, created_by, created_at, store_previlages, manager2, hod) VALUES ('${user.sap_id}', '${user.first_name}', '${user.last_name}',${user.role_id}, ${user.manager_id}, '${user.email}', '${user.password}','${user.mobile_no}', ${user.status}, ${user.location_id}, '${user.doj}', '${user.department}', '${user.designation}', JSON_ARRAY(${user.store_locations}), JSON_ARRAY(${user.sto_stores}),  1 , '${date}', JSON_ARRAY(${user.store_roles}), ${user.manager2}, ${user.hod})`, function (cu_err, cu_result) {
                                if (cu_err) {
                                    console.log(cu_err);
                                    con.rollback(function () {

                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": cu_err
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

                                            var substitutions = {
                                                "from": "IBGroup <grim@ibgroup.co.in>",
                                                "to": user.email,
                                                "subject": `Welcome to GRIM`,
                                                "template": "loginCredentialsTemp",
                                                "view": {
                                                    'first_name': user.first_name,
                                                    'email': user.email,
                                                    'password': user.password,
                                                    'link': process.env.link
                                                }

                                            }

                                            axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                                .then(function (response) {
                                                    //   console.log(response);
                                                }).catch(function (error) {
                                                    // handle error
                                                    console.log(error);
                                                })

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
                                                            "message": "Error with endpoint",
                                                            "err": l_err
                                                        })
                                                    });
                                                } else {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                throw err;
                                                            });
                                                        }

                                                        var substitutions = {
                                                            "from": "IBGroup <grim@ibgroup.co.in>",
                                                            "to": user.email,
                                                            "subject": `Welcome to GRIM`,
                                                            "template": "loginCredentialsTemp",
                                                            "view": {
                                                                'first_name': user.first_name,
                                                                'email': user.email,
                                                                'password': user.password,
                                                                'link': process.env.link
                                                            }

                                                        }

                                                        axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                                            .then(function (response) {
                                                                //   console.log(response);
                                                            }).catch(function (error) {
                                                                // handle error
                                                                console.log(error);
                                                            })
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