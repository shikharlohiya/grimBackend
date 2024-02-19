const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
require('dotenv/config')

const code_creation = function () {}


code_creation.prototype.code_creation_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {

                if (req.body.role_id == 3) {
                    var actionsQuery = `SELECT * FROM service_actions WHERE service_id = 4`;
                } else {
                    var actionsQuery = `SELECT child.* FROM service_actions as child, (SELECT id FROM service_actions WHERE role_id = ${req.body.role_id} and service_id = 4) as parent 
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
                        console.log(oa_result);
                        oa_result.forEach(function (element, indx) {
                            var approverQuery;
                            switch (element.role_id) {
                                case 2:
                                    approverQuery = `Select id, email FROM user_details where id = (Select manager_id from user_details where id = ${req.body.user_id}) LIMIT 1`;
                                    break;
                                case 7:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 7 and department = (SELECT department FROM user_details where id = ${req.body.user_id})) LIMIT 1`;
                                    break;
                                case 9:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 9 and department = (SELECT department FROM user_details where id = ${req.body.user_id})) LIMIT 1`;
                                    break;
                                case 8:
                                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 8) LIMIT 1`;
                            }

                            console.log(approverQuery);

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
                                    console.log(aq_result);
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
                            if (req.body.role_id == 3) {
                                var status = 1
                            } else {
                                var status = 2
                            }

                            var last_index = oa_result.slice(-1);

                            console.log(last_index, 'last_index');

                            if (last_index[0].last_approval == '1' && last_index[0].finish == '1') {
                                var approval_finish = '1'
                            } else {
                                var approval_finish = '0'

                            }

                            con.query(`INSERT INTO new_product_request (user_id, product_name, product_description, product_group_id, status, createdby, location, base_unit, batch_management, moving_price, approval_finish) VALUES (${req.body.user_id}, '${req.body.product_name}', '${req.body.product_description}', '${req.body.product_group_id}' ,${status}, ${req.body.user_id}, ${req.body.location}, '${req.body.base_unit}', '${req.body.batch_management}', '${req.body.moving_price}', '${approval_finish}');`,
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
                                                    if (req.body.role_id == 3) {
                                                        var status_logs_query = `INSERT INTO code_status_logs ( code_id, status, created_by) VALUES (${inp_result.insertId},1, ${req.body.user_id})`
                                                    } else {
                                                        var status_logs_query = `INSERT INTO code_status_logs ( code_id, status, created_by) VALUES (${inp_result.insertId},1, ${req.body.user_id}); INSERT INTO code_status_logs ( code_id, status, created_by) VALUES (${inp_result.insertId},2, ${req.body.user_id}); `
                                                    }

                                                    con.query(status_logs_query, function (serr, sresult, fields) {
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

module.exports = new code_creation()