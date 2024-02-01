var rfc = require('node-rfc');
require('dotenv/config')


// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };

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



 
// cron.schedule('* * 02 * * *', () => {
// 	console.log('----------------------------');
	
//   // Make a request for a user with a given ID
//   axios.get('https://grim.co.in:3002/api/v2/sync/material_group')
//   .then(function (response) {
//     // handle success
//     console.log(response.data,'----------------------');
//     // res.status(200).json({
//     //     status: 200,
//     //     result: response.data
//     // });
//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//     // res.status(500).json({
//     //     status: 500,
//     //     message: error
//     // });
//   })
// });

const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_group = function () {}


material_group.prototype.material_group_func = function (req, res, callback) {
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
            client.invoke('ZMMF_GRIM_MATERIAL_MASTER_OUT', {
                ET_MATERIAL: '',
            }, function (err, response) {
                if (err) { // check for errors (e.g. wrong parameters)
                    console.log('Error invoking STFC_CONNECTION:', err);
                    client.close();
                    res.status(400).json({
                        status: 400,
                        message: err
                    });

                } else {
                    console.log('Result STFC_CONNECTION:started', response);
                    client.close();
                    response.ET_MAT_GROUP.forEach(function (material_group, index) {
                        console.log(material_group.MATKL, index);
                            var insertQuery = `INSERT INTO material_group_sync (material_group_sap_id, material_group_sap_description, updated_at) VALUES ('${material_group.MATKL}', '${material_group.WGBEZ}', now() )`;


                            var updateQuery = `UPDATE material_group_sync set material_group_sap_description = '${material_group.WGBEZ}',   updated_at = now() WHERE material_group_sap_id = '${material_group.MATKL}'`;

                            con.query(`SELECT * FROM material_group_sync where material_group_sap_id = '${material_group.MATKL}'`, function (c_err, c_result) {
                                if (c_err) {
                                    console.log(c_err);
                                    con.release();
                                    res.status(500).json({
                                        "sucess": false,
                                        "message": "Error with endpoint"
                                    })
                                } else if (c_result.length == 0) {

                                    con.query(insertQuery, function (i_err, i_result) {
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
                                            if (index == response.ET_MAT_GROUP.length - 1) {
                                                setTimeout(() => {
                                                    con.release();
                                                    res.status(200).json({
                                                        "sucess": true,
                                                        "message": "Material_groups updated successfully"
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
                                            if (index == response.ET_MAT_GROUP.length - 1) {
                                                setTimeout(() => {
                                                    con.release();
                                                    res.status(200).json({
                                                        "sucess": true,
                                                        "message": "Material_groups updated successfully"
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

module.exports = new material_group()