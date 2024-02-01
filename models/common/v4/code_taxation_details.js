const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_taxation_details = function () {}

code_taxation_details.prototype.code_taxation_details_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`UPDATE new_product_request set code_taxation_detail = '1'  where id = ${req.body.code_id}`, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            con.query(`INSERT INTO code_taxation_details (code_id, control_code, GST, TCS,created_by) VALUES (${req.body.code_id}, '${req.body.product.control_code}', '${req.body.product.GST}', '${req.body.product.TCS}', ${req.body.user_id});`, function (uerr, uresult, fields) {
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

module.exports = new code_taxation_details()