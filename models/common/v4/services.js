const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const services = function () {}

services.prototype.services_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT a.* FROM Services as a  where a.status  = '1' ORDER BY a.id `, function (uerr, uresult, fields) {
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
                "services": uresult
            })
        }
    });
}

module.exports = new services()