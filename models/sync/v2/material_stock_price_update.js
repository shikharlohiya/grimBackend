const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_stock_price_update = function () { }


material_stock_price_update.prototype.material_stock_price_update_func = function (req, res, callback) {
    console.log('---------------', req.body.T_STOCK);

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                req.body.T_STOCK.forEach(function (material_stock, index) {

                    if (material_stock.MATNR != '' && material_stock.MATNR != undefined && material_stock.WERKS != '' && material_stock.WERKS != undefined && material_stock.LGORT != '' && material_stock.LGORT != undefined) {

                        if (material_stock.LBKUM == undefined || material_stock.LBKUM == "") {
                            material_stock.LBKUM = 0
                        }

                        if (material_stock.VERPR == undefined || material_stock.VERPR == "") {
                            material_stock.VERPR = 0
                        }

                        var valution_type = '0'
                        if (material_stock.BWTAR == undefined || material_stock.BWTAR == "") {
                            con.query(`SELECT valution_flag FROM material_items where material_sap_id = '${material_stock.MATNR}'`, function (v_err, v_result) {
                                if (v_err) {
                                    console.log(v_err);
                                } else {
                                    if (v_result.length > 0) {
                                        if (v_result[0].valution_type != "") {
                                            valution_type = 'NEW'
                                        }
                                    }
                                }
                            })

                        } else {
                            valution_type = material_stock.BWTAR
                        }

                        var insertQuery = `INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price, updated_at, valution_type) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', '${material_stock.LBKUM}', '${material_stock.VERPR}', now(), '${valution_type}' )`;


                        var updateQuery = `UPDATE material_stock set quantity = '${material_stock.LBKUM}', price =  '${material_stock.VERPR}',  updated_at = now() WHERE material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}' and valution_type = '${valution_type}'`;

                        var insertHistoryQuery = `INSERT INTO material_stock_history (material_id, plant_id, storage_loc, quantity, price) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', '${material_stock.LBKUM}', '${material_stock.VERPR}')`

                        con.query(`SELECT id FROM material_stock where material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}' and valution_type = '${valution_type}'`, function (c_err, c_result) {
                            if (c_err) {
                                console.log(c_err);
                                con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                });
                            } else if (c_result.length == 0) {
                                if (req.body.T_STOCK[0].BWTAR != undefined && material_stock.BWTAR == undefined) {
                                    console.log('---');
                                    if (index == req.body.T_STOCK.length - 1) {
                                        con.commit(function (err) {
                                            if (err) {
                                                con.rollback(function () {
                                                    con.release();
                                                    throw err;

                                                });
                                            }
                                            con.release();
                                            setTimeout(() => {

                                                res.status(200).json({
                                                    "sucess": true,
                                                    "message": "Material_stock_price updated successfully"
                                                })
                                            }, 100);
                                        })
                                    }
                                } else {
                                con.query(insertQuery, function (i_err, i_result) {
                                    // console.log('----------------tset');

                                    if (i_err) {
                                        console.log(i_err);
                                        con.rollback(function () {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                            })
                                        });
                                        // con.release();
                                    } else {
                                        // con.release();

                                        console.log('------insert------');
                                        // con.query(insertHistoryQuery, function (unerr, unresult) {
                                        //     if (unerr) {
                                        //       console.log(unerr);
                                        //     } else {
                                        //       console.log("unlogs:----------", unresult);

                                        //     }
                                        //   });
                                        if (index == req.body.T_STOCK.length - 1) {
                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        con.release();
                                                        throw err;

                                                    });
                                                }
                                                con.release();
                                                setTimeout(() => {

                                                    res.status(200).json({
                                                        "sucess": true,
                                                        "message": "Material_stock_price updated successfully"
                                                    })
                                                }, 100);
                                            })
                                        }
                                    }
                                });
                            }
                            } else {
                                con.query(updateQuery, function (u_err, u_result) {
                                    if (u_err) {
                                        console.log(u_err);
                                        con.rollback(function () {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                            })
                                        });
                                        // con.release();

                                    } else {
                                        // con.query(insertHistoryQuery, function (unerr, unresult) {
                                        //     if (unerr) {
                                        //       console.log(unerr);
                                        //     } else {
                                        //       console.log("unlogs:----------", unresult);

                                        //     }
                                        //   });

                                        console.log('------update------');
                                        if (index == req.body.T_STOCK.length - 1) {
                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        con.release();
                                                        throw err;
                                                    });
                                                }

                                                con.release();
                                                setTimeout(() => {
                                                    res.status(200).json({
                                                        "sucess": true,
                                                        "message": "Material_stock_price updated successfully"
                                                    })
                                                }, 100);
                                            })
                                        }

                                    }
                                });

                            }
                        })


                    } else {
                        con.rollback(function () {
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        });
                    }
                })
            }
        })
    })
}

module.exports = new material_stock_price_update()