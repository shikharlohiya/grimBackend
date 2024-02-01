const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const delete_indent = function () {}


delete_indent.prototype.delete_indent_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`DELETE  FROM user_indents where id = ${req.body.item.id}`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                con.query(`SELECT id FROM user_indents where order_id = ${req.body.order_id}`, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        con.release();

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else if (result.length == 0) {
                        con.query(`DELETE FROM user_orders WHERE id = ${req.body.order_id}`, function (derr, dresult, fields) {
                            if (derr) {
                                console.log(derr);
                                con.release();

                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                con.release();

                                res.status(200).json({
                                    "success": true,
                                    "message": "Indent Deleted Successfully"
                                })
                            }
                        });
                    } else {

                        con.query(`UPDATE user_orders set total = total-${req.body.item.total_price} WHERE id = ${req.body.order_id}`, function (derr, dresult, fields) {
                            if (derr) {
                                con.release();

                                console.log(derr);
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                con.release();

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

    })
}

module.exports = new delete_indent()