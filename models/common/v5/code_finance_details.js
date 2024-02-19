const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_finance_details = function () {}

code_finance_details.prototype.code_finance_details_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`UPDATE new_product_request set code_finance_detail = '1'  where id = ${req.body.code_id}`, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            con.query(`INSERT INTO code_finance_details (code_id, acct_assignment_grp, price_control, price_unit, profit_center, valuation_class,created_by) VALUES (${req.body.code_id}, '${req.body.product.acct_assignment_grp}', '${req.body.product.price_control}', '${req.body.product.price_unit}', '${req.body.product.profit_center}', '${req.body.product.valuation_class}', ${req.body.user_id});`, function (uerr, uresult, fields) {
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
                        "message": "Code details updated Succesfully",
                        "data": uresult
                    })
                }
            });
        }
    })
}

module.exports = new code_finance_details()