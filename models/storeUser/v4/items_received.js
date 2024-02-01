const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const items_received = function () {}


items_received.prototype.items_received_func = function (req, res, callback) {
    // console.log(req.body.requests);
    req.body.requests.forEach((request, index) => {

        con.query(`UPDATE user_indents set status = 10, updated_at = now() WHERE product_id = ${request.product_id} AND status = 9`, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": err
                })
            } else {
                con.query(`UPDATE purchase_requests set status = 10, updated_by = ${req.body.user_id}, updated_at = now() WHERE id = ${request.id} `, function (os_err, i_result) {
                    if (os_err) {
                        console.log(os_err);
                    } else {
                        // console.log(i_result);
                        request.indents.forEach((indent, i) => {
                            con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, created_by, created_at) VALUES (${indent.id}, ${indent.order_id},10, ${req.body.user_id} , now())`, function (os_err, i_result) {
                                if (os_err) {
                                    console.log(os_err);
                                } else {
                                    // console.log(i_result);
                                }
                            });
                        });

                        con.query(`UPDATE material_items set stock = stock + ${request.quantity}  WHERE id = ${request.product_id} `, function (su_err, su_result) {
                            if (su_err) {
                                console.log(su_err);

                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "err": su_err
                                })
                            } else {
                                // console.log(su_result);
                                if (index == req.body.requests.length - 1) {
                                    setTimeout(function () {

                                        res.status(200).json({
                                            "success": true,
                                            "message": "Items Received and Stock Updated"
                                        })
                                    }, 500);
                                }
                            }
                        });
                    }
                });



            }
        });
    });
}

module.exports = new items_received()