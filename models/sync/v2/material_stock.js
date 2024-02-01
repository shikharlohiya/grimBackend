
var rfc = require('node-rfc');
require('dotenv/config')
var abapSystem = {
    user: "IBGGRIM",
    passwd: "Abis@2021",
    ashost: "172.16.0.147",
    sysnr: "01",
    lang: "EN",
    client: "786"
};

var client = new rfc.Client(abapSystem);
var cron = require('node-cron');
const axios = require('axios');

cron.schedule('00 05 *   *   *', () => {
        console.log('----------------------------');

    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v2/sync/material_stock` )
//    axios.get(`http://10.0.0.206:3001/api/v2/sync/material_stock`)
        .then(function (response) {
            console.log(response.data, '-----------------------');
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


const mysql = require("../../db.js");
const g_var = require("../../global_var.js");
const mysqlPool = mysql.createPool(); // connects to Database
const material_stock = function () {};

const batchSize = 100; // Adjust the batch size as needed

material_stock.prototype.material_stock_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // Use TRUNCATE TABLE instead of DELETE
                con.query('TRUNCATE TABLE material_stock', function (del_err, del_result) {
                    if (del_err) {
                        console.log(del_err);
                        con.rollback(function () {
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": del_err
                            });
                        });
                    } else {
                        // Set transaction isolation level to READ UNCOMMITTED
                        con.query('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED', function (setErr) {
                            if (setErr) {
                                // Handle error
                                console.log(setErr);
                                con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": setErr
                                    });
                                });
                            } else {
                                client.connect(function (err) {
                                    if (err) {
                                        console.error('could not connect to server', err);
                                        res.status(400).json({
                                            status: 400,
                                            message: err
                                        });
                                        return;
                                    }

                                    // ZMMF_GRIM_MATERIAL_STOCK_OUT
                                    // ZMMF_GRIM_MATERIAL_STOCK_VAL
                                    // invoke remote enabled ABAP function module
                                    client.invoke('ZMMF_GRIM_MATERIAL_STOCK_VAL', {
                                        ET_STOCK: []
                                    }, function (err, response) {
                                        if (err) {
                                            console.log('Error invoking STFC_CONNECTION:', err);
                                            client.close();
                                            res.status(400).json({
                                                status: 400,
                                                message: err
                                            });
                                            return;
                                        }

                                        client.close();
                                        if (response.ET_STOCK.length > 0) {
                                            var stockValuesToInsert = response.ET_STOCK.map(function (material_stock) {
                                                return `('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', ${material_stock.CLABS || 0}, ${material_stock.VERPR || 0}, NOW(), '${material_stock.CHARG || 'NEW'}')`;
                                            });

                                            // Insert new records into material_stock table in batches
                                            for (let i = 0; i < stockValuesToInsert.length; i += batchSize) {
                                                const batch = stockValuesToInsert.slice(i, i + batchSize);
                                                const stockQuery = `INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price, updated_at, valution_type) VALUES ${batch.join(', ')};`;

                                                con.query(stockQuery, function (u_err) {
                                                    if (u_err) {
                                                        console.error(u_err);
                                                        con.rollback(function () {
                                                            con.release();
                                                            res.status(500).json({
                                                                "success": false,
                                                                "message": u_err
                                                            });
                                                        });
                                                    }
                                                });
                                            }

                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        con.release();
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": err
                                                        });
                                                    });
                                                }

                                                setTimeout(() => {
                                                    con.release();
                                                    res.status(200).json({
                                                        "success": true,
                                                        "message": "Material Stock updated successfully"
                                                    });
                                                }, 1000);
                                            });
                                        } else {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};



module.exports = new material_stock();





 