const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const batch_id_sync = function () {}


batch_id_sync.prototype.batch_id_sync_func = function (req, res, callback) {
    console.log('---------------', req.body.ET_STOCK);

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                req.body.ET_STOCK.forEach(function (material_stock, index) {

                    if (material_stock.MATNR != '' && material_stock.MATNR != undefined && material_stock.WERKS != '' && material_stock.WERKS != undefined && material_stock.LGORT != '' && material_stock.LGORT != undefined) {

                        if (material_stock.CLABS == undefined || material_stock.CLABS == "") {
                           var stock = 0
                        } else {
                            var stock = material_stock.CLABS;
                        }

                    var insertQuery = `INSERT INTO batch_ids (material_id, plant_id, store_id, batch_id, stock) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', '${material_stock.CHARG}', ${stock})`;


                    var updateQuery = `UPDATE batch_ids set stock = ${stock} WHERE material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and store_id = '${material_stock.LGORT}' and batch_id = '${material_stock.CHARG}'`;

                    con.query(`SELECT id FROM batch_ids where material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and store_id = '${material_stock.LGORT}' and batch_id = '${material_stock.CHARG}'`, function (c_err, c_result) {
                        if (c_err) {
                            console.log(c_err);
                            con.rollback(function () {
                                con.release();
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "error": c_err
                                })
                            });
                        } else if (c_result.length == 0) {
                            con.query(insertQuery, function (i_err, i_result) {
                                // console.log('----------------tset');

                                if (i_err) {
                                    console.log(i_err);
                                    con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "error": i_err
                                        })
                                    });
                                    // con.release();
                                } else {
                                    if (index == req.body.ET_STOCK.length - 1) {
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
                                                    "message": "Batch ids are updated successfully"
                                                })
                                            }, 100);
                                        })
                                    }
                                }
                            });
                        } else {
                            con.query(updateQuery, function (u_err, u_result) {
                                if (u_err) {
                                    console.log(u_err);
                                    con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "error": u_err
                                        })
                                    });
                                    // con.release();

                                } else {

                                    console.log('------update------');
                                    if (index == req.body.ET_STOCK.length - 1) {
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
                                                    "message": "Batch ids are updated successfully"
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

module.exports = new batch_id_sync()