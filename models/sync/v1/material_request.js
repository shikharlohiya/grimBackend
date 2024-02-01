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
var cron = require('node-cron');
const axios = require('axios');

const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_request = function () {}


material_request.prototype.material_request_func = function (req, res, callback) {
console.log('---------------test--------',req.body.indentDataObject);

    mysqlPool.getConnection(function (err, con) {
        client.connect(function (err) { // and connect
            if (err) { // check for login/connection errors
                console.error('could not connect to server', err);
                res.status(400).json({
                    status: 400,
                    message: `not able to connect to server: ${err}`,

                });

            }

            // var indentDataObject = {
            //     INDNO: 1,
            //     ITEMN: 1,
            //     INDDT: '2019-09-12',
            //     WERKS: '1110',
            //     LGORT: 'CMED',
            //     MATNR: '802954',
            //     MAKTX: 'Solmonea Antigen',
            //     MENGE: 5,
            //     MEINS: 'DOS',
            //     UMWRK: '1110',
            //     UMLGO: '1121',
            //     POSID: '9-099100-001',
            //     POST1: 'New Central Store - Solvent Plant',
            //     KOSTL: 'test',
            //     PURDC: 'X',
            //     BWART: '301',
            //     IDOCG: '1',
            //     RDOCG: '1',
            //     GUSRID: '26',
            //     DEPTID: '1',
            //     APPRID: '3',
            //     APPRNM: 'Adithya'
            // }
            
            // var indentDataObject = {
            //     GDOCN : '1',
            //     WERKS: '1110',
            //     LGORT: 'CMED',
            //     MAKTX : 'Pen',
            //     MTART : 'YFER',
            //     MATKL : '1204',
            //     MEINS: 'DOS',
            //     EKGRP : '1110',
            //     VERPR : 10,
            //     TSPEC : 'test',
            //     SVEND : 'testing',
            //     UDAYS : '5',
            //     REMARK : 'testing'
            // }

            var indentDataObject = req.body.indentDataObject

            console.log(indentDataObject);
            var importTable = [indentDataObject];
            

            // invoke remote enabled ABAP function module
            client.invoke('ZGRIM_MATERIAL_REQUEST ', {
                T_REQUEST: importTable,
            }, function (err, response) {
                if (err) { // check for errors (e.g. wrong parameters)
                    console.log('Error invoking STFC_CONNECTION:', err);
                    res.status(400).json({
                        status: 400,
                        message: err
                    });

                } else {
                    console.log('Result STFC_CONNECTION:started', response);
                    res.status(200).json({
                        status: true,
                        data: response
                    });
                }
            });
        });
    })
}

module.exports = new material_request()