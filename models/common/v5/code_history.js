const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_history = function () {}

code_history.prototype.code_history_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT a.*,(SELECT description FROM order_status WHERE value = a.status ) as status,  (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as name , (SELECT role_id FROM user_details WHERE id = a.created_by ) as role_id, (SELECT role FROM user_roles WHERE id = (SELECT role_id FROM user_details WHERE id = a.created_by ) ) as role FROM code_status_logs as a  where a.code_id  = ${req.body.id} ORDER BY a.created_at`, function (uerr, uresult, fields) {
        if (uerr) {

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": uerr
            })
        } else {
            // console.log(uresult);

            res.status(200).json({
                "success": true,
                "code_history": uresult
            })
        }
    });
}

module.exports = new code_history()