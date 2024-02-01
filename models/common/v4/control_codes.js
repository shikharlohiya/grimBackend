const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const control_codes = function () {}

control_codes.prototype.control_codes_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * from control_code`, function (uerr, uresult, fields) {
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
                "data": uresult
            })
        }
    });
}

module.exports = new control_codes()