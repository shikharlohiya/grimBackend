const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
require('dotenv/config')

var cron = require('node-cron');
// console.log('-------------- cron will start--------------');

// cron.schedule('0 19 * * *', () => {
//   console.log('----------------------------');

//   // Make a request for a user with a given ID
//   axios.post(`${process.env.host}/api/v4/sendmailauto_reject`)
//     .then(function (response) {
//       console.log(response.data, '----------------------');
//       // res.status(200).json({
//       //     status: 200,
//       //     result: response.data
//       // });
//     })
//     .catch(function (error) {
//       console.log(error);
//       // res.status(500).json({
//       //     status: 500,
//       //     message: error
//       // });
//     })
// });
const auto_reject = function () {}


auto_reject.prototype.auto_reject_func = function (req, res, callback) {
    // console.log(req.body);

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

    con.query(`SELECT a.id, a.user_id, (SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_sap_id FROM material_items WHERE id = a.product_id ) as product_sap_id , a.quantity,ROUND(a.price, 2) AS price, ROUND(a.total_price, 2) AS total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.intial_qty, a.remaining_qty, a.closed, a.created_at, a.created_by, a.s_no, a.is_pr_raised FROM user_indents as a WHERE status = '1' and type = 'normal' and DATE(created_at) <= DATE_SUB(DATE(NOW()), INTERVAL 3 DAY)`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result[0], result.length, 'result: ---------------');
            if (result.length > 0) {
                result.forEach((indent, index) => {
                    var query = `UPDATE user_indents set status = 4, remaining_qty = 0, closed = 1 WHERE id = ${indent.id}`

                    con.query(query, function (i_err, i_result) {
                        if (i_err) {
                            console.log(i_err);
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": i_err
                            })
                        } else {
                            con.query(`UPDATE PR_items set status = '0'  where indent_id = ${indent.id}`, function (pr_err, pr_result, fields) {
                                if (pr_err) {
                                  console.log(pr_err);
                                }
                              })
                              con.query(`UPDATE Indent_approvals set status = '0' where indent_id = ${indent.id}`, function (a_err, a_result, fields) {
                                if (a_err) {
                                  console.log(a_err);
                                }
                              })
                            var orderstatusLogs = `INSERT INTO order_status_logs ( indent_id, order_id, status, remarks, qty, created_by, created_at) VALUES (${indent.id}, ${indent.order_id},4, 'Due to not approved within stipulated time', ${indent.intial_qty}, 1, now())`
                            con.query(orderstatusLogs, function (is_err, is_result) {
                                if (is_err) {
                                    console.log(is_err);
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": is_err
                                    })
                                } else {
                                    con.query(`SELECT name,(SELECT first_name  FROM user_details WHERE id ='${indent.user_id}') as first_name, (SELECT email  FROM user_details WHERE id =  '${indent.user_id}') as user_mail FROM material_items WHERE id =  '${indent.product_id}'`, function (mt_err, mt_result) {
                                        if (mt_err) {
                                            console.log(mt_err);

                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": mt_err
                                            })
                                        } else {
                                            var substitutions = {
                                                "from": "IBGroup <grim@ibgroup.co.in>",
                                                "to": mt_result[0].user_mail,
                                                "subject": `Indent ${indent.order_id} is cancelled Due to not approved within stipulated time `,
                                                "template": "indentAutoRejectTemp",
                                                "view": {
                                                    "first_name": mt_result[0].first_name,
                                                    "indent_id": indent.order_id,
                                                    "date": ndate,
                                                    "remarks": 'Due to not approved within stipulated time',
                                                    "material": mt_result[0].name,
                                                    "link": process.env.link
                                                }

                                            }
                                            axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                                .then(function (response) {
                                                    // console.log(response);
                                                }).catch(function (error) {
                                                    // handle error
                                                    console.log(error);
                                                })
                                            if (index == result.length - 1) {
                                                setTimeout(function () {

                                                    res.status(200).json({
                                                        "success": true,
                                                        "message": "Updated Successfully"
                                                    })
                                                }, 10);
                                            }
                                        }
                                    })

                                }
                            })

                        }
                    })
                });
            } else {
                res.status(200).json({
                    "success": true,
                    "message": "No indents to update"
                })
            }
        }
    });
}

module.exports = new auto_reject()