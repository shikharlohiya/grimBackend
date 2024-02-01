var rfc = require('node-rfc');

require('dotenv/config')

var cron = require('node-cron');
const axios = require('axios');

cron.schedule('0 30 5 *   *   *', () => {
    console.log('----------------------------');

    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v2/sync/wbs_number`)
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

var abapSystem = {
     user: process.env.user,
     passwd: process.env.passwd,
     ashost: process.env.ashost,
     sysnr: process.env.sysnr,
     lang: process.env.lang,
     client: process.env.client
 };
var client = new rfc.Client(abapSystem);


const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database

const wbs_number = function () {}


wbs_number.prototype.wbs_number_func = function (req, res, callback) {
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
        ET_WBS: '',
      }, function (err, response) {
        if (err) { // check for errors (e.g. wrong parameters)
          console.log('Error invoking STFC_CONNECTION:', err);
          client.close();
          res.status(400).json({
            status: 400,
            message: err
          });
        } else {
          console.log('Result STFC_CONNECTION:', response);
          client.close();

          response.ET_WBS.forEach(function (wbs, index) {

            var wbs_desc = wbs.POST1

            var insertQuery = `INSERT INTO wbs_numbers (wbs_number, wbs_desc, budget, actual, balance, plant_id) VALUES ('${wbs.POSID}', '${wbs_desc}', '${wbs.BUDGET}', '${wbs.ACTUAL}', '${wbs.BALANCE}', '${wbs.WERKS}')`;


            var updateQuery = `UPDATE wbs_numbers set  wbs_desc = '${wbs_desc}', budget= '${wbs.BUDGET}' , actual= '${wbs.ACTUAL}' , balance= '${wbs.BALANCE}', plant_id = '${wbs.WERKS}'  WHERE wbs_number = '${wbs.POSID}'`;

            con.query(`SELECT * FROM wbs_numbers where wbs_number = '${wbs.POSID}'`, function (c_err, c_result) {
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
                    if (index == response.ET_WBS.length - 1) {
                      console.log('done');

                      setTimeout(() => {
                        con.release();
                        res.status(200).json({
                          "sucess": true,
                          "message": "WBS updated successfully"
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
                    if (index == response.ET_WBS.length - 1) {
                      console.log('done');

                      setTimeout(() => {
                        con.release();
                        res.status(200).json({
                          "sucess": true,
                          "message": "WBS updated successfully"
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

module.exports = new wbs_number()