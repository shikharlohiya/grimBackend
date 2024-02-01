

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

var cron = require('node-cron');
const axios = require('axios');
const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const indent_data = function () {}


indent_data.prototype.indent_data_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------------------', req.body.indent_data);

        client.connect(function (err) { // and connect
            console.log(err);
            
            if (err) { // check for login/connection errors
                console.error('could not connect to server', err);
                res.status(400).json({
                    status: 400,
                    message: err
                });

            }
            // var indentDataObject = 

            // console.log(indentDataObject);

            // var importStruct = { INDNO: '15',
            // ITEMN: '27',
            // INDDT: '20190920',
            // WERKS: '1110',
            // LGORT: 'CGEN',
            // MATNR: '819618',
            // MAKTX: '"U" CLAMP for 33KV AB SWITCH',
            // MENGE: '4',
            // MEINS: 'EA',
            // UMWRK: '1110',
            // UMLGO: '1918',
            // POSID: '9-099400-008-2',
            // POST1: ' P&M',
            // KOSTL: 'null',
            // PURDC: '',
            // BWART: '2',
            // IDOCG: 'null',
            // RDOCG: 'null',
            // GUSRID: '54',
            // DEPTID: '2',
            // APPRID: '3',
            // APPRNM: 'Adithya' }

            var importStruct = req.body.indent_data

            console.log(importStruct);
            
            var importTable = [importStruct];
            // invoke remote enabled ABAP function module
            client.invoke('ZGRIM_INDENT_DATA_MOVEMENT', {
                // T_INDENT: importStruct
                 T_INDENT: importTable

            }, function (err, response) {
                console.log('----------invoke---------',err);
                
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
                    res.status(200).json({
                        status: true,
                        data: response
                    });
                }
            });
        });
    })
}

module.exports = new indent_data()