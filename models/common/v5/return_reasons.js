const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const return_reasons = function () {}

return_reasons.prototype.return_reasons_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT a.* FROM return_reasons as a  where a.status  = '1' ORDER BY a.id `, function (uerr, uresult, fields) {
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
                "return_reasons": uresult
            })
        }
    });
}

module.exports = new return_reasons()