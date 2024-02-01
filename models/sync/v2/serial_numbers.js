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

cron.schedule('0 6 *   *   *', () => {
    console.log('----------------------------');

    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v2/sync/serial_numbers`)
        .then(function (response) {
            // console.log(response.data, '----------------------');
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

const serial_numbers = function () { }


serial_numbers.prototype.serial_numbers_func = function (req, res, callback) {
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
                    client.invoke('ZMMF_GRIM_MATERIAL_STOCK_SER', {
                        ET_STOCK: '',
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
                                con.query('DELETE FROM serial_numbers', function (u_err, u_result) {
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

                                        con.query('INSERT INTO serial_numbers (material_id, plant_id, store_id, serial_no, valution_type) VALUES ?',
                                            [response.ET_STOCK.map(material_stock => [material_stock.MATNR, material_stock.WERKS, material_stock.LGORT, material_stock.SERNR, material_stock.BWTAR])], function (iu_err, iu_result) {
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
                                                        setTimeout(() => {
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Material Serial numbers updated successfully"
                                                            })
                                                        }, 1000);

                                                    });
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

module.exports = new serial_numbers()