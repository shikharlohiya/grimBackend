const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const unstock_materials = function () {}


unstock_materials.prototype.unstock_materials_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
                con.query(`SELECT (a.stock - IFNULL(sum(b.quantity), 0)) as 'real_stock', ABS((a.stock - IFNULL(sum(b.quantity), 0))) as 'stock', a.id, a.name, a.image_url, a.price, a.material_group_sap_id, a.material_type_sap_id  FROM material_items AS a INNER JOIN user_indents AS b ON b.product_id = a.id WHERE b.status IN (2)
                group by a.id HAVING real_stock <= 0`, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else if(result.length > 0){
                        result.forEach((item, index) => {
                            con.query(`SELECT (sum(quantity)) as quantity, (SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.id} and status in (2) group by user_id,status `, function (i_err, i_result, fields) {
                                if (i_err) {
                                    console.log(i_err);
                                    
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                            result[index].users = i_result;
                            con.query(`SELECT id, quantity,created_at, order_id, (SELECT description FROM order_status WHERE value = status ) as status, user_id, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name FROM user_indents WHERE product_id =${item.id} and status in (2) `, function (in_err, in_result, fields) {
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
                                    // if (index == result.length - 1) {
                                    //     res.status(200).json({
                                    //         "success": true,
                                    //         "data": result
                                    //     })

                                    // }
                                }
                            });
                        })
                        // res.status(200).json({
                        //     "success": true,
                        //     "data": result
                        // })
                    } else {
                        res.status(200).json({
                            "success": true,
                            "data": []
                        })
                    }
                });
    })
}

module.exports = new unstock_materials()