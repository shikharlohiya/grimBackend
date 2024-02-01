const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const items_issued = function () {}


items_issued.prototype.items_issued_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body.requests);
        req.body.requests.forEach((request, index) => {

            con.query(`UPDATE user_indents set status = 9,updated_at = now() WHERE product_id = ${request.product_id} AND status = 8`, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint"
                    })
                } else {
                    con.query(`UPDATE purchase_requests set status = 9, updated_by = ${req.body.user_id},item_issued_at = now(), updated_at = now() WHERE id = ${request.id} `, function (os_err, i_result) {
                        if (os_err) {
                            console.log(os_err);
                        } else {
                            console.log(i_result);
                        }
                    });
                    request.indents.forEach((indent, i) => {
                        con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, created_by, created_at) VALUES (${indent.id}, ${indent.order_id},9, ${req.body.user_id} , now())`, function (os_err, i_result) {
                            if (os_err) {
                                console.log(os_err);
                            } else {
                                console.log(i_result);
                            }
                        });
                    });

                    if (index == req.body.requests.length - 1) {
                        setTimeout(function () {
                            res.status(200).json({
                                "success": true,
                                "message": "Items Issued Successfully"
                            })
                        }, 500);
                    }
                }
            });
        });
    })
}


items_issued.prototype.get_items_issued_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        console.log(req.body);
        con.query(`SELECT a.id, a.product_id, a.quantity, a.created_at, b.name, b.image_url, b.price, b.material_group_sap_id, b.material_type_sap_id, a.PO_number, a.PO_created_at, a.item_issued_at FROM purchase_requests as a LEFT JOIN material_items as b
        ON a.product_id = b.id WHERE a.status = 9`, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((item, index) => {
                    con.query(`SELECT (sum(quantity)) as quantity, (SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status in (9) group by user_id,status `, function (i_err, i_result, fields) {
                        if (i_err) {
                            console.log(i_err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            console.log(i_result, '---------------');

                            result[index].users = i_result;
                            con.query(`SELECT id, quantity,created_at, order_id, (SELECT description FROM order_status WHERE value = status ) as status, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status in (9) `, function (in_err, in_result, fields) {
                                if (in_err) {
                                    console.log(in_err);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                                    result[index].indents = in_result;

                                    if (index == result.length - 1) {
                                        res.status(200).json({
                                            "success": true,
                                            "data": result
                                        })

                                    }
                                }
                            });
                        }
                    });
                })
            } else {
                res.status(200).json({
                    "success": true,
                    "data": []
                })
            }
        });
    })
}

module.exports = new items_issued()