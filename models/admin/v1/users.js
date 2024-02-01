const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const users = function () {}

var da = new Date();
var date =
    da.getFullYear() +
    "-" +
    ("0" + (da.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + da.getDate()).slice(-2) +
    " " +
    ("0" + da.getHours()).slice(-2) +
    ":" +
    ("0" + da.getMinutes()).slice(-2) +
    ":" +
    ("0" + da.getSeconds()).slice(-2);


users.prototype.users_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body.status.length);
        var query = '';
        if (req.body.status.length == 0) {
            query += '';
        } else {
            query += ` AND a.status  IN  (${req.body.status.join()})`
        }

        if (req.body.role_id.length == 0) {
            query += '';
        } else {
            query += ` AND a.role_id IN (${req.body.role_id.join()})`
        }

        if (req.body.department.length == 0) {
            query += '';
        } else {
            query += ` AND a.department IN (${req.body.department.join()})`
        }

        if ((req.body.from_date == undefined) && (req.body.to_date == undefined)) {
            query += '';
        } else {
            query += ` AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')`
        }

        console.log('query:', query);

        con.query(`SELECT a.id, a.store_locations,a.location_id, a.manager_id, a.role_id, a.location_id, a.department, (SELECT department_name FROM departments WHERE id = a.department ) as department_name,a.sap_user_id as sap_id, a.designation,  (SELECT description FROM status WHERE value = a.status ) as status, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, a.first_name, a.last_name, a.lat, a.lng, a.pincode, a.city, a.state, a.country, a.mobile_no, a.email, a.address, a.gender, a.marital_status, DATE_FORMAT(a.dob, "%Y-%m-%d") as dob,  DATE_FORMAT(a.doj, "%Y-%m-%d") as doj, a.created_at, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location_desc', b.storage_location_desc)) AS 'user_location', (SELECT JSON_ARRAYAGG(c.location_id)) AS 'delivery_locations' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id LEFT JOIN user_locations as c ON c.user_id = a.id WHERE a.id != 1 ${query} GROUP BY a.id ORDER BY a.id DESC`, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((item, index) => {
                    console.log(item.user_locations, index);
                    var location = JSON.parse(item.user_location);
                    result[index].user_location = location;
                    result[index].delivery_locations = JSON.parse(item.delivery_locations).filter(Boolean);
                    result[index].store_locations = JSON.parse(item.store_locations);


                    // var locations = JSON.parse(item.user_locations).join();

                    // if (JSON.parse(item.user_locations)[0] != null) {
                    //     con.query(`SELECT id,  plant_id, name1 FROM plant_details WHERE id  IN (${locations})`, function (i_err, i_result, fields) {
                    //         if (i_err) {
                    //             console.log(i_err);
                    //             res.status(500).json({
                    //                 "success": false,
                    //                 "message": "Error with endpoint"
                    //             })
                    //         } else {
                    //             result[index].user_locations = i_result;
                    //         }
                    //     });
                    // } else {
                    //     result[index].user_locations = [];
                    // }
                    if (index == result.length - 1) {
                        setTimeout(function () {
                            res.status(200).json({
                                "success": true,
                                "users": result
                            })
                        }, 500);
                    }
                })
            } else {
                res.status(200).json({
                    "success": true,
                    "users": []
                })
            }
        });
    })
}

users.prototype.users_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT id,  product_id, order_id FROM user_indents WHERE user_id =${req.body.user_id} AND status in (1,2,5)`, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                res.status(200).json({
                    "success": false,
                    "message": "You con't Disabled this user Because this user have some indents...!"
                })
            } else {
                con.query(`UPDATE user_details set status = ${req.body.status} WHERE id = ${req.body.user_id}`, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        if (req.body.status == 1) {
                            var message = "User Enabled Successfully";
                        } else {
                            var message = "User Disabled Successfully";

                        }
                        res.status(200).json({
                            "success": true,
                            "message": message
                        })
                    }
                });
            }
        });
    })
}

users.prototype.users_update_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {


        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body);
                var user = req.body.user;
                user.doj = req.body.user.doj || null;

                user.manager_id = req.body.user.manager_id || null;
                user.last_name = req.body.user.last_name || null;
                user.location_id = req.body.user.location_id || null;
                if (user.first_name != undefined && user.role_id != undefined && user.email != undefined) {

                    con.query(`UPDATE user_details SET first_name = '${user.first_name}', last_name = '${user.last_name}', role_id = ${user.role_id}, manager_id = ${user.manager_id}, email = '${user.email}', mobile_no = '${user.mobile_no}', location_id = ${user.location_id}, address = '${user.address}', department = '${user.department}', sap_user_id = '${user.sap_id}', designation = '${user.designation}',doj = '${user.doj}', marital_status = '${user.marital_status}', gender = '${user.gender}', store_locations = JSON_ARRAY(${user.store_locations}),  updated_at = now() WHERE id = ${user.user_id}`, function (uerr, uresult) {
                        if (uerr) {
                            console.log(uerr);
                            con.rollback(function () {
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            });
                        } else {
                            con.query(`DELETE FROM user_locations WHERE user_id = ${user.user_id}`, function (hterr, htresult) {
                                if (hterr) {} else {
                                    console.log(htresult);
                                    if (user.delivery_locations == undefined  || user.delivery_locations.length == 0) {
                                        con.commit(function (err) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                            res.status(200).json({
                                                "success": true,
                                                "message": "User Details Updated Successfully"
                                            })
                                        });
                                    } else {
                                        con.query('INSERT INTO user_locations (user_id, location_id, created_by, created_at) VALUES ?',
                                            [user.delivery_locations.map(location => [user.user_id, location, 1, date])],
                                            function (l_err, l_result) {
                                                if (l_err) {
                                                    console.log(l_err);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint"
                                                        })
                                                    });
                                                } else {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            connection.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        res.status(200).json({
                                                            "success": true,
                                                            "message": "User Details Updated Successfully"
                                                        })
                                                    });
                                                }
                                            });
                                    }
                                }
                            });

                           

                        }

                    });
                } else {
                    res.status(400).json({
                        "success": false,
                        "message": "Error while updating user details...!"
                    })
                }
            }
        })
    })
}

module.exports = new users()