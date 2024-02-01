const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const status_history = function () {}

status_history.prototype.status_history_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT (SELECT description FROM order_status WHERE value = a.status ) as status, remarks, qty, sap_ref_id, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as name , (SELECT role_id FROM user_details WHERE id = a.created_by ) as role_id, a.created_at, (SELECT role FROM user_roles WHERE id = (SELECT role_id FROM user_details WHERE id = a.created_by ) ) as role, sto, movement_type, document, document_year, updated_at FROM order_status_logs as a  where a.indent_id  = ${req.body.id} ORDER BY a.created_at `, function (uerr, uresult, fields) {
            if (uerr) {
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(uresult);
                con.release();
                    res.status(200).json({
                        "success": true,
                        "status_history": uresult
                    })
            }
        });
    })
}

module.exports = new status_history()