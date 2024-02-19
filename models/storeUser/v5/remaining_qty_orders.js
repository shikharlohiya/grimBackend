const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const remaining_qty_orders = function () { }


remaining_qty_orders.prototype.remaining_qty_orders_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body.user_id);
        var remaining_indents = [];


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
                // console.log(idsArray);

                idsArray = JSON.parse(idsArray);
                if (idsArray.length > 0) {
                    var order_filter = `AND a.plant_id in (${idsArray.join()})`
                    if (req.body.type == 'STO') {
                        var type = `a.type='STO'`
                        var pStatus = ''
                    } else {
                        var type = `a.type='indent'`
                        var pStatus = `AND a.status != 1`

                    }
                    con.query(`SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id AND remaining_qty > 0) as indent_count, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location)) AS 'address' , (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE ${type} AND  a.md_approval = '0' ${order_filter} HAVING indent_count > 0  ORDER BY id`, function (err, result, fields) {
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

                                result[index].address = JSON.parse(result[index].address);
                                result[index].store_address = JSON.parse(result[index].store_address);
                                con.query(`SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, (SELECT first_name FROM user_details WHERE id = (SELECT manager_id FROM user_details WHERE id = a.user_id LIMIT 1 )) as manager_name,
                                (SELECT first_name FROM user_details WHERE id = (SELECT created_by FROM order_status_logs WHERE indent_id = a.id and role_id = 11 LIMIT 1) ) as request_manager_name, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5) as issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5 and (sto IS NOT NULL or document IS NOT NULL) ) as actual_issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14)) as return_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 11) as received_qty,  (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) as rejected_qty,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id , (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' and valution_type = a.valution_type ) as stock , a.quantity, a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status,(SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.closed, a.closed as close, a.remaining_qty, a.intial_qty, a.created_at, a.created_by, a.s_no FROM user_indents as a INNER JOIN material_items as b ON a.product_id=b.id WHERE a.order_id =${item.id} AND a.remaining_qty > 0 ${pStatus}`, function (i_err, i_result, fields) {
                                    if (i_err) {
                                        console.log(i_err);

                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": i_err
                                        })
                                    } else {
                                        // console.log(i_result);
                                        if (i_result.length > 0) {
                                            i_result = i_result.map(obj => ({
                                                ...obj,
                                                store_address: result[index].store_address
                                            }));
                                            i_result = i_result.map(obj => ({
                                                ...obj,
                                                address: result[index].address
                                            }));
                                        }
                                        remaining_indents = [...remaining_indents, ...i_result];

                                        if (index == result.length - 1) {
                                            console.log("test");
                                            setTimeout(function () {
                                                console.log("done");
                                                res.status(200).json({
                                                    "success": true,
                                                    "orders": remaining_indents
                                                })
                                            }, 100);

                                        }
                                    }
                                });
                            })
                        } else {

                            res.status(200).json({
                                "success": true,
                                "orders": []
                            })
                        }
                    });


                } else {

                    res.status(200).json({
                        "success": true,
                        "orders": []
                    })
                }
            }
        })
    })
}

module.exports = new remaining_qty_orders()