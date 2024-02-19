const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const service_details = function () {}

service_details.prototype.service_details_func = function (req, res, callback) {
    // console.log(req.body);
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`SELECT a.id FROM service_details as a where a.service_id = ${req.body.service_id}`, function (uerr, uresult, fields) {
                    if (uerr) {
                        console.log(uerr);
                        res.status(500).json({
                            "success": false,
                            "message": "Something Went Wrong...!",
                            "err": uerr
                        })
                    } else if (uresult.length > 0) {
                        // console.log(uresult);
                        res.status(500).json({
                            "success": false,
                            "message": "Service Already Exists...!"
                        })
                    } else {

                        con.query(`INSERT INTO service_details ( service_id, name, description, status) VALUES (${req.body.service_id}, '${req.body.name}','${req.body.description}', '${req.body.status}')`, function (iserr, isresult, fields) {
                            if (iserr) {
                                console.log(iserr);
                                res.status(500).json({
                                    "success": false,
                                    "message": "Something Went Wrong...!",
                                    "err": iserr
                                })
                            } else {

                                req.body.actions.forEach(function (element, indx) {
                                    if (indx == req.body.actions.length - 1) {
                                        element.finish = '1';
                                    } else {
                                        element.finish = '0';
                                    }

                                });
                                con.query('INSERT INTO service_actions (service_id, role_id, amount, TAT, finish, urgent_flag) VALUES ?',
                                    [req.body.actions.map(action => [req.body.service_id, action.role_id, action.amount, action.TAT, action.finish, action.urgent_flag])],
                                    function (isaerr, isaresult, fields) {
                                        if (isaerr) {
                                            console.log(isaerr);
                                            con.rollback(function () {
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Something Went Wrong...!",
                                                    "err": isaerr
                                                })
                                            });
                                        } else {
                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        throw err;
                                                    });
                                                } else {
                                                    res.status(200).json({
                                                        "success": true,
                                                        "message": "Service Created Successfully"
                                                    })
                                                }
                                            })

                                        }
                                    });

                            }
                        });

                    }
                });
            }
        })
    })
}


service_details.prototype.service_details_get_func = function (req, res, callback) {
    if (req.query.service_id == undefined) {
        var filterQuery = "";
    } else {
        var filterQuery = `and a.service_id = ${req.query.service_id}`;

    }
    con.query(`SELECT a.*, (SELECT service_name FROM Services WHERE id = a.service_id) as service_name FROM service_details as a where a.status = '1' ${filterQuery}`, function (serr, sresult, fields) {
        if (serr) {
            console.log(serr);
            res.status(500).json({
                "success": false,
                "message": "Something Went Wrong...!",
                "err": serr
            })
        } else if (sresult.length == 0) {
            res.status(200).json({
                "success": true,
                "message": "No Records Found",
                "services": []
            })
        } else {
            sresult.forEach(function (service, index) {
                con.query(`SELECT a.*, (SELECT role FROM user_roles WHERE id = a.role_id) as role FROM service_actions as a where a.service_id = ${service.service_id}`, function (saerr, saresult, fields) {
                    if (saerr) {
                        console.log(saerr);
                        res.status(500).json({
                            "success": false,
                            "message": "Something Went Wrong...!",
                            "err": saerr
                        })
                    } else {
                        sresult[index].actions = saresult;
                        if (index == sresult.length - 1) {

                            setTimeout(function () {
                                res.status(200).json({
                                    "success": true,
                                    "message": "Services Retraived Successfully",
                                    "services": sresult
                                })
                            }, 10);

                        }
                    }
                });
            });
        }
    });
}

service_details.prototype.service_details_put_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`SELECT a.*, (SELECT service_name FROM Services WHERE id = a.service_id) as service_name FROM service_details as a where a.service_id = ${req.body.service_id}`, function (serr, sresult, fields) {
                    if (serr) {
                        console.log(serr);
                        res.status(500).json({
                            "success": false,
                            "message": "Something Went Wrong...!",
                            "err": serr
                        })
                    } else if (sresult.length == 0) {
                        res.status(500).json({
                            "success": false,
                            "message": "No Records Found To Update"
                        })
                    } else {
                        con.query(`UPDATE service_details set status = '${req.body.status}' , name = '${req.body.name}', description = '${req.body.description}' where service_id = ${req.body.service_id}`, function (userr, usresult, fields) {
                            if (userr) {
                                console.log(userr);
                                con.rollback(function () {
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Something Went Wrong...!",
                                        "err": userr
                                    })
                                })
                            } else {
                                req.body.actions.forEach(function (element, indx) {
                                    if (indx == req.body.actions.length - 1) {
                                        element.finish = '1';
                                    } else {
                                        element.finish = '0';
                                    }
                                });

                                con.query(`DELETE FROM service_actions WHERE service_id = ${req.body.service_id}`, function (derr, dresult, fields) {
                                    if (derr) {
                                        console.log(derr);
                                        con.rollback(function () {
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Something Went Wrong...!",
                                                "err": derr
                                            })
                                        })
                                    } else {

                                        con.query('INSERT INTO service_actions (service_id, role_id, amount, TAT, finish, urgent_flag) VALUES ?',
                                            [req.body.actions.map(action => [req.body.service_id, action.role_id, action.amount, action.TAT, action.finish, action.urgent_flag])],
                                            function (isaerr, isaresult, fields) {
                                                if (isaerr) {
                                                    console.log(isaerr);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Something Went Wrong...!",
                                                            "err": isaerr
                                                        })
                                                    });
                                                } else {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                throw err;
                                                            });
                                                        } else {
                                                            res.status(200).json({
                                                                "success": true,
                                                                "message": "Service Updated Successfully"
                                                            })
                                                        }
                                                    })

                                                }
                                            });

                                    }
                                })

                            }
                        });
                    }
                });
            }
        })
    })
}
module.exports = new service_details()