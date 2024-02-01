const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const plant_types = function () { }

plant_types.prototype.plant_types_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_plant_types`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                res.status(200).json({
                    "success": true,
                    "plant_types": uresult
                })
            }
        });
    })
}

plant_types.prototype.plant_types_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT * FROM brill_plant_types where name = '${req.body.name}'`, function (serr, sresult, fields) {
            if (serr) {
                console.log(serr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (sresult.length == 0) {
                    con.query(`INSERT INTO brill_plant_types (name, description, createdBy) VALUES ('${req.body.name}','${req.body.description}', ${req.body.user_id})`, function (uerr, uresult, fields) {
                        if (uerr) {
                            console.log(uerr);
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": uerr
                            })
                        } else {
                            // console.log(uresult);
                            res.status(200).json({
                                "success": true,
                                "data": uresult
                            })
                        }
                    });

                } else {
                    res.status(500).json({
                        "success": false,
                        "message": "Plant Type already exist...!"
                    })
                }
            }
        });
    })
}

plant_types.prototype.plant_types_put_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_plant_types SET name = '${req.body.name}', description = '${req.body.description}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": uerr
                })
            } else {
                // console.log(uresult);
                res.status(200).json({
                    "success": true,
                    "data": uresult
                })
            }
        });
    })
}

plant_types.prototype.plant_types_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_plant_types SET status = '${req.body.status}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": uerr
                })
            } else {
                // console.log(uresult);
                res.status(200).json({
                    "success": true,
                    "data": uresult
                })
            }
        });
    })
}
module.exports = new plant_types()