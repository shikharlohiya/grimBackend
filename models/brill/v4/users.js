const con = require("../../db1.js"),
    mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const axios = require('axios');
const users = function () { }

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

users.prototype.create_user_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log(req.body);

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
                con.query(`SELECT id, email FROM brill_user_details where email = "${req.body.email}"`, function (c_err, c_result) {
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

                            req.body.roles = req.body.roles.map(date => `'${date}'`)
                            req.body.plants = req.body.plants.map(date => `'${date}'`)

                            con.query(`INSERT INTO brill_user_details (sap_user_id, first_name, roles, email, password, status, created_by, plants_access) VALUES ('${req.body.sap_user_id}', '${req.body.first_name}', JSON_ARRAY(${req.body.roles}), '${req.body.email}', '${req.body.password}', ${req.body.status}, ${req.body.user_id}, JSON_ARRAY(${req.body.plants}))`, function (cu_err, cu_result) {
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
                                    con.commit(function (err) {
                                        if (err) {
                                            connection.rollback(function () {
                                                throw err;
                                            });
                                        }

                                        var substitutions = {
                                            "from": "IBGroup <grim@ibgroup.co.in>",
                                            "to": req.body.email,
                                            "subject": `Welcome to FAT`,
                                            "template": "loginCredentialsTemp",
                                            "view": {
                                                'first_name': req.body.first_name,
                                                'email': req.body.email,
                                                'password': req.body.password,
                                                'link': `${process.env.link}:8081`
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
        })
    })
}


users.prototype.users_get_func = function (req, res, callback) {
    // console.log(req.body.status.length);

    // console.log('query:', query);

    con.query(`SELECT * FROM brill_user_details`, function (err, result, fields) {
        if (err) {
            console.log(err);
            con.release();
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else if (result.length > 0) {
            result.forEach((item, index) => {
                result[index].roles = JSON.parse(item.roles);
                result[index].plants_access = JSON.parse(item.plants_access);

                if (index == result.length - 1) {
                    setTimeout(function () {
                        res.status(200).json({
                            "success": true,
                            "users": result
                        })
                    }, 10);
                }
            })
        } else {

            res.status(200).json({
                "success": true,
                "users": []
            })
        }
    });
}

users.prototype.users_delete_func = function (req, res, callback) {
    // console.log(req.body);

    mysqlPool.getConnection(function (err, con) {
        con.query(`UPDATE brill_user_details set status = '${req.body.status}' WHERE id = ${req.body.id}`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": err
                })
            } else {
                if (req.body.status == 1) {
                    var message = "User Enabled Successfully";
                } else {
                    var message = "User Disabled Successfully";

                }
                con.release();
                res.status(200).json({
                    "success": true,
                    "message": message
                })
            }
        });
    })
}

users.prototype.users_update_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log(req.body);

                if (req.body.first_name != undefined && req.body.roles != undefined) {
                    req.body.roles = req.body.roles.map(date => `'${date}'`)
                    req.body.plants_access = req.body.plants_access.map(date => `'${date}'`)
                    con.query(`UPDATE brill_user_details SET first_name = '${req.body.first_name}', sap_user_id = '${req.body.sap_user_id}', roles = JSON_ARRAY(${req.body.roles}), plants_access = JSON_ARRAY(${req.body.plants_access}) WHERE id = ${req.body.id}`, function (uerr, uresult) {
                        if (uerr) {
                            console.log(uerr);
                            con.rollback(function () {

                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "err": uerr
                                })
                            });
                        } else {
                            con.commit(function (err) {
                                if (err) {
                                    connection.rollback(function () {
                                        throw err;
                                    });
                                }

                                res.status(200).json({
                                    "success": true,
                                    "message": "User Details Updated Successfully"
                                })
                            });
                        }

                    });
                } else {

                    res.status(500).json({
                        "success": false,
                        "message": "Error while updating user details...!"
                    })
                }
            }
        })
    })
}

module.exports = new users()