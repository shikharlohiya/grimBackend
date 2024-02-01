const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_group_sync = function () {}


material_group_sync.prototype.material_group_sync_func = function (req, res, callback) {

    console.log(req.body.T_MAT_GROUP, '----------');
    if (req.body.T_MAT_GROUP.length == 0) {
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

                    req.body.T_MAT_GROUP.forEach(function (material_group, index) {
                        console.log(material_group.MATKL, index);
                        var insertQuery = `INSERT INTO material_group_sync (material_group_sap_id, material_group_sap_description, updated_at) VALUES ('${material_group.MATKL}', '${material_group.WGBEZ}', now() )`;


                        var updateQuery = `UPDATE material_group_sync set material_group_sap_description = '${material_group.WGBEZ}',   updated_at = now() WHERE material_group_sap_id = '${material_group.MATKL}'`;

                        var insertSyncQuery = `INSERT INTO material_group (material_group_sap_id, material_group_sap_description) VALUES ('${material_group.MATKL}', '${material_group.WGBEZ}')`;

                        con.query(insertSyncQuery, function (su_err, su_result) {
                            if (su_err) {
                                console.log(su_err);
                                con.rollback(function () {
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                });

                            } else {

                                con.query(`SELECT * FROM material_group_sync where material_group_sap_id = '${material_group.MATKL}'`, function (c_err, c_result) {
                                    if (c_err) {
                                        console.log(c_err);
                                        con.rollback(function () {
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
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint"
                                                    })
                                                });
                                            } else {
                                                console.log('------insert------');
                                                if (index == req.body.T_MAT_GROUP.length - 1) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            connection.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Material_groups updated successfully"
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
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint"
                                                    })
                                                });

                                            } else {

                                                console.log('------update------');
                                                if (index == req.body.T_MAT_GROUP.length - 1) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            connection.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(() => {
                                                            res.status(200).json({
                                                                "sucess": true,
                                                                "message": "Material_groups updated successfully"
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

module.exports = new material_group_sync()