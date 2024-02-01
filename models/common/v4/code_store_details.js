const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const code_store_details = function () {}

code_store_details.prototype.code_store_details_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`UPDATE new_product_request set code_store_detail = '1'  where id = ${req.body.code_id}`, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            con.query(`INSERT INTO code_store_details (code_id, distribution_channel, sales_organization, fixed_lot_size, gross_weight, net_weight, weight_unit, material_type, mrp_controller, serial_no_profile, re_order_point,created_by) VALUES (${req.body.code_id}, '${req.body.product.distribution_channel}', '${req.body.product.sales_organization}', '${req.body.product.fixed_lot_size}', '${req.body.product.gross_weight}', '${req.body.product.net_weight}', '${req.body.product.weight_unit}', '${req.body.product.material_type.id}', '${req.body.product.mrp_controller}', '${req.body.product.serial_no_profile}', '${req.body.product.re_order_point}', ${req.body.user_id});`, function (uerr, uresult, fields) {
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

module.exports = new code_store_details()