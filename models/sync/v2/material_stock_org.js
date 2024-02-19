
const debug = require('debug')('node-rfc');
// Set the debug logger to a no-op function to suppress log messages
debug.log = function () {};
var rfc = require('node-rfc');



require('dotenv/config')
var abapSystem = {
    user: process.env.user,
    passwd: process.env.passwd,
    ashost: process.env.ashost,
    sysnr: process.env.sysnr,
    lang: process.env.lang,
    client: process.env.client
};
var client = new rfc.Client(abapSystem);
var cron = require('node-cron');
const axios = require('axios');

cron.schedule('15 05 *   *   *', () => {
    console.log('----------------------------');

    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v2/sync/material_stock_org`)
    // axios.get(`http://10.0.0.206:3001/api/v2/sync/material_stock_org`)
        .then(function (response) {
            console.log(response.data, '----------------------');
            // res.status(200).json({
            //     status: 200,
            //     result: response.data
            // });
        })
        .catch(function (error) {
            console.log(error);
            // res.status(500).json({
            //     status: 500,
            //     message: error
            // });
        })
});


const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_stock_org = function () { }

material_stock_org.prototype.material_stock_org_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                client.connect(function (err) { // and connect
                    if (err) { // check for login/connection errors
                        console.error('could not connect to server', err);
                        res.status(400).json({
                            status: 400,
                            message: err
                        });

                    }

                    // invoke remote enabled ABAP function module
                    client.invoke('ZMMF_GRIM_MATERIAL_STOCK_OUT', {
                        ET_STOCK: [],
                    }, function (err, response) {
                        if (err) { // check for errors (e.g. wrong parameters)
                            console.log('Error invoking STFC_CONNECTION:', err);
                            client.close();
                            res.status(400).json({
                                status: 400,
                                message: err
                            });

                        } else {
                            console.log('Result STFC_CONNECTION:started', response.ET_STOCK.length);
                            client.close();
                            if (response.ET_STOCK.length > 0) {
                                con.query(`DELETE FROM material_stock where valution_type = '0'`, function (u_err, u_result) {
                                    if (u_err) {
                                        console.log(u_err);
                                        con.rollback(function () {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": u_err
                                            })
                                        });

                                    } else {
                                        console.log('enter------------------------');

                                        response.ET_STOCK.forEach(function (material_stock, index) {
                                            if (material_stock.LBKUM == undefined || material_stock.LBKUM == "") {
                                                material_stock.LBKUM = 0
                                            }

                                            if (material_stock.VERPR == undefined || material_stock.VERPR == "") {
                                                material_stock.VERPR = 0
                                            }
                                            if (index == response.ET_STOCK.length - 1) {
                                                con.query('INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price) VALUES ?',
                                                    [response.ET_STOCK.map(material_stock => [material_stock.MATNR, material_stock.WERKS, material_stock.LGORT, material_stock.LBKUM, material_stock.VERPR])], function (iu_err, iu_result) {
                                                        if (iu_err) {
                                                            console.log('error------------------------');
                                                            con.rollback(function () {
                                                                con.release();
                                                                res.status(500).json({
                                                                    "success": false,
                                                                    "message": iu_err
                                                                })
                                                            });

                                                        } else {
                                                            console.log('-------commiting');

                                                            con.commit(function (err) {
                                                                if (err) {
                                                                    con.rollback(function () {
                                                                        con.release();
                                                                        res.status(500).json({
                                                                            "success": false,
                                                                            "message": err
                                                                        })
                                                                    });
                                                                }

                                                                con.release();
                                                                
                                                                    return res.status(200).json({
                                                                        "sucess": true,
                                                                        "message": "Material Stock updated successfully"
                                                                    })
                                                               

                                                            });
                                                        }
                                                    })
                                            }
                                        })
                                    }

                                })


                            } else {
                                con.release();
                                res.status(500).json({
                                    "sucess": false,
                                    "message": "Error with endpoint"
                                })
                            }
                        }

                    });
                });
            }
        })
    })
}







module.exports = new material_stock_org();
