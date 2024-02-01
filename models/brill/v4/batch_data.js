require('dotenv/config')


var cron = require('node-cron');
const axios = require('axios');


const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const batch_data = function () {}


batch_data.prototype.batch_data_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // invoke remote enabled ABAP function module
                var config = {
                    method: 'get',
                    url: `http://192.168.25.94:8085/RestAPI/BatchData/2022-04-25`, //Prod
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                axios(config).then(function (response) {
                    if (err) { // check for errors (e.g. wrong parameters)
                        res.status(400).json({
                            status: 400,
                            message: err
                        });

                    } else {
                        console.log('Result STFC_CONNECTION:started', response);
                        if (response.data.length > 0) {
                            console.log('enter------------------------');
                                    con.query('INSERT INTO brill_batching (AcDate, PlantCode, LocationCode, BatchNo, RecipeCode,  BatchStartDate, BatchStartTime, BatchStopDate, BatchStopTime, ProcessTime, RecipeName, MaterialName, TargetQty, ActualQty, Deviation, UoM ) VALUES ?',
                                        [response.data.map(batch => [batch.AcDate, batch.PlantCode, batch.LocationCode, batch.BatchNo, batch.RecipeCode, batch.BatchStartDate, batch.BatchStartTime, batch.BatchStopDate, batch.BatchStopTime, batch.ProcessTime, batch.RecipeName, batch.MaterialName, batch.TargetQty, batch.ActualQty, batch.Deviation, batch.UoM])],
                                        function (iu_err, iu_result) {
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
                                                            "message": "Batch data inserted successfully"
                                                        })
                                                    }, 100);

                                                });
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
            }
        })
    })
}

module.exports = new batch_data()