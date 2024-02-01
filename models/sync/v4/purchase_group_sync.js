const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const purchase_group_sync = function () {}


purchase_group_sync.prototype.purchase_group_sync_func = function (req, res, callback) {

    console.log(req.body.T_PUR_GROUP, '----------');
    if (req.body.T_PUR_GROUP.length == 0) {
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

                    req.body.T_PUR_GROUP.forEach(function (purchase_group, index) {
                        console.log(purchase_group.MATKL, index);
                        var insertQuery = `INSERT INTO purchase_group (purchase_group_id, purchase_group_desc) VALUES ( '${purchase_group.EKGRP}', '${purchase_group.EKNAM}')`;


                        var updateQuery = `UPDATE purchase_group set purchase_group_desc = '${purchase_group.EKNAM}' WHERE purchase_group_id = '${purchase_group.EKGRP}'`;

                        con.query(`SELECT * FROM purchase_group where purchase_group_id = '${purchase_group.EKGRP}'`, function (c_err, c_result) {
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
                                        if (index == req.body.T_PUR_GROUP.length - 1) {
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
                                                        "message": "purchase_groups updated successfully"
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
                                        if (index == req.body.T_PUR_GROUP.length - 1) {

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
                                                        "message": "purchase_groups updated successfully"
                                                    })
                                                }, 1000);
                                            })
                                        }

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

module.exports = new purchase_group_sync()