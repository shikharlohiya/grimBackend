const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const received_materials = function () {}

received_materials.prototype.received_materials_func = function (req, res, callback) {
    // console.log(req.body);
    if (req.query.type == undefined) {
        var status = 5
    } else if (req.query.type == 'STO') {
        var status = 20
    }
    con.query(`SELECT id, (SELECT description FROM order_status WHERE value = a.status ) as status, remarks, qty, sap_ref_id, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as name , (SELECT role_id FROM user_details WHERE id = a.created_by ) as role_id, a.created_at, (SELECT role FROM user_roles WHERE id = (SELECT role_id FROM user_details WHERE id = a.created_by ) ) as role, sto, movement_type, document, document_year, returned_or_not FROM order_status_logs as a  where a.indent_id  = ${req.query.id} and status = ${status} and received_or_not = '1' ORDER BY a.created_at `, function (uerr, uresult, fields) {
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
                "data": uresult
            })
        }
    });
}

module.exports = new received_materials()