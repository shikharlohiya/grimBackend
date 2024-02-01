var rfc = require('node-rfc');

var abapSystem = {
    user: 'DOCUMENT',
    passwd: '456789',
    ashost: '172.16.0.126',
    sysnr: '00',
    lang: 'EN',
    client: '786'
};
var client = new rfc.Client(abapSystem);
var cron = require('node-cron');
const axios = require('axios');




const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_stock = function () {}


material_stock.prototype.material_stock_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        client.connect(function (err) { // and connect
            if (err) { // check for login/connection errors
                console.error('could not connect to server', err);
                res.status(400).json({
                    status: 400,
                    message: err
                });

            }

            // invoke remote enabled ABAP function module
            client.invoke('ZGRIM_MATERIAL_STOCK', {
                T_STOCK: '',
            }, function (err, response) {
                if (err) { // check for errors (e.g. wrong parameters)
                    console.log('Error invoking STFC_CONNECTION:', err);
                    res.status(400).json({
                        status: 400,
                        message: err
                    });

                } else {
                    console.log('Result STFC_CONNECTION:started', response);

                    response.T_STOCK.forEach(function (material_stock, index) {
                        console.log(material_stock.MATNR, index);
                        var insertQuery = `INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price, updated_at) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', '${material_stock.LBKUM }', '${material_stock.VERPR}', now() )`;


                        var updateQuery = `UPDATE material_stock set quantity = '${material_stock.LBKUM }', price =  '${material_stock.VERPR}',  updated_at = now() WHERE material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}'`;
                        console.log(updateQuery, '-----------');


                        con.query(`SELECT id FROM material_stock where material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}'`, function (c_err, c_result) {
                            console.log(c_result);
                            
                            if (c_err) {
                                console.log(c_err);
                                res.status(500).json({
                                    "sucess": false,
                                    "message": "Error with endpoint"
                                })
                            } else if (c_result.length == 0) {
                                console.log(c_result.length);

                                con.query(insertQuery, function (i_err, i_result) {
                                    console.log('----------------tset');

                                    if (i_err) {
                                        console.log(i_err);
                                        // res.status(500).json({
                                        //   "sucess": false,
                                        //   "message": "Error with endpoint"
                                        // })
                                        // con.release();
                                    } else {
                                        // con.release();

                                        console.log('------insert------');
                                        if (index == response.T_STOCK.length - 1) {
                                            setTimeout(() => {
                                                res.status(200).json({
                                                    "sucess": true,
                                                    "message": "Material_stock updated successfully"
                                                })
                                            }, 1000);
                                        }
                                    }
                                });
                            } else {
                                con.query(updateQuery, function (u_err, u_result) {
                                    if (u_err) {
                                        console.log(u_err);
                                        // res.status(500).json({
                                        //   "sucess": false,
                                        //   "message": "Error with endpoint"
                                        // })
                                        // con.release();

                                    } else {
                                        // con.release();

                                        console.log('------update------');
                                        if (index == response.T_STOCK.length - 1) {
                                            setTimeout(() => {
                                                res.status(200).json({
                                                    "sucess": true,
                                                    "message": "Material_stock updated successfully"
                                                })
                                            }, 1000);
                                        }

                                    }
                                });

                            }
                        });
                    })
                }
            });
        });
    })
}

module.exports = new material_stock()