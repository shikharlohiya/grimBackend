const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const serial_number_sync = function () { }


serial_number_sync.prototype.serial_number_sync_func = function (req, res, callback) {
    console.log('---------------', req.body.ET_STOCK);

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                req.body.ET_STOCK.forEach(function (material_stock, index) {

                    if (material_stock.MATNR != '' && material_stock.MATNR != undefined && material_stock.WERKS != '' && material_stock.WERKS != undefined && material_stock.LGORT != '' && material_stock.LGORT != undefined && material_stock.SERNR != '' && material_stock.SERNR != undefined) {

                        var insertQuery = `INSERT INTO serial_numbers (material_id, plant_id, store_id, serial_no, valution_type) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', '${material_stock.SERNR}', '${material_stock.BWTAR}')`;

                        con.query(`SELECT id FROM serial_numbers where material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and store_id = '${material_stock.LGORT}' and serial_no = '${material_stock.SERNR}' and valution_type = '${material_stock.BWTAR}'`, function (c_err, c_result) {
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
                                                        "message": "Serial Numbers are updated successfully"
                                                    })
                                                }, 100);
                                            })
                                        }
                                    }
                                });
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
                                                "message": "Serial Numbers are updated successfully"
                                            })
                                        }, 100);
                                    })
                                }

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

module.exports = new serial_number_sync()