var rfc = require('node-rfc');

require('dotenv/config')

var _ = require("underscore");
var abapSystem = {
  user: process.env.user,
  passwd: process.env.passwd,
  ashost: process.env.ashost,
  sysnr: process.env.sysnr,
  lang: process.env.lang,
  client: process.env.client
};
var client = new rfc.Client(abapSystem);

console.log(client);
console.log(client.getVersion());
var cron = require('node-cron');
const axios = require('axios');




cron.schedule('0 5 *   *   *', () => {
  console.log('----------------------------');

  // Make a request for a user with a given ID
  axios.get(`${process.env.host}/api/v2/sync/materialItems`)
    .then(function (response) {
      // handle success
      console.log(response.data, '----------------------');
      // res.status(200).json({
      //     status: 200,
      //     result: response.data
      // });
    })
    .catch(function (error) {
      // handle error
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

const materialItems = function () {}


materialItems.prototype.materialItems_func = function (req, res, callback) {
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
          client.invoke('ZGRIM_MATERIAL_MASTER', {
            T_MATERIAL: '',
          }, function (err, response) {
            if (err) { // check for errors (e.g. wrong parameters)
              console.log('Error invoking STFC_CONNECTION:', err);
              client.close();
              res.status(400).json({
                status: 400,
                message: err
              });

            } else {
              // console.log('Result STFC_CONNECTION:started', response.T_MATERIAL.length);
              client.close();
              var materialQuery = '';

              con.query(`SELECT material_sap_id FROM material_items`, function (c_err, c_result) {
                console.log(c_result);
                if (c_err) {
                  console.log(c_err);
                  con.rollback(function () {
                    con.release();
                    res.status(500).json({
                      "success": false,
                      "message": c_err
                    })
                  });
                } else {

                  var sapIdsArray = c_result.map(({
                    material_sap_id
                  }) => material_sap_id);

                  response.T_MATERIAL.forEach(function (material, index) {
                    // console.log(material.MATNR, index);

                    var material_name = material.MAKTX.replace(/[^\w\s]/gi, '');
                    // console.log(material_name, index);

                    var insertQuerysync = `INSERT INTO material_items_sync (material_sap_id, name, base_unit, material_type_sap_id, material_group_sap_id, tech_spec, created_at) VALUES (${material.MATNR}, '${material_name}', '${material.MEINS}','${material.MTART}', '${material.MATKL}', '${material.TECHN}', now() );`;

                    var insertQuery = `INSERT INTO material_items (material_sap_id, name, base_unit, material_type_sap_id, material_group_sap_id, tech_spec, updated_at) VALUES (${material.MATNR}, '${material_name}', '${material.MEINS}','${material.MTART}', '${material.MATKL}', '${material.TECHN}', now() );`;

                    var updateQuery = `UPDATE material_items set name = '${material_name}', base_unit = '${material.MEINS}', material_type_sap_id = '${material.MTART}', material_group_sap_id='${material.MATKL}', tech_spec = '${material.TECHN}',  updated_at = now() WHERE material_sap_id = ${material.MATNR};`;



                    // console.log(sapIdsArray[0], '-------------array',
                    //   _.contains(sapIdsArray, material.MATNR));

                    if (_.contains(sapIdsArray, material.MATNR)) {
                      // console.log('--------update---------', index);

                      // materialQuery += updateQuery;
                      // materialQuery += insertQuerysync;
                    } else {

                      // console.log('--------insert---------', index);

                      materialQuery += insertQuery;
                      // materialQuery += insertQuerysync;

                    }

                    if (index == response.T_MATERIAL.length - 1) {
                      console.log('----------------done');
                      if (materialQuery != '') {

                        con.query(materialQuery, function (u_err, u_result) {
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
                                  "message": "Materials updated successfully"
                                })
                              }, 1000);

                            });

                          }
                        });

                      } else {
                        con.release();
                        res.status(200).json({
                          "sucess": true,
                          "message": "Materials updated successfully"
                        })
                      }
                    }
                  });
                }
              })
            }
          });
        });
      }
    })

  })
}

module.exports = new materialItems()