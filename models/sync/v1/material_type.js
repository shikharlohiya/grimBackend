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



 
// cron.schedule('* * 02 * * *', () => {
// 	console.log('----------------------------');
	
//   // Make a request for a user with a given ID
//   axios.get('https://grim.co.in:3002/api/v2/sync/material_type')
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

const material_type = function () {}


material_type.prototype.material_type_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------------------');
        
        client.connect(function (err) { // and connect
            if (err) { // check for login/connection errors
                console.error('could not connect to server', err);
                res.status(400).json({
                    status: 400,
                    message: err
                });

            }

            // invoke remote enabled ABAP function module
            client.invoke('ZGRIM_MATERIAL_MASTER', {
                T_MATERIAL: '',
            }, function (err, response) {
                if (err) { // check for errors (e.g. wrong parameters)
                    console.log('Error invoking STFC_CONNECTION:', err);
                    res.status(400).json({
                        status: 400,
                        message: err
                    });

                } else {
                    console.log('Result STFC_CONNECTION:started','---------------', response);
if (response.T_MAT_TYPE.length == 0) {
    res.status(400).json({
        status: 400,
        message: 'Something Went Wrong'
    });
} else {
    response.T_MAT_TYPE.forEach(function (material_type, index) {
        console.log(material_type.MTART, index);

        var insertQuery = `INSERT INTO material_type_sync (material_type_sap_id, material_type_sap_description, updated_at) VALUES ('${material_type.MTART}', '${material_type.MTBEZ}', now() )`;


        var updateQuery = `UPDATE material_type_sync set material_type_sap_description = '${material_type.MTBEZ}',   updated_at = now() WHERE material_type_sap_id = '${material_type.MTART}'`;

        con.query(`SELECT * FROM material_type_sync where material_type_sap_id = '${material_type.MTART}'`, function (c_err, c_result) {
            if (c_err) {
                console.log(c_err);
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
                        if (index == response.T_MAT_TYPE.length - 1) {
                            setTimeout(() => {
                                res.status(200).json({
                                    "sucess": true,
                                    "message": "Material_types updated successfully"
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
                        if (index == response.T_MAT_TYPE.length - 1) {
                            setTimeout(() => {
                                res.status(200).json({
                                    "sucess": true,
                                    "message": "Material_types updated successfully"
                                })
                            }, 1000);
                        }

                    }
                });

            }
        });
    })
}
                   
                }
            });
        });
    })
}

module.exports = new material_type()