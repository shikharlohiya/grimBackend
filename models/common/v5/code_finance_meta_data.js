const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_finance_meta_data = function () {}

code_finance_meta_data.prototype.code_finance_meta_data_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * from profit_center; SELECT * from valuation_class;`, function (uerr, uresult, fields) {
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

module.exports = new code_finance_meta_data()