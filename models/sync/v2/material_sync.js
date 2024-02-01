const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_sync = function () {}


material_sync.prototype.material_sync_func = function (req, res, callback) {

    console.log(req.body.T_MATERIAL, '----------');
    if (req.body.T_MATERIAL.length == 0) {
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

                    req.body.T_MATERIAL.forEach(function (material, index) {
                        //   console.log(material.MATNR, index);

                        var material_name = material.MAKTX.replace(/'/g, '"');
                        // console.log(material_name, index);

                        var insertQuery = `INSERT INTO material_items (material_sap_id, name, base_unit, material_type_sap_id, material_group_sap_id, tech_spec, updated_at) VALUES (${material.MATNR}, '${material_name}', '${material.MEINS}','${material.MTART}', '${material.MATKL}', '${material.TECHN}', now() )`;


                        var updateQuery = `UPDATE material_items set name = '${material_name}', base_unit = '${material.MEINS}', material_type_sap_id = '${material.MTART}', material_group_sap_id='${material.MATKL}', tech_spec = '${material.TECHN}',  updated_at = now() WHERE material_sap_id = ${material.MATNR}`;


                        var insertSyncQuery = `INSERT INTO material_items_sync (material_sap_id, name, base_unit, material_type_sap_id, material_group_sap_id, tech_spec) VALUES (${material.MATNR}, '${material_name}', '${material.MEINS}','${material.MTART}', '${material.MATKL}', '${material.TECHN}' )`;

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

                                con.query(`SELECT * FROM material_items where material_sap_id = ${material.MATNR}`, function (c_err, c_result) {
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
                                                // con.release();
                                            } else {
                                                // con.release();

                                                console.log('------insert------', insertQuery);
                                                if (index == req.body.T_MATERIAL.length - 1) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            connection.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            con.release();
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Materials updated successfully"
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

                                                console.log('------update------', updateQuery);



                                                if (index == req.body.T_MATERIAL.length - 1) {
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
                                                                "message": "Materials updated successfully"
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

module.exports = new material_sync()