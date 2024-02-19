const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const vendors = function () {}


vendors.prototype.vendors_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT id,user_id, name, vendor_name, mobile_no,address,is_verified, manager_remarks, created_at,(SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, (SELECT first_name FROM user_details WHERE id = user_id ) as user_name FROM vendors where user_id = ${req.body.user_id} ORDER BY id DESC`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {

            res.status(200).json({
                "success": true,
                "vendors": result
            })
        }
    });
}

module.exports = new vendors()