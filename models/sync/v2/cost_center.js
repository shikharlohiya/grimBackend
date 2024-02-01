var rfc = require('node-rfc');
require('dotenv/config')

var cron = require('node-cron');
const axios = require('axios');

// cron.schedule('0 30 5 *   *   *', () => {
    cron.schedule('22 15 *   *   *', () => {
    console.log('----------------------------');

    // Make a request for a user with a given ID
    // axios.get(`${process.env.host}/api/v2/sync/cost_centers`)
    axios.get(`http://10.0.0.206:3001/api/v2/sync/cost_centers`)
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

// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };
// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };
var abapSystem = {
    user: "IBGGRIM",
    passwd: "Abis@2021",
    ashost: "172.16.0.147",
    sysnr: "01",
    lang: "EN",
    client: "786"
};


var client = new rfc.Client(abapSystem);


const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const cost_center = function () { }


cost_center.prototype.cost_center_func = function (req, res, callback) {
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
            client.invoke('ZMMF_GRIM_WBS_MASTER_OUT', {
                ET_WBS: [], ET_CSKT: []
            }, function (err, response) {
                if (err) { // check for errors (e.g. wrong parameters)
                    console.log('Error invoking STFC_CONNECTION:', err);
                    client.close();
                    // res.status(400).json({
                    //     status: 400,
                    //     message: err
                    // });
                } else {
                    console.log('Result STFC_CONNECTION:', response);
                    client.close();
                    if (response.ET_CSKT.length > 0) {
                        con.query('DELETE FROM cost_centers', function (u_err, u_result) {
                            if (u_err) {
                                console.log(u_err);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": u_err
                                    })

                            } else {
                                response.ET_CSKT.forEach(function (center, index) {
                                    // var asset_desc = asset.TXT50.replace(/'/g, '"');
                                    var plant = center.KOSTL.substr(center.KOSTL.length - 4);

                                    var insertQuery = `INSERT INTO cost_centers (controlling_area, cost_center, valid_to, description, plant) VALUES ('${center.KOKRS}', '${center.KOSTL}', '${center.DATBI}', '${center.LTEXT}', '${plant}')`;

                                    con.query(insertQuery, function (i_err, i_result) {
                                        if (i_err) {
                                            console.log(i_err);
                                            res.status(500).json({
                                                "sucess": false,
                                                "message": "Error with endpoint"
                                            })
                                        } else {
                                            console.log('------insert------');
                                            if (index == response.ET_CSKT.length - 1) {
                                                console.log('done');
                                                setTimeout(() => {
                                                    con.release();
                                                    res.status(200).json({
                                                        "sucess": true,
                                                        "message": "Cost centers inserted successfully"
                                                    })
                                                }, 100);
                                            }
                                        }
                                    });
                                })
                            }
                        })
                    } else {
                        res.status(500).json({
                            "sucess": false,
                            "message": "Error with endpoint"
                        })
                    }


                }
            });
        });
    })
}

module.exports = new cost_center()