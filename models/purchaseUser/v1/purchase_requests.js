const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const purchase_requests = function () {}


purchase_requests.prototype.purchase_requests_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        console.log(req.body);
        con.query(`SELECT a.id, a.product_id, a.quantity, a.created_at, b.name, b.image_url, b.price, b.material_group_sap_id, b.material_type_sap_id, (SELECT description FROM order_status WHERE value = a.status ) as statuss, a.status FROM purchase_requests as a LEFT JOIN material_items as b
        ON a.product_id = b.id WHERE a.status = 7`, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((item, index) => {
                    con.query(`SELECT (sum(quantity)) as quantity, (SELECT description FROM order_status WHERE value = status ) as status, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status in (7) group by user_id,status `, function (i_err, i_result, fields) {
                        if (i_err) {
                            console.log(i_err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            console.log(i_result,'---------------');
                            
                            result[index].users = i_result;
                            con.query(`SELECT id, quantity,created_at, order_id, (SELECT description FROM order_status WHERE value = status ) as status, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.product_id} and status in (7) `, function (in_err, in_result, fields) {
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

module.exports = new purchase_requests()