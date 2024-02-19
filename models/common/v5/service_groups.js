const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const service_groups = function () {}


service_groups.prototype.service_groups_func = function (req, res, callback) {
    con.query("SELECT * FROM service_groups ", function (err, result, fields) {
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
                "service_groups": result
            })
        }
    });
}

module.exports = new service_groups()