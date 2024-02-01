const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

require('dotenv/config')
var cron = require('node-cron');
const axios = require('axios');

cron.schedule('0 8 *   *   *', () => {
    console.log('----------------------------');

    // Make a request for a user with a given ID
    axios.get(`${process.env.host}/api/v4/brill/material_sap_stock`)
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
const material_stock = function () { }

material_stock.prototype.material_stock_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_material_stock Order By SAPMaterialId`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                // console.log(uresult);
                res.status(200).json({
                    "success": true,
                    "material_stock": uresult
                })
            }
        });
    })
}


material_stock.prototype.material_stock_sap_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {

                var config = {
                    method: 'get',
                    // url: `http://172.16.0.157:8001/sap/bc/rest/matstock?sap-client=786`, //SUJHUkZDUzRUUFRIOmluaXRpYWwkMQ== //Dev
                    url: `http://172.16.0.147:8001/sap/bc/rest/matstock?sap-client=786`, //Prod
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic SUJHQlJJTEw6QWJpc0AyMDIx`
                    }
                };

                axios(config).then(function (response) {
                    if (err) { // check for errors (e.g. wrong parameters)
                        console.log('Error invoking STFC_CONNECTION:', err);

                        res.status(400).json({
                            status: 400,
                            message: err
                        });

                    } else {
                        console.log('Result STFC_CONNECTION:started', response.data);

                        if (response.data.length > 0) {
                            con.query('DELETE FROM brill_material_stock', function (u_err, u_result) {
                                if (u_err) {
                                    console.log(u_err);
                                    con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": u_err
                                        })
                                    });

                                } else {
                                    response.data.forEach(function (material_stock, index) {
                                        console.log(material_stock.SAPMaterialId, index);
                                        if (material_stock.Stock == 0.01) {
                                            material_stock.Stock = 0;
                                            material_stock.SAPPlantCode = "";
                                            material_stock.SAPPlantName = "";
                                            material_stock.BrillPlantCode = "";
                                        } else {
                                            material_stock.Stock = material_stock.Stock;
                                        }
                                        if (material_stock.PendingPOQty == 0.01) {
                                            material_stock.PendingPOQty = 0;
                                        } else {
                                            material_stock.PendingPOQty = material_stock.PendingPOQty;
                                        }
                                        if (material_stock.PendingContractQty == 0.01) {
                                            material_stock.PendingContractQty = 0;
                                        } else {
                                            material_stock.PendingContractQty = material_stock.PendingContractQty;
                                        }
                                        if (material_stock.AMP == 0.01) {
                                            material_stock.AMP = 0;
                                        } else {
                                            material_stock.AMP = material_stock.AMP;
                                        }
                                        if (material_stock.LPP == 0.01) {
                                            material_stock.LPP = 0;
                                        } else {
                                            material_stock.LPP = material_stock.LPP;
                                        }
                                        var insertQuery = `INSERT INTO brill_material_stock (SAPMaterialName, SAPMaterialId, SAPMaterialGroup, SAPMaterialType, BrillMaterialId, SAPPlantCode, SAPPlantName, BrillPlantCode, Stock, PendingPOQty, PendingContractQty, AMP, LPP) VALUES ('${material_stock.SAPMaterialName}', '${material_stock.SAPMaterialId}', '${material_stock.SAPMaterialGroup}', '${material_stock.SAPMaterialType}', '${material_stock.BrillMaterialId}', '${material_stock.SAPPlantCode}', '${material_stock.SAPPlantName}', '${material_stock.BrillPlantCode}', ${material_stock.Stock}, ${material_stock.PendingPOQty}, ${material_stock.PendingContractQty}, ${material_stock.AMP}, ${material_stock.LPP});`;


                                        con.query(insertQuery, function (u_err, u_result) {
                                            if (u_err) {
                                                console.log(u_err);
                                                con.rollback(function () {
                                                    con.release();
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": u_err
                                                    })
                                                });

                                            } else {
                                                if (index == response.data.length - 1) {
                                                    console.log('----------------done');

                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                con.release();
                                                                res.status(500).json({
                                                                    "success": false,
                                                                    "message": err
                                                                })
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            con.release();
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Material Stock updated successfully"
                                                            })
                                                        }, 500);

                                                    });
                                                }
                                            }
                                        })
                                    })
                                }
                            })
                        } else {
                            con.release();
                            res.status(500).json({
                                "sucess": false,
                                "message": "Error with endpoint"
                            })
                        }
                    }
                });
            }
        })
    })
}

module.exports = new material_stock()