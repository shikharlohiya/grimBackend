const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const purchase_requests = function () {}


purchase_requests.prototype.get_purchase_requests_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        console.log(req.body);
        con.query(`SELECT a.id, a.product_id, a.quantity, a.created_at, b.name, b.image_url, b.price, b.material_group_sap_id, b.material_type_sap_id, (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT color FROM order_status WHERE value = a.status ) as color, a.status FROM purchase_requests as a LEFT JOIN material_items as b
        ON a.product_id = b.id`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((item, index) => {
                    con.query(`SELECT (sum(quantity)) as quantity, (SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status =${item.status} group by user_id,status `, function (i_err, i_result, fields) {
                        if (i_err) {
                            console.log(i_err);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            console.log(i_result, '---------------');

                            result[index].users = i_result;
                            con.query(`SELECT id, quantity,created_at, order_id, (SELECT description FROM order_status WHERE value = status ) as status, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status =${item.status} `, function (in_err, in_result, fields) {
                                if (in_err) {
                                    console.log(in_err);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                                    result[index].indents = in_result;

                                    if (index == result.length - 1) {
                                        con.release();
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
                con.release();
                res.status(200).json({
                    "success": true,
                    "data": []
                })
            }
        });
    })
}


purchase_requests.prototype.get_purchase_requests_latest_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        console.log(req.query);
        con.query(`SELECT a.id, a.wbs, a.product_id, a.quantity, a.pr_quantity, a.created_at, b.name, b.material_sap_id, b.image_url, b.price, b.material_group_sap_id, b.material_type_sap_id, (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, (SELECT color FROM order_status WHERE value = a.status ) as color, a.status FROM purchase_requests as a LEFT JOIN material_items as b
        ON a.product_id = b.id WHERE a.created_by = ${req.query.user_id} ORDER BY a.created_at DESC`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((item, index) => {
                    con.query(`SELECT   a.indent_id, a.pr_qty, a.created_by, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as created_at FROM PR_items as a WHERE purchase_request_id = ${item.id}`, function (i_err, i_result, fields) {
                        if (i_err) {
                            console.log(i_err);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {

                            result[index].indents = i_result;

                            if (index == result.length - 1) {

                                var wbsArray = [];

                                            result.forEach((o, i) => {
                                                wbsArray.push(o.wbs);
                                            });
                                            var wbs = [...new Set(wbsArray)]
                                            con.release();
                                res.status(200).json({
                                    "success": true,
                                    "data": {
                                        "result": result,
                                        "wbs": wbs
                                    }
                                })

                            }
                        }
                    });
                })
            } else {
                con.release();
                res.status(200).json({
                    "success": true,
                    "data": {
                        "result": [],
                        "wbs": []
                    }
                })
            }
        });
    })
}

module.exports = new purchase_requests()