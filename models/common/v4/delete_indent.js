const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const delete_indent = function () {}


delete_indent.prototype.delete_indent_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`DELETE FROM order_status_logs where indent_id = ${req.body.item.id}`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            con.query(`DELETE  FROM user_indents where id = ${req.body.item.id}`, function (err, result, fields) {
                if (err) {
                    console.log(err);

                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": err
                    })
                } else {
                    con.query(`SELECT id FROM user_indents where order_id = ${req.body.order_id}`, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else if (result.length == 0) {
                            con.query(`DELETE FROM user_orders WHERE id = ${req.body.order_id}`, function (derr, dresult, fields) {
                                if (derr) {
                                    console.log(derr);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": derr
                                    })
                                } else {

                                    res.status(200).json({
                                        "success": true,
                                        "message": "Indent Deleted Successfully"
                                    })
                                }
                            });
                        } else {

                            con.query(`UPDATE user_orders set total = total-${req.body.item.total_price} WHERE id = ${req.body.order_id}`, function (derr, dresult, fields) {
                                if (derr) {
                                    console.log(derr);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": derr
                                    })
                                } else {

                                    res.status(200).json({
                                        "success": true,
                                        "message": "Indent Deleted Successfully"
                                    })
                                }
                            });
                        }
                    });

                }
            });
        }
    })
}

module.exports = new delete_indent()