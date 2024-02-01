const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const compounds = function () { }

compounds.prototype.compounds_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_compounds`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                res.status(200).json({
                    "success": true,
                    "compounds": uresult
                })
            }
        });
    })
}

compounds.prototype.compounds_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT * FROM brill_compounds where name = '${req.body.name}'`, function (serr, sresult, fields) {
            if (serr) {
                console.log(serr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (sresult.length == 0) {
                    con.query(`INSERT INTO brill_compounds (name, description, createdBy) VALUES ('${req.body.name}','${req.body.description}', ${req.body.user_id})`, function (uerr, uresult, fields) {
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
                        "message": "Compound already exist...!"
                    })
                }
            }
        });
    })
}

compounds.prototype.compounds_put_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_compounds SET name = '${req.body.name}', description = '${req.body.description}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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

compounds.prototype.compounds_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_compounds SET status = '${req.body.status}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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
module.exports = new compounds()