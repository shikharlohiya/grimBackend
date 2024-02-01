const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const return_items = function () {}


return_items.prototype.return_items_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);



        if (req.body.status.length == 0) {
            var returnQuery = `SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id, a.plant_id, a.storage_location, a.indent_id, a.order_id,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , a.quantity, (SELECT price FROM user_indents WHERE id = a.indent_id ) as price, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks, a.created_at, a.created_by FROM return_items as a `;
        } else {
            var returnQuery = `SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id, a.plant_id, a.storage_location, a.indent_id, a.order_id,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , a.quantity, (SELECT price FROM user_indents WHERE id = a.indent_id ) as price, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks, a.created_at, a.created_by FROM return_items as a WHERE a.status in (${req.body.status.join()})`;
        }
        con.query(returnQuery, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (result.length > 0) {
                    res.status(200).json({
                        "success": true,
                        "data": result
                    })
                } else {
                    res.status(200).json({
                        "success": true,
                        "data": []
                    })
                }
            }
        });
    })
}

module.exports = new return_items()