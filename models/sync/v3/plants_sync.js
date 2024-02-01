const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const plants_sync = function () {}


plants_sync.prototype.plants_sync_func = function (req, res, callback) {

    console.log(req.body.T_PLANT, '----------');
    if (req.body.T_PLANT.length == 0) {
        res.status(500).json({
            "success": false,
            "message": "Error with endpoint"
        })
    } else {
        mysqlPool.getConnection(function (err, con) {
            con.beginTransaction(function (err) {
                if (err) {
                    throw err;
                } else {

                    req.body.T_PLANT.forEach(function (plant, index) {
                        console.log(plant.WERKS, index);


                        var insertQuery = `INSERT INTO plant_details_sync (plant_id, plant_name, storage_location, storage_location_desc, store, updated_at) VALUES ('${plant.WERKS}', '${plant.NAME1}', '${plant.LGORT}','${plant.LGOBE}', '${plant.STIND}', now() )`;


                        var updateQuery = `UPDATE plant_details_sync set plant_name = '${plant.NAME1}', storage_location = '${plant.LGORT}', storage_location_desc = '${plant.LGOBE}', store='${plant.STIND}',  updated_at = now() WHERE plant_id = '${plant.WERKS}' and storage_location = '${plant.LGORT}'`;

                        var insertSyncQuery = `INSERT INTO plant_detail (plant_id, plant_name, storage_location, storage_location_desc, store) VALUES ('${plant.WERKS}', '${plant.NAME1}', '${plant.LGORT}','${plant.LGOBE}', '${plant.STIND}')`;

                        con.query(insertSyncQuery, function (su_err, su_result) {
                            if (su_err) {
                                console.log(su_err);
                                con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                });

                            } else {

                                con.query(`SELECT * FROM plant_details_sync where plant_id = '${plant.WERKS}' and storage_location = '${plant.LGORT}'`, function (c_err, c_result) {
                                    if (c_err) {
                                        console.log(c_err);
                                        con.rollback(function () {
                                            con.release();
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                            })
                                        });
                                    } else if (c_result.length == 0) {

                                        con.query(insertQuery, function (i_err, i_result) {
                                            if (i_err) {
                                                console.log(i_err);
                                                con.rollback(function () {
                                                    con.release();
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint"
                                                    })
                                                });
                                            } else {
                                                console.log('------insert------');
                                                if (index == req.body.T_PLANT.length - 1) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            con.release();
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Plants updated successfully"
                                                            })
                                                        }, 1000);
                                                    })
                                                }
                                            }
                                        });
                                    } else {
                                        con.query(updateQuery, function (u_err, u_result) {
                                            if (u_err) {
                                                console.log(u_err);
                                                con.rollback(function () {
                                                    con.release();
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint"
                                                    })
                                                });

                                            } else {
                                                // con.release();

                                                console.log('------update------');
                                                if (index == req.body.T_PLANT.length - 1) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            con.release();
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Plants updated successfully"
                                                            })
                                                        }, 1000);
                                                    })
                                                }

                                            }
                                        });

                                    }
                                });

                            }
                        });
                    })
                }
            })
        })
    }
}

module.exports = new plants_sync()