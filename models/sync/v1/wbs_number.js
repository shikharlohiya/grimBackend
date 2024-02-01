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
            client.invoke('ZGRIM_WBS_MASTER', {
              T_WBS: '',
            }, function (err, response) {
              if (err) { // check for errors (e.g. wrong parameters)
                console.log('Error invoking STFC_CONNECTION:', err);
                res.status(400).json({
                  status: 400,
                  message: err
                });
              } else {
                console.log('Result STFC_CONNECTION:', response);
        
                response.T_WBS.forEach(function (wbs, index) {
                    var insertQuery = `INSERT INTO wbs_numbers (wbs_number, wbs_desc, budget, actual, balance) VALUES ('${wbs.POSID}', '${wbs.POST1}', '${wbs.BUDGET}', '${wbs.ACTUAL}', '${wbs.BALANCE}')`;
        
        
                    var updateQuery = `UPDATE wbs_numbers set  wbs_desc = '${wbs.POST1}', budget= '${wbs.BUDGET}' , actual= '${wbs.ACTUAL}' , balance= '${wbs.BALANCE}' WHERE wbs_number = '${wbs.POSID}'`;
        
                    con.query(`SELECT * FROM wbs_numbers where wbs_number = '${wbs.POSID}'`, function (c_err, c_result) {
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
                            if (index == response.T_WBS.length - 1) {
                              setTimeout(() => {
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
                            if (index == response.T_WBS.length - 1) {
                              setTimeout(() => {
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