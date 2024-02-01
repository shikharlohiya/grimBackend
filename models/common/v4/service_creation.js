const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
require('dotenv/config')

const service_creation = function () {}


service_creation.prototype.service_creation_func = function (req, res, callback) {
    var service_details = req.body.service;
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {

                if (req.body.role_id == 3) {
                    var actionsQuery = `SELECT * FROM service_actions WHERE service_id = 3`;
                } else {
                    var actionsQuery = `SELECT child.* FROM service_actions as child, (SELECT id FROM service_actions WHERE role_id = ${req.body.role_id} and service_id = 3) as parent 
            WHERE child.id >= parent.id `;
                }
                con.query(actionsQuery, function (oa_err, oa_result) {
                    if (oa_err) {
                        console.log(oa_err);
                        con.rollback(function () {
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": oa_err
                            })
                        });
                    } else {
                        // console.log(oa_result);
                        oa_result.forEach(function (element, indx) {
                            var approverQuery;
                            switch (element.role_id) {
                                case 2:
                                    if (req.body.role_id == 3) {

                                        approverQuery = `Select id, email FROM user_details where id = (Select manager_id from user_details where id = ${req.body.user_id}) LIMIT 1`;
                                    } else {

                                        approverQuery = `Select id, email FROM user_details where id = ${req.body.user_id} LIMIT 1`;
                                    }
                                    break;
                                case 7:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 7 and department = (SELECT department FROM user_details where id = ${req.body.user_id}) LIMIT 1) LIMIT 1`;
                                    break;
                                case 9:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 9 and department = (SELECT department FROM user_details where id = ${req.body.user_id}) LIMIT 1) LIMIT 1`;
                                    break;
                                case 8:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 8) LIMIT 1`;
                            }

                            con.query(approverQuery, function (aq_err, aq_result) {
                                if (aq_err) {
                                    console.log(aq_err);
                                    con.rollback(function () {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": aq_err
                                        })
                                    });
                                } else {
                                    // console.log(aq_result);
                                    if (aq_result.length == 0) {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Approver Not Available"
                                        })
                                        return;
                                    } else {
                                        oa_result[indx].approver_id = aq_result[0].id;
                                        oa_result[indx].approver_email = aq_result[0].email;

                                    }

                                }
                            })
                            if (indx == oa_result.length - 1) {
                                element.last_approval = '1';
                                element.finish = '0';
                            } else {
                                element.last_approval = '0';
                                element.finish = '0';
                            }

                            if (req.body.role_id != 3) {
                                if (indx == 0) {
                                    element.finish = '1';
                                }
                            }
                        });

                        setTimeout(function () {

                            if (service_details.service_group == undefined) {
                                service_details.service_group = "";
                            }if (service_details.service_no == undefined) {
                                service_details.service_no = "";
                            }if (service_details.UOM == undefined) {
                                service_details.UOM = "";
                            }if (service_details.gross_price == undefined) {
                                service_details.gross_price = "";
                            }if (service_details.GLAccount == undefined) {
                                service_details.GLAccount = "";
                            }if (service_details.cost_center == undefined) {
                                service_details.cost_center = "";
                            }if (service_details.purchase_group == undefined) {
                                service_details.purchase_group = "";
                            }if (service_details.acc_assg_cat == 'K - cost center (Without WBS)') {
                                service_details.WBS_NO = "";
                            }

                            con.query(`INSERT INTO new_service_request (user_id, pr_type, acc_assg_cat, item_category,  quantity, plant_id, WBS_NO, service_group, service_no, UOM, gross_price, GLAccount, cost_center, purchase_group, purchase_organization, short_text, reason, image_url, created_by, status) VALUES (${req.body.user_id}, '${service_details.pr_type}', '${service_details.acc_assg_cat}', '${service_details.item_category}',${service_details.quantity}, '${service_details.plant_id}','${service_details.WBS_NO}','${service_details.service_group}','${service_details.service_no}','${service_details.UOM}','${service_details.gross_price}', '${service_details.GLAccount}','${service_details.cost_center}', '${service_details.purchase_group}', '${service_details.purchase_organization}', '${service_details.short_text}', '${service_details.reason}', '${service_details.image_url}', ${req.body.user_id},${req.body.status});`,
                                function (inp_err, inp_result) {
                                    if (inp_err) {
                                        console.log(inp_err);
                                        con.rollback(function () {
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": inp_err
                                            })
                                        });
                                    } else {
                                        con.query('INSERT INTO Indent_approvals (service_id, role_id, indent_id, TAT, created_by, finish, last_approval, approver_id, approver_email) VALUES ?',
                                            [oa_result.map(action => [action.service_id, action.role_id, inp_result.insertId, action.TAT, req.body.user_id, action.finish, action.last_approval, action.approver_id, action.approver_email])],
                                            function (ia_err, ia_result) {
                                                if (ia_err) {
                                                    console.log(ia_err);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint",
                                                            "err": ia_err
                                                        })
                                                    });
                                                } else {
                                                    con.query(`INSERT INTO service_status_logs ( service_request_id, status, created_by, role_id) VALUES (${inp_result.insertId},${req.body.status}, ${req.body.user_id}, ${req.body.role_id})`, function (serr, sresult, fields) {
                                                        if (serr) {
                                                            console.log(serr);
                                                            con.rollback(function () {
                                                                res.status(500).json({
                                                                    "success": false,
                                                                    "message": "Error with endpoint",
                                                                    "err": serr
                                                                })
                                                            })
                                                        } else {
                                                            con.commit(function (err) {
                                                                if (err) {
                                                                    con.rollback(function () {

                                                                        throw err;
                                                                    });
                                                                }
                                                                res.status(200).json({
                                                                    "success": true,
                                                                    "message": 'New Purchase Request Raised Succesfully'
                                                                })
                                                            })
                                                        }
                                                    })
                                                }
                                            });
                                    }
                                });
                        }, 15);
                    }
                })
            }
        })
    })
}


service_creation.prototype.service_creation_update_func = function (req, res, callback) {
    var service_details = req.body.service;
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`UPDATE new_service_request set  pr_type = '${service_details.pr_type}', acc_assg_cat = '${service_details.acc_assg_cat}', item_category = '${service_details.item_category}', quantity = ${service_details.quantity}, plant_id = '${service_details.plant_id}', service_group = '${service_details.service_group}', service_no = '${service_details.service_no}', UOM = '${service_details.UOM}', gross_price = '${service_details.gross_price}', GLAccount = '${service_details.GLAccount}', cost_center = '${service_details.cost_center}', purchase_group = '${service_details.purchase_group}', purchase_organization = '${service_details.purchase_organization}',short_text = '${service_details.short_text}',reason = '${service_details.reason}', updated_by = ${req.body.user_id} WHERE id = ${service_details.id}`,
                    function (inp_err, inp_result) {
                        if (inp_err) {
                            console.log(inp_err);
                            con.rollback(function () {
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "err": inp_err
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
                                    "message": 'Service Request Updated Succesfully'
                                })
                            })
                        }
                    });
            }
        })
    })
}
module.exports = new service_creation()