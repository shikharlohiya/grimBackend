const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const roles = function () { }

roles.prototype.roles_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_roles`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (uresult.length > 0) {
                    uresult.forEach(function (role, index) {
                        uresult[index].privileges = JSON.parse(uresult[index].privileges)[0].split(",");
                        if (index == uresult.length - 1) {
                            res.status(200).json({
                                "success": true,
                                "roles": uresult
                            })
                        }
                    })


                } else {
                    res.status(200).json({
                        "success": true,
                        "roles": uresult
                    })
                }
                // console.log(uresult);

            }
        });
    })
}

roles.prototype.roles_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

        con.query(`INSERT INTO brill_roles (role, privileges) VALUES ('${req.body.name}',JSON_ARRAY(${req.body.privileges}))`, function (uerr, uresult, fields) {
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

roles.prototype.roles_put_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_roles SET role = '${req.body.role}', privileges = JSON_ARRAY('${req.body.privileges}') WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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

roles.prototype.roles_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE brill_roles SET status = '${req.body.status}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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
module.exports = new roles()