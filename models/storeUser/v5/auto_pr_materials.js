const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const auto_pr_items = function () { }


auto_pr_items.prototype.auto_pr_items_func = function (req, res, callback) {
    console.log(req);

    mysqlPool.getConnection(function (err, con) {

        con.query(`SELECT store_locations FROM user_details where id  = ${req.query.user_id}`, function (serrs, sresults, fields) {
            if (serrs) {
                console.log(serrs);

                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": serrs
                })
            } else {
                var storeArray = sresults.map(({
                    store_locations
                }) => store_locations);
                // console.log(storeArray);

                storeArray = JSON.parse(storeArray);
                if (storeArray.length > 0) {
                    con.query(`SELECT a.material_id, a.wbs, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, sum(a.pr_qty) as quantity, (SELECT JSON_OBJECT('id', b.id, 'material_sap_id', b.material_sap_id, 'material_sap_id', b.material_sap_id , 'material_sap_id', b.material_sap_id, 'name', b.name, 'base_unit', b.base_unit)) AS 'material' from PR_items as a  JOIN material_items AS b ON b.id = a.material_id  JOIN user_indents as c ON c.id=a.indent_id  JOIN user_orders as d ON d.id=c.order_id where a.wbs IS NOT NULL and a.status = '1' and c.status NOT IN (3,4) and a.pr_raised = '0' and a.wbs = '${req.query.wbs_no}' and d.md_approval = '0' and d.plant_id in (${storeArray.join()})  group by a.wbs, a.material_id`, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else {
                            // console.log(result, '------wbs------');

                            if (result.length > 0) {
                                result.forEach((item, index) => {
                                    result[index].material = JSON.parse(result[index].material);

                                    con.query(`SELECT  DISTINCT  a.indent_id, a.pr_qty, a.plant_id, a.store_id FROM PR_items as a INNER JOIN user_indents as b
                        ON a.indent_id=b.id INNER JOIN user_orders as c
                        ON b.order_id=c.id WHERE a.material_id =${item.material.id} and a.wbs =  '${item.wbs}' and a.status = '1' and b.status NOT IN (3) and c.md_approval = '0' and c.plant_id in (${storeArray.join()}) and a.pr_raised = '0'`, function (u_err, u_result, fields) {
                                        if (u_err) {
                                            console.log(u_err);

                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": u_err
                                            })
                                        } else {
                                            // console.log(u_result, '--------------------');

                                            // result[index].users = u_result;
                                            // var idsArray = u_result.map(({
                                            //     indent_id
                                            // }) => indent_id);
                                            u_result.forEach((indent, i) => {

                                                con.query(`SELECT a.id, a.quantity,a.created_at, a.order_id, (SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color,user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT sap_user_id FROM user_details WHERE id = user_id ) as sap_id, (SELECT email FROM user_details WHERE id = user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = user_id ) as mobile_no, (SELECT department FROM user_details WHERE id = user_id ) as department, (SELECT COALESCE ( manager_id , id ) FROM user_details WHERE id = user_id ) as manager_id, (SELECT first_name FROM user_details WHERE id = (SELECT manager_id FROM user_details WHERE id = user_id ) ) as manager_name, (SELECT plant_id FROM plant_details_sync WHERE id = (SELECT address FROM user_orders WHERE id = a.order_id ) ) as delivery_plant_id, (SELECT storage_location FROM plant_details_sync WHERE id = (SELECT address FROM user_orders WHERE id = a.order_id ) ) as delivery_store_id, delivery_priority, where_used, reason, section, tracking_no, priority_days, s_no, (SELECT remarks FROM order_status_logs WHERE indent_id = a.id and role_id = 11 and status = 2 ) as req_manager_remarks FROM user_indents as a WHERE product_id =${item.material.id} and id = ${indent.indent_id} `, function (in_err, in_result, fields) {
                                                    if (in_err) {
                                                        console.log(in_err);

                                                        con.release();
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint"
                                                        })
                                                    } else {

                                                        in_result[0].quantity = u_result[i].pr_qty
                                                        in_result[0].plant_id = u_result[i].plant_id
                                                        in_result[0].store_id = u_result[i].store_id
                                                        in_result[0].checkStatus = false


                                                        u_result[i] = in_result[0];
                                                        if (i == u_result.length - 1) {
                                                            result[index].indents = u_result

                                                        }
                                                        if (index == result.length - 1) {
                                                            var wbsArray = [];

                                                            result.forEach((o, i) => {
                                                                o.id = i + 1;
                                                                wbsArray.push(o.wbs);
                                                            });
                                                            var wbs = [...new Set(wbsArray)]

                                                           // con.release();
                                                            setTimeout(function () {
                                                                res.status(200).json({
                                                                    "success": true,
                                                                    "data": {
                                                                        "result": result,
                                                                        "wbs": wbs
                                                                    }
                                                                })
                                                            }, 100);

                                                        }
                                                    }
                                                });
                                            })
                                        }
                                    });

                                })
                            } else {

                                con.release();
                                res.status(200).json({
                                    "success": true,
                                    "data": {
                                        "result": [],
                                        "wbs": []
                                    }
                                })
                            }
                        }
                    });
                } else {

                    con.release();
                    res.status(200).json({
                        "success": true,
                        "data": {
                            "result": [],
                            "wbs": []
                        }
                    })
                }
            }
        })
    })
}

module.exports = new auto_pr_items()