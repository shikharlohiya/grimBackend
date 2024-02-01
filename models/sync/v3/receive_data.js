// var rfc = require('node-rfc');

// require('dotenv/config')


// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };
// var client = new rfc.Client(abapSystem);

// var cron = require('node-cron');
// const axios = require('axios');
// const mysql = require("../../db.js"),
//     g_var = require("../../global_var.js"),
//     mysqlPool = mysql.createPool() // connects to Database

// const receive_data = function () {}


// receive_data.prototype.receive_data_func = function (req, res, callback) {
//     mysqlPool.getConnection(function (err, con) {
//         console.log('--------------------', req.body.receiving_data);

//         client.connect(function (err) { // and connect
//             console.log(err);

//             if (err) { // check for login/connection errors
//                 console.error('could not connect to server', err);
//                 res.status(400).json({
//                     status: 400,
//                     message: err
//                 });

//             }
//             // var importStruct =  { INDNO: '1',
//             // ITEMN: '1',
//             // BUDAT: '20191004',
//             // GDOCN: 'null',
//             // BLART: 'GR',
//             // WERKS: '1110',
//             // LGORT: 'CGEN',
//             // MATNR: '819618',
//             // MAKTX: '"U" CLAMP for 33KV AB SWITCH',
//             // MENGE: 2,
//             // MEINS: 'EA',
//             // UMWRK: '2220',
//             // UMLGO: '2923',
//             // GUSRID: '54',
//             // DEPTID: '2',
//             // APPRID: '3',
//             // APPRNM: 'Adithya' }
//             var importStruct = req.body.receiving_data
//             if (req.body.receiving_data.length == undefined) {
//                 var importTable = [importStruct];

//             } else {
//                 var importTable = importStruct;

//             }
//             console.log(importStruct);

//             // invoke remote enabled ABAP function module
//             client.invoke('ZGRIM_TRANSACTION', {
//                 // T_INDENT: importStruct
//                 T_TRANS: importTable

//             }, function (err, response) {
//                 console.log('----------invoke---------', err);

//                 if (err) { // check for errors (e.g. wrong parameters)
//                     console.log('Error invoking STFC_CONNECTION:', err);
//                     client.close();
//                     res.status(400).json({
//                         status: 400,
//                         message: err
//                     });

//                 } else {
//                     console.log('Result STFC_CONNECTION:started', response);
//                     client.close();
//                     res.status(200).json({
//                         status: true,
//                         data: response
//                     });
//                 }
//             });
//         });
//     })
// }

// module.exports = new receive_data()




require('dotenv/config')


// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };
// var client = new rfc.Client(abapSystem);

// var cron = require('node-cron');
const axios = require('axios');
const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const receive_data = function () {}


receive_data.prototype.receive_data_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------------------', req.body.receiving_data);

        // var importStruct =  { INDNO: '1',
        // ITEMN: '1',
        // BUDAT: '20191004',
        // GDOCN: 'null',
        // BLART: 'GR',
        // WERKS: '1110',
        // LGORT: 'CGEN',
        // MATNR: '819618',
        // MAKTX: '"U" CLAMP for 33KV AB SWITCH',
        // MENGE: 2,
        // MEINS: 'EA',
        // UMWRK: '2220',
        // UMLGO: '2923',
        // GUSRID: '54',
        // DEPTID: '2',
        // APPRID: '3',
        // APPRNM: 'Adithya' }
        var importStruct = req.body.receiving_data
        if (req.body.receiving_data.length == undefined) {
            var importTable = [importStruct];

        } else {
            var importTable = importStruct;

        }
        console.log(importStruct);

        // invoke remote enabled ABAP function module
        var reqData = {
            "req": importTable
        }

        // reqData = JSON.stringify(reqData)

        var config = {
            method: 'post',
            url: `${process.env.sap_host}/zgrim_trans?sap-client=444`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.sap_auth}`
            },
            data: reqData
        };

        axios(config).then(function (response) {
            // console.log(response);
            res.status(200).json({
                status: true,
                data: response.data
            });
        }).catch(function (error) {
            // handle error
            console.log(error);
            res.status(400).json({
                status: 400,
                message: error
            });
        })

        // client.invoke('ZGRIM_TRANSACTION', {
        //     // T_INDENT: importStruct
        //     T_TRANS: importTable

        // }, function (err, response) {
        //     console.log('----------invoke---------', err);

        //     if (err) { // check for errors (e.g. wrong parameters)
        //         console.log('Error invoking STFC_CONNECTION:', err);
        //         client.close();
        //         res.status(400).json({
        //             status: 400,
        //             message: err
        //         });

        //     } else {
        //         console.log('Result STFC_CONNECTION:started', response);
        //         client.close();
        //         res.status(200).json({
        //             status: true,
        //             data: response
        //         });
        //     }
        // });
    })
}

module.exports = new receive_data()