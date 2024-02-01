require('dotenv/config')


var cron = require('node-cron');
const axios = require('axios');


const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const energy_power_data = function () {}


energy_power_data.prototype.energy_power_data_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // invoke remote enabled ABAP function module
                var config = {
                    method: 'get',
                    url: `http://192.168.27.48:8087/RestAPI/EnergyData/2022-04-25`, //Prod
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
                                    con.query('INSERT INTO brill_energy_power_data (AcDate, PlantCode, LocationCode, Section, Area,  InitialReading, FinalReading, EnergyConsumption, UoM) VALUES ?',
                                        [response.data.map(energy_power => [energy_power.AcDate, energy_power.PlantCode, energy_power.LocationCode, energy_power.Section, energy_power.Area, energy_power.InitialReading, energy_power.FinalReading, energy_power.EnergyConsumption, energy_power.UoM])],
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
                                                            "message": "energy_power data inserted successfully"
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

module.exports = new energy_power_data()