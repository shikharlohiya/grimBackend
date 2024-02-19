process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle the error or log it
});

const rfc = require('node-rfc');
require('dotenv/config');
const axios = require('axios');
const mysql = require("../../db.js");
const mysqlPool = mysql.createPool();

const abapSystem = {
    user: "IBGGRIM",
    passwd: "Abis@2021",
    ashost: "172.16.0.147",
    sysnr: "01",
    lang: "EN",
    client: "786"
};

const client = new rfc.Client(abapSystem);
const material_stock = function () {};

material_stock.prototype.material_stock_func = function (req, res, callback) {
    console.log('---------------');

    mysqlPool.getConnection(function (err, con) {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).json({
                "success": false,
                "message": "Error getting MySQL connection"
            });
            return;
        }

        con.beginTransaction(function (err) {
            if (err) {
                console.error('Error beginning transaction:', err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error beginning transaction"
                });
                return;
            }

            con.query('DELETE FROM material_stock', function (del_err, del_result) {
                if (del_err) {
                    console.error('Error deleting records:', del_err);
                    con.rollback(function () {
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error deleting records"
                        });
                    });
                    return;
                }

                client.connect(function (err) {
                    if (err) {
                        console.error('Could not connect to server:', err);
                        con.rollback(function () {
                            con.release();
                            res.status(400).json({
                                status: 400,
                                message: "Could not connect to server"
                            });
                        });
                        return;
                    }

                    client.invoke('ZMMF_GRIM_MATERIAL_STOCK_VAL', {
                        ET_STOCK: []
                    }, function (err, response) {
                        if (err) {
                            console.error('Error invoking ZMMF_GRIM_MATERIAL_STOCK_VAL:', err);
                            client.close();
                            con.rollback(function () {
                                con.release();
                                res.status(400).json({
                                    status: 400,
                                    message: err
                                });
                            });
                            return;
                        }

                        client.close();

                        if (response.ET_STOCK.length > 0) {
                            var stockValuesToInsert = response.ET_STOCK.map(function (material_stock) {
                                return `('${material_stock.MATNR}', '${material_stock.WERKS}', '${material_stock.LGORT}', ${material_stock.CLABS || 0}, ${material_stock.VERPR || 0}, NOW(), '${material_stock.CHARG || 'NEW'}')`;
                            });

                            var stockQuery = `INSERT INTO material_stock (material_id, plant_id, storage_loc, quantity, price, updated_at, valution_type) VALUES ${stockValuesToInsert.join(', ')};`;

                            con.query(stockQuery, function (u_err, u_result) {
                                if (u_err) {
                                    console.error('Error inserting records:', u_err);
                                    con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error inserting records"
                                        });
                                    });
                                    return;
                                }

                                console.log('Committing transaction');
                                con.commit(function (commit_err) {
                                    if (commit_err) {
                                        console.error('Error committing transaction:', commit_err);
                                        con.rollback(function () {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error committing transaction"
                                            });
                                        });
                                    } else {
                                        setTimeout(() => {
                                            con.release();
                                            res.status(200).json({
                                                "success": true,
                                                "message": "Material Stock updated successfully"
                                            });
                                        }, 1000);
                                    }
                                });
                            });
                        } else {
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            });
                        }
                    });
                });
            });
        });
    });
};

module.exports = new material_stock();
