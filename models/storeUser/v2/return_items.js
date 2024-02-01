const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const return_items = function () {}


return_items.prototype.return_items_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);



        if (req.body.status.length == 0) {
            var returnQuery = `SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id, (SELECT document FROM order_status_logs WHERE id = a.ref_id ) as document, (SELECT document_year FROM order_status_logs WHERE id = a.ref_id ) as document_year, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as indent_created_at, (SELECT sto FROM order_status_logs WHERE id = a.approval_id ) as sto, a.plant_id, a.storage_location, a.indent_id, a.order_id,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , a.quantity, (SELECT price FROM user_indents WHERE id = a.indent_id ) as price,  (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks, a.created_at, a.created_by, a.ref_id, a.movement_type, a.approval_id FROM return_items as a ORDER BY id DESC `;
        } else {
            var returnQuery = `SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id,  (SELECT document FROM order_status_logs WHERE id = a.ref_id ) as document, (SELECT document_year FROM order_status_logs WHERE id = a.ref_id ) as document_year, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as indent_created_at,  (SELECT sto FROM order_status_logs WHERE id = a.approval_id ) as sto, a.plant_id, a.storage_location, a.indent_id, a.order_id,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , a.quantity, (SELECT price FROM user_indents WHERE id = a.indent_id ) as price, (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks, a.created_at, a.created_by, a.ref_id, a.movement_type, a.approval_id FROM return_items as a WHERE a.status in (${req.body.status.join()}) ORDER BY id DESC `;
        }
        con.query(returnQuery, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (result.length > 0) {
                    con.release();
                    res.status(200).json({
                        "success": true,
                        "data": result
                    })
                } else {
                    con.release();
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