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
  
  console.log(client);
  console.log(client.getVersion());
  var cron = require('node-cron');
const axios = require('axios');



 
// cron.schedule('* * 02 * * *', () => {
// 	console.log('----------------------------');
	
//   // Make a request for a user with a given ID
//   axios.get('https://grim.co.in:3002/api/v2/sync/materialItems')
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

const materialItems = function () {}


materialItems.prototype.materialItems_func = function (req, res, callback) {
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
                console.log('Result STFC_CONNECTION:started');
        
                response.T_MATERIAL.forEach(function (material, index) {
                //   console.log(material.MATNR, index);
        
                    var material_name = material.MAKTX.replace(/'/g, '"');
                    // console.log(material_name, index);
        
                    var insertQuery = `INSERT INTO material_items_sync (id, name, base_unit, material_type, material_group, tech_spec, updated_at) VALUES (${material.MATNR}, '${material_name}', '${material.MEINS}','${material.MTART}', '${material.MATKL}', '${material.TECHN}', now() )`;
        
        
                    var updateQuery = `UPDATE material_items_sync set name = '${material_name}', base_unit = '${material.MEINS}', material_type = '${material.MTART}', material_group='${material.MATKL}', tech_spec = '${material.TECHN}',  updated_at = now() WHERE id = ${material.MATNR}`;
        
                    con.query(`SELECT * FROM material_items_sync where id = ${material.MATNR}`, function (c_err, c_result) {
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
                            if (index == response.T_MATERIAL.length - 1) {
                              setTimeout(() => {
                                res.status(200).json({
                                  "sucess": true,
                                  "message": "Materials updated successfully"
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
                            if (index == response.T_MATERIAL.length - 1) {
                              setTimeout(() => {
                                res.status(200).json({
                                  "sucess": true,
                                  "message": "Materials updated successfully"
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

module.exports = new materialItems()