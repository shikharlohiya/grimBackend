const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
var request = require('request');
require('dotenv/config')

const create_sto = function () {}


create_sto.prototype.create_sto_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        // console.log('--------');

        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);

                var order = req.body.order

                if (true) {
                    var md_approval = '0';
                } else {
                    var md_approval = '1';

                }

                if (order.WBS_NO == undefined) {
                    order.WBS_NO = "WBS_GENERAL";
                }


                con.query(`INSERT INTO user_orders (user_id, plant_id, total,status, address, WBS_NO, md_approval, type, created_at, created_by) VALUES (${order.user_id},${order.plant.id}, ${order.total},1 , ${order.address}, '${order.WBS_NO}', '${md_approval}', 'STO', now(),${order.user_id})`, function (o_err, o_result) {
                    if (o_err) {
                        console.log(o_err);
                        con.rollback(function () {


                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": o_err
                            })
                        });
                    } else {

                        order.items.forEach((item, index) => {
                            if (item.reason == undefined) {
                                item.reason = "";
                            }
                            if (item.where_used == undefined) {
                                item.where_used = "";
                            }


                            var indentIdsArray = item.indents.map(({
                                id
                            }) => id);
                            console.log(indentIdsArray);

                            con.query(`SELECT quantity as stock, (SELECT IFNULL(sum(remaining_qty),0)-(SELECT IFNULL(sum(pr_qty),0) FROM PR_items where material_id =  ${item.material_id} and pr_raised = '0' and status = '1' and plant_id= '${order.plant.plant_id}' and store_id = '${order.plant.storage_loc}' ) FROM user_indents as b where product_id =  ${item.material_id} and (select plant_id FROM user_orders where id = b.order_id) = '${order.plant.id}') as bag, price FROM material_stock WHERE material_id = ${item.material.material_sap_id} AND plant_id = '${order.plant.plant_id}' AND storage_loc = '${order.plant.storage_loc}' `, function (sp_err, sp_result) {
                                if (sp_err) {
                                    console.log(sp_err);
                                    con.rollback(function () {


                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": sp_err
                                        })
                                    });
                                } else {
                                    console.log(sp_result, '---------');
                                    if (sp_result.length > 0) {

                                        con.query(`UPDATE PR_items set status = '0'  WHERE indent_id in (${indentIdsArray.join()}) `, function (pr_err, pr_result, fields) {
                                            if (pr_err) {
                                                console.log(pr_err);
                                                con.rollback(function () {


                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint",
                                                        "err": pr_err
                                                    })
                                                });
                                            } else {

                                                con.query(`INSERT INTO user_indents ( product_id, user_id, order_id, quantity, remaining_qty, intial_qty, price, total_price, delivery_priority, tracking_no, section, reason, where_used, priority_days, status, type, created_at, created_by, s_no, ref_indents) VALUES (${item.material_id}, ${order.user_id}, ${o_result.insertId},${item.quantity},${item.quantity},${item.quantity},${sp_result[0].price},${sp_result[0].price} * ${item.quantity},'${item.delivery_priority}','${item.tracking_no}', '${item.section}', '${item.reason}', '${item.where_used}', '${item.priority_days}', 1 , 'STO', now(),${order.user_id}, ${index+1}, JSON_ARRAY(${indentIdsArray}))`, function (i_err, i_result) {
                                                    if (i_err) {
                                                        console.log(i_err);

                                                        con.rollback(function () {


                                                            res.status(500).json({
                                                                "success": false,
                                                                "message": "Error with endpoint",
                                                                "err": i_err
                                                            })
                                                        });
                                                    } else {

                                                        var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status, qty, created_by, created_at) VALUES (${i_result.insertId}, ${o_result.insertId},1, ${item.quantity}, ${order.user_id} , now());`;

                                                        con.query(statusQuery, function (os_err, os_result) {
                                                            if (os_err) {
                                                                console.log(os_err);
                                                                con.rollback(function () {


                                                                    res.status(500).json({
                                                                        "success": false,
                                                                        "message": "Error with endpoint",
                                                                        "err": os_err
                                                                    })
                                                                });
                                                            } else {
                                                                con.query(`UPDATE user_indents set status = 19  WHERE id in (${indentIdsArray.join()}) `, function (ui_err, ui_result) {
                                                                    if (ui_err) {
                                                                        console.log(ui_err);
                                                                        con.rollback(function () {


                                                                            res.status(500).json({
                                                                                "success": false,
                                                                                "message": "Error with endpoint",
                                                                                "err": ui_err
                                                                            })
                                                                        });
                                                                    } else {

                                                                        let stoArray = [];

                                                                        item.indents.forEach(function (exIndent, indexIn) {
                                                                            stoArray.push([exIndent.id, exIndent.order_id, 19, exIndent.quantity, order.user_id]);
                                                                            if (indexIn == item.indents.length - 1) {

                                                                                var StatusSto = `INSERT INTO order_status_logs ( indent_id, order_id, status, qty, created_by) VALUES ?`

                                                                                con.query(StatusSto, [stoArray], function (bis_err, bis_result) {
                                                                                    if (bis_err) {
                                                                                        console.log(bis_err);
                                                                                        con.rollback(function () {


                                                                                            res.status(500).json({
                                                                                                "success": false,
                                                                                                "message": "Error with endpoint",
                                                                                                "err": bis_err
                                                                                            })
                                                                                        });
                                                                                    } else {

                                                                                        console.log((sp_result[0].stock - sp_result[0].bag) - item.quantity, '------------bag', sp_result[0].bag);
                                                                                        if ((sp_result[0].stock - sp_result[0].bag) - item.quantity < 0) {

                                                                                            if ((sp_result[0].stock - sp_result[0].bag) < 0) {
                                                                                                var bagcount = 0;

                                                                                            } else {
                                                                                                var bagcount = sp_result[0].stock - sp_result[0].bag;

                                                                                            }
                                                                                            con.query(`INSERT INTO PR_items ( indent_id, material_id, plant_id,store_id, wbs, requested_qty, pr_qty, status, created_by) VALUES (${i_result.insertId}, ${item.material_id}, '${order.plant.plant_id}','${order.plant.storage_loc}', '${order.WBS_NO}', ${item.quantity},${item.quantity - bagcount}, '1', ${order.user_id} )`, function (pr_err, pr_result) {
                                                                                                if (pr_err) {
                                                                                                    console.log(pr_err);
                                                                                                    con.rollback(function () {


                                                                                                        res.status(500).json({
                                                                                                            "success": false,
                                                                                                            "message": "Error with endpoint",
                                                                                                            "err": pr_err
                                                                                                        })
                                                                                                    });
                                                                                                } else {
                                                                                                    console.log('Pr_items inserted');
                                                                                                    if (index == order.items.length - 1) {

                                                                                                        con.commit(function (err) {
                                                                                                            if (err) {
                                                                                                                con.rollback(function () {
                                                                                                                    throw err;
                                                                                                                });
                                                                                                            }

                                                                                                            res.status(200).json({
                                                                                                                "success": true,
                                                                                                                "message": "STO Created Successfully"
                                                                                                            })
                                                                                                        })
                                                                                                    }

                                                                                                }
                                                                                            })
                                                                                        } else {
                                                                                            if (index == order.items.length - 1) {

                                                                                                con.commit(function (err) {
                                                                                                    if (err) {
                                                                                                        con.rollback(function () {
                                                                                                            throw err;
                                                                                                        });
                                                                                                    }

                                                                                                    res.status(200).json({
                                                                                                        "success": true,
                                                                                                        "message": "STO Created Successfully"
                                                                                                    })
                                                                                                })
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });


                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        })

                                    } else {
                                        con.rollback(function () {


                                            res.status(200).json({
                                                "success": false,
                                                "message": "This Material is not available in Selected Store...!"
                                            })
                                        });
                                    }

                                }
                            })
                        })
                    }
                });
            }
        })
    })
}

module.exports = new create_sto()