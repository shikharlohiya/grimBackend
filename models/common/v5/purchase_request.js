const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
var requestss = require('request');
require('dotenv/config')



const purchase_request = function () {}



purchase_request.prototype.purchase_request_latest_func = function (req, res, callback) {
    // console.log(req.body.requests);


    var da = new Date();
    var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
    var date = da.getFullYear() + ("0" + (da.getMonth() + 1)).slice(-2) + ("0" + (da.getDate())).slice(-2);
    var ndate =
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

    req.body.requests.forEach((request, index) => {
        var indent_ids = request.indents.map(({
            id
        }) => id);

        con.query(`INSERT INTO purchase_requests ( product_id,quantity, pr_quantity, wbs, created_by, status,indent_ids) VALUES (${request.material.id},${request.quantity},${request.pr_quantity}, '${request.wbs}', ${req.body.user_id}, 7, JSON_ARRAY(${indent_ids}))`, function (pr_err, pr_result) {
            if (pr_err) {
                console.log(pr_err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": pr_err
                })
            } else {


                con.query(`UPDATE PR_items set pr_raised = '1', purchase_request_id = ${pr_result.insertId } WHERE wbs = '${request.wbs}' AND material_id = ${request.material.id} and status = 1 and indent_id in (${indent_ids.join()})`, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else {
                        // console.log(pr_result);

                        var data = {
                            p_r_data: {
                                importTable_hdr: {
                                    GPRDC: pr_result.insertId.toString(),
                                    DOCDT: date.toString(),
                                    MATNR: request.material.material_sap_id,
                                    MAKTX: request.material.name,
                                    MENGE: request.pr_quantity,
                                    MEINS: request.material.base_unit,
                                    POSID: request.wbs,
                                    POST1: request.wbs_desc
                                },
                                importTable_itm: []
                            }
                        }
                        // axios.post('https://grim.co.in:3002/api/v2/sync/indent_data', data)
                        //     .then(function (response) {
                        if (request.wbs == 'WBS_GENERAL') {
                            var wbs_no = "";
                            var wbs_desc = "";

                        } else {
                            var wbs_no = request.wbs
                            var wbs_desc = request.wbs_desc

                        }
                        request.indents.forEach((indent, i) => {

                            var indent_sap = {
                                GPRDC: pr_result.insertId.toString(),
                                INDNO: indent.order_id.toString(),
                                ITEMN: indent.id.toString(),
                                WERKS: indent.plant_id,
                                LGORT: indent.store_id,
                                INDDT: indent.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, ''),
                                MATNR: request.material.material_sap_id,
                                MAKTX: request.material.name,
                                MENGE: indent.quantity,
                                MEINS: request.material.base_unit,
                                POSID: wbs_no,
                                POST1: wbs_desc,
                                GUSRID: indent.user_id.toString(),
                                DEPTID: indent.department.toString(),
                                APPRID: indent.manager_id.toString(),
                                APPRNM: indent.manager_name,
                                UMWRK: indent.delivery_plant_id,
                                UMLGO: indent.delivery_store_id,
                                PRIORITY: indent.priority_days.toString(),
                                PRIORITYTXT: indent.delivery_priority.split(" - ")[0],
                                WHERE_USED: indent.where_used,
                                REASON: indent.reason,
                                SECTION1: indent.section,
                                INDNAME: indent.first_name.toUpperCase(),
                                EMAIL: indent.email,
                                PHONE: indent.mobile_no,
                                BEDNR: indent.tracking_no,
                            }
                            data.p_r_data.importTable_itm.push(indent_sap);
                            con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, qty, created_by) VALUES (${indent.id}, ${indent.order_id},7,${indent.quantity}, ${req.body.user_id} )`, function (os_err, i_result) {
                                if (os_err) {
                                    console.log(os_err);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": os_err
                                    })
                                } else {
                                    // console.log(i_result);
                                    con.query(`UPDATE user_indents set status = 7 WHERE id = ${indent.id}`, function (indent_err, indent_result) {
                                        if (indent_err) {
                                            console.log(indent_err);

                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": indent_err
                                            })
                                        } else {
                                            // console.log(indent_result);


                                            con.query(`SELECT id,(SELECT  JSON_OBJECT('created_at', created_at, 'remarks', remarks) FROM order_status_logs where indent_id = ${indent.id} and status = 2 limit 1) as approval,  created_at, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id, 'email',email, 'first_name', first_name)  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${indent.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${request.material.material_sap_id}') as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${indent.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${indent.order_id})) as wbs, plant_id, storage_location, storage_location_desc FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${indent.order_id})`, function (ad_err, ad_result) {
                                                if (ad_err) {
                                                    console.log(ad_err);

                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint",
                                                        "err": ad_err
                                                    })
                                                } else {
                                                    ad_result[0].user = JSON.parse(ad_result[0].user)

                                                    ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                                    ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                                    ad_result[0].wbs = JSON.parse(ad_result[0].wbs)
                                                    ad_result[0].approval = JSON.parse(ad_result[0].approval)



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
                                                                    "subject": `PR is raised for Indent ${indent.order_id} and sent for procurement. `,
                                                                    "first_name": ad_result[0].user.first_name,
                                                                    "pr_no": pr_result.insertId,
                                                                    "pr_date": ndate,
                                                                    "indent_id": indent.order_id,
                                                                    "raised_by": ad_result[0].user.first_name,
                                                                    "indent_date": indent.created_at,
                                                                    "item_name": ad_result[0].material_details.name,
                                                                    "item_quantity": indent.quantity,
                                                                    "wbs_no": ad_result[0].wbs.wbs_number,
                                                                    "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location_desc}`,
                                                                    "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].receiving_plant.storage_location_desc}`,
                                                                    "approved_by": indent.manager_name,
                                                                    "approved_on": ad_result[0].approval.created_at,
                                                                    "approval_remark": ad_result[0].approval.remarks,
                                                                    "link": process.env.link
                                                                }
                                                            }],
                                                            "template_id": "d-574107e15b6f4ee68a368beab79f6cc0"
                                                        },
                                                        json: true
                                                    }, function (error, response, body) {
                                                        console.log(error, '---------------');
                                                        if (i == request.indents.length - 1) {
                                                            axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/pr_data`, data)
                                                                .then(function (pr_response) {
                                                                    // console.log('pr_response:', pr_response.data.status);

                                                                    if (index == req.body.requests.length - 1) {
                                                                        setTimeout(function () {

                                                                            res.status(200).json({
                                                                                "success": true,
                                                                                "message": "PR Raised Successfully"
                                                                            })
                                                                        }, 100);
                                                                    }

                                                                })
                                                                .catch(function (error) {
                                                                    console.log(error);
                                                                })
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    });
}

module.exports = new purchase_request()