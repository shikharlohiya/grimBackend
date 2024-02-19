const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const ticket_details = function () {}


ticket_details.prototype.ticket_details_func = function (req, res, callback) {
    // console.log(req.body);

    var orderQuery = `SELECT a.ticket_id, a.created_at, a.id, a.updated_at, a.type, a.urgent_flag, a.delivery_type, a.WBS_NO, a.total as total_price, a.status, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name', b.storage_location_desc , 'storage_location', b.storage_location)) AS 'address' , (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.ticket_id = '${req.query.ticket_id}'`

    con.query(orderQuery, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else if (result.length > 0) {

            result.forEach((item, index) => {
                result[index].address = JSON.parse(result[index].address);
                result[index].store_address = JSON.parse(result[index].store_address);

                con.query(`SELECT a.id,(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'role_name', (Select role from user_roles where id = d.role_id), 'user_name', (Select first_name from user_details where id = d.created_by), 'qty', qty, 'status', (Select description from order_status where id = d.status), 'created_at', created_at, 'batch_id', batch_ids, 'serial_numbers', serial_numbers, 'document', document, 'movement_type', movement_type)) FROM order_status_logs as d WHERE indent_id = a.id) as material_status_logs,  (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5) as issued_qty,  (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5 and (sto IS NOT NULL or document IS NOT NULL) ) as actual_issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14)) as return_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 11) as received_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) as rejected_qty,   a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id , a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status,(SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.closed, a.closed as close, a.remaining_qty, a.intial_qty, a.created_at, a.s_no, a.delivery_date FROM user_indents as a INNER JOIN material_items as b ON a.product_id=b.id WHERE a.order_id =${item.id}`, function (i_err, i_result, fields) {
                    if (i_err) {
                        console.log(i_err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": i_err
                        })
                    } else {

                        i_result.forEach((element, index, array) => {
                            element.material_status_logs = JSON.parse(element.material_status_logs)
                        });
                        result[index].total_items = i_result.length;

                        function get_total_quantity(i_result) {
                            var sum = 0;
                            for (var i = 0; i < i_result.length; i++) {
                                sum += i_result[i].quantity;
                            }
                            // console.log(sum);
                            return sum

                        }

                        function get_total_price(i_result) {
                            var totalsum = 0;
                            for (var i = 0; i < i_result.length; i++) {
                                totalsum += i_result[i].total_price;
                            }
                            // console.log(totalsum);
                            return totalsum

                        }
                        result[index].total = get_total_price(i_result);
                        result[index].total_quantity = get_total_quantity(i_result);
                        result[index].order_items = i_result;
                        if (index == result.length - 1) {

                            res.status(200).json({
                                "success": true,
                                "orders": result
                            })

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
}

module.exports = new ticket_details()