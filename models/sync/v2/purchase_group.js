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

const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const purchase_group = function () {}


purchase_group.prototype.purchase_group_func = function (req, res, callback) {
    console.log('started');

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
                    response.ET_PUR_GROUP.forEach(function (purchase_group, index) {
                        console.log(purchase_group.MATKL, index);
                        var insertQuery = `INSERT INTO purchase_group (purchase_group_id, purchase_group_desc) VALUES ( '${purchase_group.EKGRP}', '${purchase_group.EKNAM}')`;


                        var updateQuery = `UPDATE purchase_group set purchase_group_desc = '${purchase_group.EKNAM}' WHERE purchase_group_id = '${purchase_group.EKGRP}'`;

                        con.query(`SELECT * FROM purchase_group where purchase_group_id = '${purchase_group.EKGRP}'`, function (c_err, c_result) {
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
                                        if (index == response.ET_PUR_GROUP.length - 1) {
                                            setTimeout(() => {

                                                con.release();
                                                res.status(200).json({
                                                    "sucess": true,
                                                    "message": "purchase_groups updated successfully"
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
                                        if (index == response.ET_PUR_GROUP.length - 1) {
                                            setTimeout(() => {

                                                con.release();
                                                res.status(200).json({
                                                    "sucess": true,
                                                    "message": "purchase_groups updated successfully"
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

module.exports = new purchase_group()