var rfc = require('node-rfc');
require('dotenv/config')


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

const assets = function () {}


assets.prototype.assets_func = function (req, res, callback) {
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
                T_WBS: '',T_ASSET: ''
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
                    response.T_ASSET.forEach(function (asset, index) {
                        var asset_desc = asset.TXT50.replace(/'/g, '"');


                        var insertQuery = `INSERT INTO assets (company_code, asset_num, asset_sub_num, asset_desc) VALUES ('${asset.BUKRS}', '${asset.ANLN1}', '${asset.ANLN2}', '${asset_desc}')`;

                        con.query(insertQuery, function (i_err, i_result) {
                            if (i_err) {
                                console.log(i_err);
                                con.release();
                                res.status(500).json({
                                    "sucess": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                console.log('------insert------');
                                if (index == response.T_ASSET.length - 1) {
                                    console.log('done');
                                    setTimeout(() => {
                                        con.release();
                                        res.status(200).json({
                                            "sucess": true,
                                            "message": "Assets inserted successfully"
                                        })
                                    }, 100);
                                }
                            }
                        });
                    })


                }
            });
        });
    })
}

module.exports = new assets()