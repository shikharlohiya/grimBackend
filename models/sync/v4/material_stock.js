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

cron.schedule('0 7 *   *   *', () => {
    console.log('----------------------------');
  
    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v2/sync/material_stock`)
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

const material_stock = function () {}


material_stock.prototype.material_stock_func = function (req, res, callback) {
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
                    client.invoke('ZGRIM_MATERIAL_STOCK', {
                        T_STOCK: '',
                    }, function (err, response) {
                        if (err) { // check for errors (e.g. wrong parameters)
                            console.log('Error invoking STFC_CONNECTION:', err);
                            client.close();
                            res.status(400).json({
                                status: 400,
                                message: err
                            });

                        } else {
                            // console.log('Result STFC_CONNECTION:started', response.T_STOCK.length);
                            client.close();
                            if (response.T_STOCK.length > 0) {

                                var stockQuery = '';
                                response.T_STOCK.forEach(function (material_stock, index) {
                                    // console.log(material_stock.MATNR, index);
                                    var insertQuery = `INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price, updated_at) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', ${material_stock.LBKUM }, ${material_stock.VERPR}, now() );`;


                                    var updateQuery = `UPDATE material_stock set quantity = ${material_stock.LBKUM }, price =  ${material_stock.VERPR},  updated_at = now() WHERE material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}';`;
                                    // console.log(updateQuery, '-----------');

                                    var insertHistoryQuerysap = `INSERT INTO material_stock_history (material_id, plant_id, storage_loc, quantity, price) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', ${material_stock.LBKUM }, ${material_stock.VERPR});`

                                    var insertHistoryQuerygrim = ''


                                    con.query(`SELECT id, quantity, price FROM material_stock where material_id = '${material_stock.MATNR}' and plant_id = '${material_stock.WERKS}' and storage_loc = '${material_stock.LGORT}'`, function (c_err, c_result) {
                                        // console.log(c_result);

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
                                            // console.log('--------insert---------');
                                            
                                            stockQuery += insertQuery;
                                            // stockQuery += insertHistoryQuerysap;
                                        } else {
                                            // console.log('--------update---------');

                                            insertHistoryQuerygrim = `INSERT INTO material_stock_history (material_id, plant_id, storage_loc, quantity, price, resource) VALUES ('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', ${c_result[0].quantity}, ${c_result[0].price}, 'grim');`
                                            stockQuery += updateQuery;
                                            // stockQuery += insertHistoryQuerysap;
                                            // stockQuery += insertHistoryQuerygrim;
                                        }


                                        if (index == response.T_STOCK.length - 1) {
                                            console.log('----------------done');
                                            
                                            con.query(stockQuery, function (u_err, u_result) {
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
                                                                "message": "Material Stock updated successfully"
                                                            })
                                                        }, 1000);

                                                    });

                                                }
                                            });
                                        }

                                    });
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

module.exports = new material_stock()