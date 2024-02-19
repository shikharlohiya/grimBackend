const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const cost_centers = function () {}

cost_centers.prototype.cost_centers_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * from cost_centers`, function (uerr, uresult, fields) {
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
                "cost_centers": uresult
            })
        }
    });
}

module.exports = new cost_centers()