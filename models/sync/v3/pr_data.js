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

// const pr_data = function () {}


// pr_data.prototype.pr_data_func = function (req, res, callback) {
//     mysqlPool.getConnection(function (err, con) {
//         console.log('--------------------', req.body.p_r_data);

//         client.connect(function (err) { // and connect
//             console.log(err);

//             if (err) { // check for login/connection errors
//                 console.error('could not connect to server', err);
//                 res.status(400).json({
//                     status: 400,
//                     message: err
//                 });

//             }
//             // var importTable_hdr = {
//             //     GPRDC: '4',
//             //     DOCDT: '20191017',
//             //     MATNR: '812470',
//             //     MAKTX: ' 0.5 Ltr Fuel Filter Kit (34.999.15.0.00)',
//             //     MENGE: 2,
//             //     MEINS: 'EA',
//             //     POSID: '4-184510-05 -03-1',
//             //     POST1: '11 Kv HT Line, Electricity Board To site'
//             // }

//             // var importTable_itm = [{
//             //     GPRDC: '4',
//             //     INDNO: '5',
//             //     ITEMN: '12',
//             //     WERKS: '1110',
//             //     LGORT: 'CGEN',
//             //     INDDT: '20191017',
//             //     MATNR: '812470',
//             //     MAKTX: ' 0.5 Ltr Fuel Filter Kit (34.999.15.0.00)',
//             //     MENGE: 1,
//             //     MEINS: 'EA',
//             //     POSID: '4-184510-05 -03-1',
//             //     POST1: '11 Kv HT Line, Electricity Board To site',
//             //     GUSRID: '54',
//             //     DEPTID: '1',
//             //     APPRID: '3',
//             //     APPRNM: 'Adithya'
//             // }, {
//             //     GPRDC: '4',
//             //     INDNO: '4',
//             //     ITEMN :  '10',
//             //     WERKS: '1110',
//             //     LGORT: 'CGEN',
//             //     INDDT : '20191017',
//             //     MATNR: '812470',
//             //     MAKTX: '0.5 Ltr Fuel Filter Kit (34.999.15.0.00)',
//             //     MENGE: 1,
//             //     MEINS: 'EA',
//             //     POSID: '4-184510-05 -03-1',
//             //     POST1: '11 Kv HT Line, Electricity Board To site',
//             //     GUSRID: '54',
//             //     DEPTID: '1',
//             //     APPRID: '3',
//             //     APPRNM: 'Adithya'
//             // }]

//             var importTable_hdr = req.body.p_r_data.importTable_hdr;
//             var importTable_itm = req.body.p_r_data.importTable_itm;



//             // var importStruct = req.body.receiving_data

//             // console.log(importStruct);

//             importTable_hdr = [importTable_hdr];
//             // importTable_itm = [importTable_itm];
//             console.log(importTable_hdr, importTable_itm, '--------testing');

//             // invoke remote enabled ABAP function module
//             client.invoke('ZGRIM_INDENT_DATA_PURCHASE', {
//                 // T_INDENT: importStruct

//                 T_PURCH_HDR: importTable_hdr,
//                 T_PURCH_ITM: importTable_itm



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

// module.exports = new pr_data()



require('dotenv/config')


// var abapSystem = {
//     user: process.env.user,
//     passwd: process.env.passwd,
//     ashost: process.env.ashost,
//     sysnr: process.env.sysnr,
//     lang: process.env.lang,
//     client: process.env.client
// };

const axios = require('axios');

const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const pr_data = function () {}


pr_data.prototype.pr_data_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------------------', req.body.p_r_data);

        var importTable_hdr = req.body.p_r_data.importTable_hdr;
        var importTable_itm = req.body.p_r_data.importTable_itm;



        // var importStruct = req.body.receiving_data

        // console.log(importStruct);

        // importTable_hdr = [importTable_hdr];
        // importTable_itm = [importTable_itm];
        console.log(importTable_hdr, importTable_itm, '--------testing');

        var reqData = {
            "req": [importTable_hdr]
        }

        reqData.req[0].itm = importTable_itm

        var config = {
            method: 'post',
            url: `${process.env.sap_host}/zgrim_pr_post?sap-client=444`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.sap_auth}`
            },
            data: reqData
        };

        axios(config).then(function (response) {
                console.log(response.data,'--------------res-----------');
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
    })
}

module.exports = new pr_data()