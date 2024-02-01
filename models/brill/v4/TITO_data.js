require('dotenv/config')


var cron = require('node-cron');
const axios = require('axios');


const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const TITO_data = function () {}


TITO_data.prototype.TITO_data_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // invoke remote enabled ABAP function module
                var config = {
                    method: 'get',
                    url: `http://192.168.27.48:8088/RestAPI/TitoData/2022-04-25`, //Prod
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
                        console.log('Result STFC_CONNECTION:started', response.data.length);
                        if (response.data.length > 0) {
                            console.log('enter------------------------');
                                    con.query('INSERT INTO brill_TITO_data (SapNo, PlantCode, TruckNo, UnloadLocation, GateEntryDate,  GateEntryTime, GateExitDate, GateExitTime, TTAT, UnloadStartDate, UnloadStartTime, UnloadStopDate, UnloadStopTime, TotalUnloadingTime, FrstWt, ScndWt, TotalWt, Material, TruckTanker) VALUES ?',
                                        [response.data.map(TITO => [TITO.SapNo, TITO.PlantCode, TITO.TruckNo, TITO.UnloadLocation, TITO.GateEntryDate, TITO.GateEntryTime, TITO.GateExitDate, TITO.GateExitTime, TITO.TTAT, TITO.UnloadStartDate, TITO.UnloadStartTime, TITO.UnloadStopDate, TITO.UnloadStopTime, TITO.TotalUnloadingTime, TITO.FrstWt, TITO.ScndWt, TITO.TotalWt, TITO.Material, TITO.TruckTanker ])],
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
                                                            "message": "TITO data inserted successfully"
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

module.exports = new TITO_data()