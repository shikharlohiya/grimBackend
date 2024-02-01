var rfc = require('node-rfc');

require('dotenv/config')


// var abapSystem = {
//   user: process.env.user,
//   passwd: process.env.passwd,
//   ashost: process.env.ashost,
//   sysnr: process.env.sysnr,
//   lang: process.env.lang,
//   client: process.env.client
// };

var abapSystem = {
  user: 'IBGRFCS4TPTH',
  passwd: 'initial$1',
  ashost: '172.16.0.156',
  sysnr: '01',
  lang: process.env.lang,
  client: process.env.client
};
var client = new rfc.Client(abapSystem);

var cron = require('node-cron');
const axios = require('axios');
// console.log('-------------- cron will start--------------');

cron.schedule('0 6 * * *', () => {
  console.log('----------------------------');

  // Make a request for a user with a given ID
  axios.get(`${process.env.host}/api/v2/sync/plants`)
    .then(function (response) {
      console.log(response.data, '----------------------');
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
        T_PLANT: [],
      }, function (err, response) {
        if (err) { // check for errors (e.g. wrong parameters)
          console.log('Error invoking STFC_CONNECTION:', err);
          client.close();
          res.status(400).json({
            status: 400,
            message: err
          });
        } else {
          // console.log('Result STFC_CONNECTION:', response, 'delivery:', response.T_DELV_PLANT.length, 'stores:', response.T_PLANT.length);
          client.close();
          var arr1 = response.T_PLANT;
          var arr2 = response.T_DELV_PLANT
          Array.prototype.push.apply(arr1, arr2);
          // console.log(arr1.length, '------------');

          arr1.forEach(function (plant, index) {
            // console.log(plant.WERKS, index);
            if (plant.STIND == undefined) {
              var store = ''
            } else {
              var store = plant.STIND;
            }


            var insertQuery = `INSERT INTO plant_details_sync (plant_id, plant_name, storage_location, storage_location_desc, store, updated_at) VALUES ('${plant.WERKS}', '${plant.NAME1}', '${plant.LGORT}','${plant.LGOBE}', '${store}', now() )`;


            var updateQuery = `UPDATE plant_details_sync set plant_name = '${plant.NAME1}', storage_location = '${plant.LGORT}', storage_location_desc = '${plant.LGOBE}', store='${store}',  updated_at = now() WHERE plant_id = '${plant.WERKS}' and storage_location = '${plant.LGORT}'`;

            var insertSyncQuery = `INSERT INTO plant_detail (plant_id, plant_name, storage_location, storage_location_desc, store) VALUES ('${plant.WERKS}', '${plant.NAME1}', '${plant.LGORT}','${plant.LGOBE}', '${plant.STIND}')`;

            con.query(insertSyncQuery, function (su_err, su_result) {
              if (su_err) {
                console.log(su_err);
                con.rollback(function () {
                  con.release();
                  res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                  })
                });

              } else {

                con.query(`SELECT * FROM plant_details_sync where plant_id = '${plant.WERKS}' and storage_location = '${plant.LGORT}'`, function (c_err, c_result) {
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
                        con.release();
                        res.status(500).json({
                          "sucess": false,
                          "message": "Error with endpoint"
                        })
                      } else {
                        // con.release();

                        // console.log('------insert------');
                        if (index == response.T_PLANT.length - 1) {
                          
                          con.release();
                          setTimeout(() => {
                            res.status(200).json({
                              "sucess": true,
                              "message": "Plants updated successfully"
                            })
                          }, 100);
                        }
                      }
                    });
                  } else {
                    con.query(updateQuery, function (u_err, u_result) {
                      if (u_err) {
                        console.log(u_err);
                        con.release();
                        res.status(500).json({
                          "sucess": false,
                          "message": "Error with endpoint"
                        })

                      } else {
                        // con.release();

                        // console.log('------update------');
                        if (index == response.T_PLANT.length - 1) {
                          
                          con.release();
                          setTimeout(() => {
                            res.status(200).json({
                              "sucess": true,
                              "message": "Plants updated successfully"
                            })
                          }, 100);
                        }
                      }
                    });
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