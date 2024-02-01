const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const cptp_groups = function () { }

cptp_groups.prototype.cptp_groups_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT a.*,  (SELECT JSON_OBJECT('id', b.id, 'name', b.name)) AS 'compound', (SELECT JSON_OBJECT('id', c.id, 'name', c.name)) AS 'plant_type'  FROM brill_cptp_groupings as a LEFT JOIN brill_compounds as b ON a.compound = b.id LEFT JOIN brill_plant_types as c ON a.plant_type = c.id`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (uresult.length > 0) {
                    uresult.forEach(function (role, index) {
                        uresult[index].compound = JSON.parse(uresult[index].compound);
                        uresult[index].plant_type = JSON.parse(uresult[index].plant_type);

                        if (index == uresult.length - 1) {

                            res.status(200).json({
                                "success": true,
                                "cptp_groupings": uresult
                            })
                        }
                    })


                } else {

                    res.status(200).json({
                        "success": true,
                        "cptp_groupings": uresult
                    })
                }
            }
        });
    })
}

cptp_groups.prototype.cptp_groups_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT * FROM brill_cptp_groupings where compound = '${req.body.compound}' and plant_type = '${req.body.plant_type}' and plant = '${req.body.plant}'`, function (serr, sresult, fields) {
            if (serr) {
                console.log(serr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (sresult.length == 0) {
                    con.query(`INSERT INTO brill_cptp_groupings (compound, plant_type, plant, createdBy) VALUES ('${req.body.compound}','${req.body.plant_type}', '${req.body.plant}', '${req.body.user_id}')`, function (uerr, uresult, fields) {
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
                        "message": "Grouping already exist...!"
                    })
                }
            }
        });
    })
}

cptp_groups.prototype.cptp_groups_put_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

        con.query(`SELECT * FROM brill_cptp_groupings where compound = '${req.body.compound.id}' and plant_type = '${req.body.plant_type.id}' and plant = '${req.body.plant}'`, function (serr, sresult, fields) {
            if (serr) {
                console.log(serr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (sresult.length == 0) {
                    con.query(`UPDATE brill_cptp_groupings SET compound = '${req.body.compound.id}', plant_type = '${req.body.plant_type.id}', plant = '${req.body.plant}' WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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
                        "message": "Grouping already exist...!"
                    })
                }
            }
        });

        
    })
}

cptp_groups.prototype.cptp_groups_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`DELETE FROM brill_cptp_groupings WHERE id = ${req.body.id}`, function (uerr, uresult, fields) {
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
module.exports = new cptp_groups()