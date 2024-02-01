const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_rm_meta_data = function () {}

code_rm_meta_data.prototype.code_rm_meta_data_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * from distribution_channel; SELECT * from mrp_controller; SELECT * from material_type; SELECT * from sales_organization; SELECT * from unit_of_measure`, function (uerr, uresult, fields) {
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

module.exports = new code_rm_meta_data()