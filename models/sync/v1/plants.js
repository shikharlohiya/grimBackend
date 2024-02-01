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
//   axios.get('https://grim.co.in:3002/api/v2/sync/plants')
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

const plants = function () {}


plants.prototype.plants_func = function (req, res, callback) {
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
            client.invoke('ZGRIM_PLANT_MASTER', {
              T_PLANT: '',
            }, function (err, response) {
              if (err) { // check for errors (e.g. wrong parameters)
                console.log('Error invoking STFC_CONNECTION:', err);
                res.status(400).json({
                  status: 400,
                  message: err
                });
              } else {
                console.log('Result STFC_CONNECTION:', response, response.T_PLANT.length);
        
                response.T_PLANT.forEach(function (plant, index) {
                  console.log(plant.WERKS, index);
                  
        
                    var insertQuery = `INSERT INTO plant_details_sync (plant_id, plant_name, storage_location, storage_location_desc, store, updated_at) VALUES ('${plant.WERKS}', '${plant.NAME1}', '${plant.LGORT}','${plant.LGOBE}', '${plant.STIND}', now() )`;
        
        
                    var updateQuery = `UPDATE plant_details_sync set plant_name = '${plant.NAME1}', storage_location = '${plant.LGORT}', storage_location_desc = '${plant.LGOBE}', store='${plant.STIND}',  updated_at = now() WHERE plant_id = '${plant.WERKS}'`;
        
                    con.query(`SELECT * FROM plant_details_sync where plant_id = '${plant.WERKS}'`, function (c_err, c_result) {
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
                            if (index == response.T_PLANT.length - 1) {
                              setTimeout(() => {
                                res.status(200).json({
                                  "sucess": true,
                                  "message": "Plants updated successfully"
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
                            if (index == response.T_PLANT.length - 1) {
                              setTimeout(() => {
                                res.status(200).json({
                                  "sucess": true,
                                  "message": "Plants updated successfully"
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

module.exports = new plants()