const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const approvals_details = function () {}

approvals_details.prototype.approvals_details_func = function (req, res, callback) {
    // console.log(req.body);
    if (req.query.type == undefined || req.query.type == "") {
        var type = 'indent';
    } else {
        var type = req.query.type;
    }

    if (req.query.service_id == undefined || req.query.service_id == "") {
        var service_id = "";
    } else {
        var service_id = `and a.service_id = ${req.query.service_id}`;
    }
    con.query(`SELECT a.*,(select first_name from user_details where id = a.approver_id) as approver_name, (SELECT first_name FROM user_details WHERE id = a.created_by ) as indenter_name , (SELECT role FROM user_roles WHERE id = a.role_id ) as role FROM Indent_approvals as a where a.indent_id  = ${req.query.id} and type = '${type}' ${service_id} ORDER BY a.created_at `, function (uerr, uresult, fields) {
        if (uerr) {
            console.log(uerr);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": uerr
            })
        } else {
            // console.log(uresult);

            res.status(200).json({
                "success": true,
                "approvals_details": uresult
            })
        }
    });
}

module.exports = new approvals_details()