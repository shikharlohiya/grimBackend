const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const wbs_numbers_sync = function () {}


wbs_numbers_sync.prototype.wbs_numbers_sync_func = function (req, res, callback) {

    console.log(req.body.T_WBS, '----------');
    if (req.body.T_WBS.length == 0) {
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

                    req.body.T_WBS.forEach(function (wbs, index) {
                        var insertQuery = `INSERT INTO wbs_numbers (wbs_number, wbs_desc, budget, actual, balance) VALUES ('${wbs.POSID}', '${wbs.POST1}', '${wbs.BUDGET}', '${wbs.ACTUAL}', '${wbs.BALANCE}')`;


                        var updateQuery = `UPDATE wbs_numbers set  wbs_desc = '${wbs.POST1}', budget= '${wbs.BUDGET}' , actual= '${wbs.ACTUAL}' , balance= '${wbs.BALANCE}' WHERE wbs_number = '${wbs.POSID}'`;

                        var insertSyncQuery = `INSERT INTO wbs_numbers_sync (wbs_number, wbs_desc, budget, actual, balance) VALUES ('${wbs.POSID}', '${wbs.POST1}', '${wbs.BUDGET}', '${wbs.ACTUAL}', '${wbs.BALANCE}')`;

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

                                con.query(`SELECT * FROM wbs_numbers where wbs_number = '${wbs.POSID}'`, function (c_err, c_result) {
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
                                                if (index == req.body.T_WBS.length - 1) {
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
                                                                "message": "WBS updated successfully"
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
                                                console.log('------update------');
                                                if (index == req.body.T_WBS.length - 1) {
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
                                                                "message": "WBS updated successfully"
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

module.exports = new wbs_numbers_sync()