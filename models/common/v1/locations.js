const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const locations = function () {}


locations.prototype.locations_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT id, plant_id, plant_name, storage_location, storage_location_desc, store, created_at, updated_at  FROM plant_details_sync ORDER BY storage_location_desc`, function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "locations": result
                })
            }
        });
    })
}


locations.prototype.delivery_locations_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT id, plant_id, plant_name, storage_location, storage_location_desc, store, created_at, updated_at  FROM plant_details_sync where store  = '' ORDER BY storage_location_desc`, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "locations": result
                })
            }
        });
    })
}

locations.prototype.store_locations_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT id, plant_id, plant_name, storage_location as storage_loc, storage_location_desc, store, created_at, updated_at  FROM plant_details_sync where store  = 'X' ORDER BY storage_location_desc`, function (err, result, fields) {
            if (err) {
                console.log(err);
                
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "locations": result
                })
            }
        });
    })
}

locations.prototype.user_locations_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.query);
        con.query(`SELECT location_id FROM user_locations where user_id  = ${req.query.id}`, function (uerr, uresult, fields) {
            if (uerr) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(uresult);

                var idsArray = uresult.map(({
                    location_id
                }) => location_id);
                if (idsArray.length > 0) {

                    con.query(`SELECT id, plant_id, plant_name, storage_location as storage_loc, storage_location_desc, store, created_at, updated_at  FROM plant_details_sync  where id in (${idsArray.join()})  ORDER BY storage_location_desc`, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            console.log(result);

                            res.status(200).json({
                                "success": true,
                                "locations": result
                            })
                        }
                    });
                } else {
                    res.status(200).json({
                        "success": true,
                        "locations": []
                    })
                }
            }
        });
    })
}

locations.prototype.user_store_locations_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.query);
        con.query(`SELECT store_locations FROM user_details where id  = ${req.query.id}`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(uresult);

                var idsArray = uresult.map(({
                    store_locations
                }) => store_locations);
                console.log(idsArray);

                idsArray = JSON.parse(idsArray)
                
                if (idsArray.length > 0) {

                    con.query(`SELECT id, plant_id, plant_name, storage_location as storage_loc, storage_location_desc, store, created_at, updated_at  FROM plant_details_sync  where id in (${idsArray.join()})  ORDER BY storage_location_desc`, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            console.log(result);

                            res.status(200).json({
                                "success": true,
                                "locations": result
                            })
                        }
                    });
                } else {
                    res.status(200).json({
                        "success": true,
                        "locations": []
                    })
                }
            }
        });
    })
}

module.exports = new locations()