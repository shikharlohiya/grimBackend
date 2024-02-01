const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const unit_of_measure = function () {}

unit_of_measure.prototype.unit_of_measure_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * FROM unit_of_measure  ORDER BY id `, function (uerr, uresult, fields) {
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
                "unit_of_measure": uresult
            })
        }
    });
}

module.exports = new unit_of_measure()