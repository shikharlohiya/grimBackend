const con = require("../../db1.js"),

    mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const approval_count = function () { }


approval_count.prototype.approval_count_func = function (req, res, callback) {
    console.log(req.body);
    var pending_count = 0;
    var open_count = 0;
    var closed_count = 0;
    var all_count = 0;

    var orderCount = "";
    var fil_query = "";
    var idsArray = [];
    mysqlPool.getConnection(function (err, con) {
        if (req.body.role_id == 2 || req.body.role_id == 7 || req.body.role_id == 8 || req.body.role_id == 19) {
            if (req.body.role_id == 2) {
                fil_query = `SELECT id FROM user_details where manager_id =  ${req.body.user_id}`
            } else if (req.body.role_id == 19) {
                fil_query = `SELECT id FROM user_details where manager2 =  ${req.body.user_id}`

            } else if (req.body.role_id == 7) {
                fil_query = `SELECT id FROM user_details where hod =  ${req.body.user_id}`

            } else if (req.body.role_id == 8) {
                fil_query = `SELECT id FROM user_details`
            }
            console.log(fil_query);
            con.query(fil_query, function (serrs, m_result, fields) {
                if (serrs) {
                    console.log(serrs);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": serrs
                    })
                } else {
                    console.log(m_result);
                    idsArray = m_result.map(({
                        id
                    }) => id);
                    idsArray.push(req.body.user_id);

                    // idsArray = JSON.parse(idsArray);
                    orderCount = `SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM Indent_approvals WHERE order_id =a.id and approver_id = ${req.body.user_id} and finish="0" and status = '1') as approval_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0) as indent_count FROM user_orders as a where  type='indent' GROUP BY a.id HAVING approval_count > 0 and indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM Indent_approvals WHERE order_id =a.id) as approval_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0) as indent_count FROM user_orders as a where  type='indent' and user_id in (${idsArray.join()}) GROUP BY a.id HAVING approval_count > 0 and indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id ) as all_count, (SELECT count(id) FROM Indent_approvals WHERE order_id =a.id) as approval_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0) as indent_count FROM user_orders as a where  type='indent' and user_id in (${idsArray.join()}) GROUP BY a.id HAVING indent_count = all_count and approval_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM Indent_approvals WHERE order_id =a.id) as approval_count FROM user_orders as a where  type='indent' and user_id in (${idsArray.join()}) GROUP BY a.id HAVING approval_count > 0;`
                }
            })
            // idsArray = JSON.parse(idsArray);
        } else if (req.body.role_id == 11 || req.body.role_id == 5) {
            con.query(`SELECT store_locations FROM user_details where id  = ${req.body.user_id}`, function (serrs, sresults, fields) {
                if (serrs) {
                    console.log(serrs);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": serrs
                    })
                } else {
                    var idsArray = sresults.map(({
                        store_locations
                    }) => store_locations);
                    console.log(idsArray);

                    idsArray = JSON.parse(idsArray);
                    if (idsArray.length > 0) {
                        var order_filter = `AND a.plant_id in (${idsArray.join()})`
                    } else {
                        var order_filter = "";
                    }

                    if (req.body.role_id == 11) {
                        orderCount = `SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0 and approval_finish = '1' and rm_approval = '0') as indent_count FROM user_orders as a where  type='indent' ${order_filter} GROUP BY a.id HAVING indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0  and approval_finish='1') as indent_count FROM user_orders as a where  type='indent' ${order_filter} GROUP BY a.id HAVING indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish='1' ) as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1') as indent_count FROM user_orders as a where type='indent' ${order_filter} GROUP BY a.id HAVING indent_count = all_count and indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish = '1') as indent_count FROM user_orders as a where type='indent' ${order_filter} GROUP BY a.id HAVING indent_count> 0 ;`

                    } else if (req.body.role_id == 5) {
                        orderCount = `SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0 and approval_finish = '1' and rm_approval = '1') as indent_count FROM user_orders as a where  type='indent' ${order_filter} GROUP BY a.id HAVING indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0 and approval_finish = '1' and rm_approval = '1') as indent_count FROM user_orders as a where  type='indent' ${order_filter} GROUP BY a.id HAVING indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and approval_finish='1' and rm_approval='1' ) as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1'  and rm_approval='1') as indent_count FROM user_orders as a where  type='indent' ${order_filter} GROUP BY a.id HAVING indent_count = all_count and indent_count>0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish = '1' and rm_approval = '1') as indent_count FROM user_orders as a where type='indent' ${order_filter} GROUP BY a.id  HAVING indent_count> 0;`
                    }
                }
            })
        } else if (req.body.role_id == 3) {
            orderCount = `SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM Indent_approvals WHERE order_id =a.id and created_by = ${req.body.user_id} and finish="0" and status='1') as approval_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0) as indent_count FROM user_orders as a where  type='indent' GROUP BY a.id HAVING approval_count > 0 and indent_count > 0; SELECT COALESCE(count(*), 0) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty>0) as indent_count FROM user_orders as a where  type='indent' and user_id = ${req.body.user_id} GROUP BY a.id HAVING indent_count > 0; SELECT COALESCE(count(*), 0) as count,  (SELECT count(id) FROM user_indents WHERE order_id =a.id ) as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0 and user_id = ${req.body.user_id}) as indent_count FROM user_orders as a where  type='indent' GROUP BY a.id HAVING  indent_count = all_count; SELECT COALESCE(count(*), 0) as count FROM user_orders as a where type='indent' and user_id = ${req.body.user_id} GROUP BY a.id`
        }

        setTimeout(function () {
            console.log(orderCount);
            con.query(orderCount, function (errs, results, fields) {
                if (errs) {
                    console.log(errs);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": errs
                    })
                } else {
                    console.log(results);
                    if (results[0].length > 0) {
                        pending_count = results[0].length
                    }
                    if (results[1].length > 0) {
                        open_count = results[1].length
                    }
                    if (results[2].length > 0) {
                        closed_count = results[2].length
                    }
                    if (results[3].length > 0) {
                        all_count = results[3].length
                    }
                    res.status(200).json({
                        "success": true,
                        "pending_count": pending_count,
                        "open_count": open_count,
                        "closed_count": closed_count,
                        "all_count": all_count,
                    })
                }
            });
        }, 10);
    });
}

module.exports = new approval_count()