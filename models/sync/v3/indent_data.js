// var rfc = require('node-rfc');
// require('dotenv/config')


// // var abapSystem = {
// //     user: process.env.user,
// //     passwd: process.env.passwd,
// //     ashost: process.env.ashost,
// //     sysnr: process.env.sysnr,
// //     lang: process.env.lang,
// //     client: process.env.client
// // };
// var abapSystem = {
//     user: "IBGRFCS4TPTH",
//     passwd: "initial$1",
//     ashost: "172.16.0.156",
//     sysnr: "01",
//     lang: "EN",
//     client: "444"
// };
// var client = new rfc.Client(abapSystem);

// var cron = require('node-cron');
// const axios = require('axios');

// const indent_data = function () {}


// indent_data.prototype.indent_data_func = function (req, res, callback) {

//     client.connect(function (err) { // and connect
//         console.log(err);

//         if (err) { // check for login/connection errors
//             console.error('could not connect to server', err);
//             res.status(400).json({
//                 status: 400,
//                 message: err
//             });

//         }

//         var importStruct = req.body.indent_data

//         console.log(importStruct);

//         var importTable = [importStruct];
//         // invoke remote enabled ABAP function module
//         client.invoke('ZMMF_GRIM_INDENT_MOVE_DATA_OUT', {
//             // T_INDENT: importStruct
//             ET_INDENT: importTable

//         }, function (err, response) {
//             // console.log('----------invoke---------',err);

//             if (err) { // check for errors (e.g. wrong parameters)
//                 console.log('Error invoking STFC_CONNECTION:', err);
//                 client.close();
//                 res.status(400).json({
//                     status: 400,
//                     message: err
//                 });

//             } else {
//                 console.log('Result STFC_CONNECTION:started', response);
//                 client.close();
//                 res.status(200).json({
//                     status: true,
//                     data: response
//                 });
//             }
//         });
//     });
// }

// module.exports = new indent_data()

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
    user: "IBGRFCS4TPTH",
    passwd: "initial$1",
    ashost: "172.16.0.156",
    sysnr: "01",
    lang: "EN",
    client: "444"
};
var client = new rfc.Client(abapSystem);

var cron = require('node-cron');
const axios = require('axios');

const indent_data = function () {}


indent_data.prototype.indent_data_func = function (req, res, callback) {

    var importStruct = req.body.indent_data
    console.log(importStruct);

    // invoke remote enabled ABAP function module
    var reqData = {
        "req": [importStruct]
    }

    // reqData = JSON.stringify(reqData)

    var config = {
        method: 'post',
        url: `${process.env.sap_host}/grimindentmove?sap-client=444`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.sap_auth}`
        },
        data: reqData
    };

    axios(config).then(function (response) {
        console.log(response);
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
}

module.exports = new indent_data()