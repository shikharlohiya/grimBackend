const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
var request = require('request');
require('dotenv/config')

const save_for_later = function () {}


save_for_later.prototype.save_for_later_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');

        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);


                req.body.items.forEach((item, index) => {
                    con.query(`SELECT id FROM save_for_later_items where product_id = '${item.id}' and user_id = ${req.body.user_id} and status = '1' and plant_id = '${req.body.plant.plant_id}' and store_id = '${req.body.plant.storage_loc}'`, function (c_err, c_result) {
                        if (c_err) {
                            console.log(c_err);
                            con.release();
                            res.status(500).json({
                                "sucess": false,
                                "message": "Error with endpoint"
                            })
                        } else if (c_result.length == 0) {

                            con.query(`INSERT INTO save_for_later_items ( product_id, user_id, quantity, price, plant_id, store_id) VALUES (${item.id}, ${req.body.user_id}, ${item.quantity},${item.price}, '${req.body.plant.plant_id}', '${req.body.plant.storage_loc}')`, function (i_err, i_result) {
                                if (i_err) {
                                    console.log(i_err);

                                    con.rollback(function () {

                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else {
                                    if (index == req.body.items.length - 1) {
                                        con.commit(function (err) {
                                            if (err) {
                                                con.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                            con.release();
                                            res.status(200).json({
                                                "success": true,
                                                "message": "Material(s) has been moved to Save For Later"
                                            })
                                        })
                                    }
                                }
                            });
                        } else {

                            con.query(`UPDATE save_for_later_items set quantity = quantity + ${item.quantity}WHERE  id = ${c_result[0].id}`, function (i_err, i_result) {
                                if (i_err) {
                                    console.log(i_err);

                                    con.rollback(function () {

                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    });
                                } else {
                                    if (index == req.body.items.length - 1) {
                                        con.commit(function (err) {
                                            if (err) {
                                                con.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                            con.release();
                                            res.status(200).json({
                                                "success": true,
                                                "message": "Material(s) has been moved to Save For Later"
                                            })
                                        })
                                    }

                                }
                            });
                        }

                    });
                })
            }
        })
    })
}


save_for_later.prototype.save_for_later_getfunc = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');

        
        con.query(`SELECT * FROM save_for_later_items where user_id  = ${req.query.user_id} and status = '1' and plant_id = '${req.query.plant_id}' and store_id = '${req.query.storage_loc}' ORDER BY id `, function (uerr, uresult, fields) {
            if (uerr) {
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(uresult);
                con.release();
                res.status(200).json({
                    "success": true,
                    "data": uresult
                })
            }
        });
    })
}
module.exports = new save_for_later()