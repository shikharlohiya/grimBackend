const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_type_sync = function () {}


material_type_sync.prototype.material_type_sync_func = function (req, res, callback) {

    console.log(req.body.T_MAT_TYPE, '----------');
    if (req.body.T_MAT_TYPE.length == 0) {
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

                    req.body.T_MAT_TYPE.forEach(function (material_type, index) {
                        console.log(material_type.MTART, index);

                        var insertQuery = `INSERT INTO material_type_sync (material_type_sap_id, material_type_sap_description, updated_at) VALUES ('${material_type.MTART}', '${material_type.MTBEZ}', now() )`;


                        var updateQuery = `UPDATE material_type_sync set material_type_sap_description = '${material_type.MTBEZ}',   updated_at = now() WHERE material_type_sap_id = '${material_type.MTART}'`;

                        var insertSyncQuery = `INSERT INTO material_type (material_type_sap_id, material_type_sap_description) VALUES ('${material_type.MTART}', '${material_type.MTBEZ}')`;

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

                                con.query(`SELECT * FROM material_type_sync where material_type_sap_id = '${material_type.MTART}'`, function (c_err, c_result) {
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
                                                // con.release();

                                                console.log('------insert------');
                                                if (index == req.body.T_MAT_TYPE.length - 1) {
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
                                                                "message": "Material_types updated successfully"
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
                                                if (index == req.body.T_MAT_TYPE.length - 1) {
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
                                                                "message": "Material_types updated successfully"
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

module.exports = new material_type_sync()