const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const service_nos = function () {}


service_nos.prototype.service_nos_func = function (req, res, callback) {
    con.query("SELECT * FROM service_nos ", function (err, result, fields) {
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
                "service_nos": result
            })
        }
    });
}

module.exports = new service_nos()