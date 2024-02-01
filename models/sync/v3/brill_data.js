

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

const brill_data = function () { }


brill_data.prototype.brill_data_func = function (req, res, callback) {
    console.log('--------------------', req.body.brill_data);

    client.connect(function (err) { // and connect
        console.log(err);

        if (err) { // check for login/connection errors
            console.error('could not connect to server', err);
            res.status(400).json({
                status: 400,
                message: err
            });

        }

        var importTable_hdr = req.body.brill_data.importTable_hdr;
        var importTable_itm = req.body.brill_data.importTable_itm;

        // var importTable_hdr = {
        //     "DOC_NO": "1",
        //     "REP_GEN_DT": "20210209",
        //     "PLANT_CODE": "POUL",
        //     "PLANT_NAME": "ABIS EXPORTS",
        //     "FORMULA_CODE": "CON-LC",
        //     "BRILL_MAT_CODE": "11",
        //     "FORMULA_NAME": "L-ST & GR CON",
        //     "VERSION_NO": "127",
        //     "BATCH_WEIGHT": 2000,
        //     "PREMIX_RAW": "",
        //     "PRE_FOR_CODE": "",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // };

        // var importTable_itm = [{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "1",
        //     "BRILL_MAT_CODE": "11",
        //     "PERCENT": 6.29,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "2",
        //     "BRILL_MAT_CODE": "21",
        //     "PERCENT": 15,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "3",
        //     "BRILL_MAT_CODE": "29",
        //     "PERCENT": 15,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "4",
        //     "BRILL_MAT_CODE": "31",
        //     "PERCENT": 12.4,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "5",
        //     "BRILL_MAT_CODE": "51",
        //     "PERCENT": 0.73,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "6",
        //     "BRILL_MAT_CODE": "54",
        //     "PERCENT": 1.29,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "7",
        //     "BRILL_MAT_CODE": "55",
        //     "PERCENT": 0.59,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // },{
        //     "DOC_NO": "1",
        //     "LINE_ITEM_NO": "8",
        //     "BRILL_MAT_CODE": "204",
        //     "PERCENT": 8,
        //     "MATERIAL_QTY": 1,
        //     "BIN_LOCATION": "1",
        //     "ERNAM": "",
        //     "ERDAT": "",
        //     "ERZEIT": ""
        // }]
        // var importTable_itm = req.body.brill_data.importTable_itm;

        importTable_hdr = [importTable_hdr];

        console.log(importTable_hdr, '-----------------------');
        // invoke remote enabled ABAP function module
        client.invoke('ZPPF_BRILL_BOM_CREATION', {
            // T_INDENT: importStruct
            ET_BRILL_BOM_H: importTable_hdr,
            ET_BRILL_BOM_I: importTable_itm

        }, function (err, response) {
            console.log('----------invoke---------', err);

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
}

module.exports = new brill_data()