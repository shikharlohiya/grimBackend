const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const order_details = function () {}


order_details.prototype.order_details_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

        var orderQuery = `SELECT a.*, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.storage_location_desc , 'storage_location', b.storage_location)) AS 'address' , (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.id = ${req.body.order_id}`

        con.query(orderQuery, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {

                result.forEach((item, index) => {
                    result[index].address = JSON.parse(result[index].address);
                    result[index].store_address = JSON.parse(result[index].store_address);
                    con.query(`SELECT a.id,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id ,  (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' ) as stock , a.quantity, a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status,(SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks, a.created_at, a.created_by FROM user_indents as a INNER JOIN material_items as b ON a.product_id=b.id WHERE a.order_id =${item.id}`, function (i_err, i_result, fields) {
                        if (i_err) {
                            console.log(i_err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            result[index].total_items = i_result.length;

                            function get_total_quantity(i_result) {
                                var sum = 0;
                                for (var i = 0; i < i_result.length; i++) {
                                    sum += i_result[i].quantity;
                                }
                                console.log(sum);
                                return sum

                            }
                            function get_total_price(i_result) {
                                var totalsum = 0;
                                for (var i = 0; i < i_result.length; i++) {
                                    totalsum += i_result[i].total_price;
                                }
                                console.log(totalsum);
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
    })
}

module.exports = new order_details()