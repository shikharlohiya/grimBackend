const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
var requestss = require('request');


const update_po_grn = function () {}


update_po_grn.prototype.update_po_grn_func = function (req, res, callback) {
    console.log('---------------', req.body.purchase_requests);

    if (req.body.purchase_requests.length == 0) {
        res.status(500).json({
            "success": false,
            "message": "Error with endpoint"
        })
    } else {

        mysqlPool.getConnection(function (err, con) {
            con.beginTransaction(function (err) {
                if (err) {
                    throw err;
                } else {
                    req.body.purchase_requests.forEach(function (purchase_request, index) {

                        if (purchase_request.purchase_request_id != '' && purchase_request.purchase_request_id != undefined) {

                            if (req.body.status == 'PO') {
                                var updateQuery = `UPDATE purchase_requests set  PO_number = '${purchase_request.document_id }', PO_created_at =  '${purchase_request.created_at}' ,updated_at = now() WHERE id = ${purchase_request.purchase_request_id}`;

                                var status = 8;

                            } else if (req.body.status == 'GRN') {
                                var updateQuery = `UPDATE purchase_requests set GRN =  '${purchase_request.document_id}', GRN_created_at =  '${purchase_request.created_at}' ,updated_at = now() WHERE id = ${purchase_request.purchase_request_id}`;

                                var status = 15;
                            } else if (req.body.status == 'PR') {
                                var updateQuery = `UPDATE purchase_requests set sap_pr_no = '${purchase_request.document_id }',sap_pr_created_at =  '${purchase_request.created_at}' ,updated_at = now() WHERE id = ${purchase_request.purchase_request_id}`;
                            }

                            con.query(`SELECT * FROM purchase_requests where id = ${purchase_request.purchase_request_id}`, function (c_err, c_result) {
                                if (c_err) {
                                    console.log(c_err);
                                    con.rollback(function () {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else if (c_result.length == 0) {
                                    con.rollback(function () {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else {
                                    con.query(updateQuery, function (u_err, u_result) {
                                        if (u_err) {
                                            console.log(u_err);
                                            con.rollback(function () {
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint"
                                                })
                                            });
                                            // con.release();

                                        } else {
                                            con.query(`SELECT indent_id FROM PR_items where purchase_request_id = ${purchase_request.purchase_request_id}`, function (g_err, g_result) {
                                                if (g_err) {
                                                    console.log(g_err);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint"
                                                        })
                                                    });
                                                    // con.release();

                                                } else {

                                                    g_result = g_result.map(({
                                                        indent_id
                                                    }) => indent_id);
                                                    g_result.forEach(function (indent_id, i) {

                                                        if (req.body.status == 'PO' || req.body.status == 'GRN') {

                                                            con.query(`UPDATE user_indents set status = ${status} WHERE id = ${indent_id}`, function (ui_err, ui_result) {
                                                                if (ui_err) {
                                                                    console.log(ui_err);
                                                                    res.status(500).json({
                                                                        "success": false,
                                                                        "message": "Error with endpoint"
                                                                    })
                                                                } else {

                                                                    con.query(`SELECT  indent_id, order_id, qty, created_by FROM order_status_logs where indent_id = ${indent_id} and status = 7 `, function (os_err, os_result) {
                                                                        if (os_err) {
                                                                            console.log(os_err);
                                                                            res.status(500).json({
                                                                                "success": false,
                                                                                "message": "Error with endpoint"
                                                                            })
                                                                        } else {

                                                                            con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, qty, sap_ref_id, created_by, created_at) VALUES (${indent_id}, ${os_result[0].order_id},${status}, ${os_result[0].qty}, '${purchase_request.document_id}', ${os_result[0].created_by}, now())`, function (osi_err, osi_result) {
                                                                                if (osi_err) {
                                                                                    console.log(osi_err);
                                                                                    res.status(500).json({
                                                                                        "success": false,
                                                                                        "message": "Error with endpoint"
                                                                                    })
                                                                                } else {
                                                                                    con.query(`SELECT id,(SELECT pr_qty FROM PR_items WHERE indent_id = ${indent_id}) as quantity, (SELECT  JSON_OBJECT('created_at', created_at, 'remarks', remarks) FROM order_status_logs where indent_id = ${indent_id} and status = 2 limit 1) as approval,  created_at, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id, 'email',email, 'first_name', first_name)  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${os_result[0].order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE id =  (SELECT product_id FROM user_indents where id = ${indent_id})) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${os_result[0].order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${os_result[0].order_id})) as wbs, plant_id, storage_location, storage_location_desc FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${os_result[0].order_id})`, function (ad_err, ad_result) {
                                                                                        if (ad_err) {
                                                                                            console.log(ad_err);
                                                                                            res.status(500).json({
                                                                                                "success": false,
                                                                                                "message": "Error with endpoint"
                                                                                            })
                                                                                        } else {
                                                                                            ad_result[0].user = JSON.parse(ad_result[0].user)
                                                                                            con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                                                                                                if (mn_err) {
                                                                                                    console.log(mn_err);

                                                                                                } else {
                                                                                                    console.log(mn_result);
                                                                                                    ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                                                                                    ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                                                                                    ad_result[0].wbs = JSON.parse(ad_result[0].wbs)
                                                                                                    ad_result[0].approval = JSON.parse(ad_result[0].approval)
                                                                                                    if (req.body.status == 'PO') {
                                                                                                        var template = 'd-b06c6e9b202f4294922e04addc6aaead'
                                                                                                    } else {
                                                                                                        var template = 'd-a115f8f9a41149bcb1c6bf3c73f4e749'

                                                                                                    }

                                                                                                    if (req.body.status == 'GRN') {
                                                                                                    var epo_no = c_result[0].PO_number;
                                                                                                    var epo_date = c_result[0].PO_created_at;
                                                                                                    } else {
                                                                                                        var epo_no = purchase_request.document_id;
                                                                                                    var epo_date = purchase_request.created_at;
                                                                                                    }


                                                                                                    requestss.post({
                                                                                                        url: 'https://api.sendgrid.com/v3/mail/send',
                                                                                                        headers: {
                                                                                                            'Authorization': 'Bearer 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',
                                                                                                            'Content-Type': 'application/json'
                                                                                                        },
                                                                                                        body: {


                                                                                                            "from": {
                                                                                                                "email": "IBGroup <grim@ibgroup.co.in>"
                                                                                                            },
                                                                                                            "personalizations": [{
                                                                                                                "to": [{
                                                                                                                    "email": ad_result[0].user.email
                                                                                                                    // "email": 'sisindri.s@nexivo.co'

                                                                                                                }],
                                                                                                                "dynamic_template_data": {
                                                                                                                    "subject": `${req.body.status} ${purchase_request.document_id} is done for Indent ${os_result[0].order_id} `,
                                                                                                                    "first_name": ad_result[0].user.first_name,
                                                                                                                    "pr_no": purchase_request.purchase_request_id,

                                                                                                                    "po_no": epo_no,

                                                                                                                    "GRN_no": purchase_request.document_id || null,
                                                                                                                    "pr_date": c_result[0].created_at,

                                                                                                                    "po_date": epo_date,

                                                                                                                    "GRN_date": purchase_request.created_at,
                                                                                                                    "indent_id": os_result[0].order_id,
                                                                                                                    "raised_by": ad_result[0].user.first_name,
                                                                                                                    "indent_date": ad_result[0].created_at,
                                                                                                                    "item_name": ad_result[0].material_details.name,
                                                                                                                    "item_quantity": ad_result[0].quantity,
                                                                                                                    "wbs_no": ad_result[0].wbs.wbs_number || null,
                                                                                                                    "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location_desc}`,
                                                                                                                    "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].receiving_plant.storage_location_desc}`,
                                                                                                                    "approved_by": mn_result[0].first_name,
                                                                                                                    "approved_on": ad_result[0].approval.created_at,
                                                                                                                    "approval_remark": ad_result[0].approval.remarks,
                                                                                                                }
                                                                                                            }],
                                                                                                            "template_id": template
                                                                                                        },
                                                                                                        json: true
                                                                                                    }, function (error, response, body) {
                                                                                                        console.log(error, '---------------');

                                                                                                        if (index == req.body.purchase_requests.length - 1) {
                                                                                                            con.commit(function (err) {
                                                                                                                if (err) {
                                                                                                                    connection.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                }
                                                                                                                setTimeout(() => {
                                                                                                                    res.status(200).json({
                                                                                                                        "sucess": true,
                                                                                                                        "message": `${req.body.status} updated successfully`
                                                                                                                    })
                                                                                                                }, 500);
                                                                                                            })
                                                                                                        }

                                                                                                    });
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    });

                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            })

                                                        } else {
                                                            con.query(`UPDATE order_status_logs set sap_ref_id = '${purchase_request.document_id}' WHERE indent_id = ${indent_id} and status = 7`, function (osi_err, osi_result) {
                                                                if (osi_err) {
                                                                    console.log(osi_err);
                                                                    res.status(500).json({
                                                                        "success": false,
                                                                        "message": "Error with endpoint"
                                                                    })
                                                                } else {
                                                                    if (index == req.body.purchase_requests.length - 1) {
                                                                        con.commit(function (err) {
                                                                            if (err) {
                                                                                connection.rollback(function () {
                                                                                    throw err;
                                                                                });
                                                                            }
                                                                            setTimeout(() => {
                                                                                res.status(200).json({
                                                                                    "sucess": true,
                                                                                    "message": "PR updated successfully"
                                                                                })
                                                                            }, 500);
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })

                                        }
                                    });

                                }
                            })


                        } else {
                            con.rollback(function () {
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            });
                        }
                    })
                }
            })
        })


    }
}

module.exports = new update_po_grn()