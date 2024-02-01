const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const gl_accounts = function () {}


gl_accounts.prototype.gl_accounts_func = function (req, res, callback) {
    con.query("SELECT * FROM gl_accounts ", function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "gl_accounts": result
            })
        }
    });
}

module.exports = new gl_accounts()