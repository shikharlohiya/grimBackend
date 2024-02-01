const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const get_users = function () {}

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


get_users.prototype.get_users_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        con.query(`SELECT a.id, a.store_locations,a.location_id, a.manager_id, a.role_id, a.location_id, a.department, (SELECT department_name FROM departments WHERE id = a.department ) as department_name,a.sap_user_id as sap_id, a.designation,  (SELECT description FROM status WHERE value = a.status ) as status, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, a.first_name, a.last_name, a.lat, a.lng, a.pincode, a.city, a.state, a.country, a.mobile_no, a.email, a.address, a.gender, a.marital_status, DATE_FORMAT(a.dob, "%Y-%m-%d") as dob,  DATE_FORMAT(a.doj, "%Y-%m-%d") as doj, a.created_at, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location_desc', b.storage_location_desc)) AS 'user_location', (SELECT JSON_ARRAYAGG(c.location_id)) AS 'delivery_locations' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id LEFT JOIN user_locations as c ON c.user_id = a.id WHERE a.role_id in (2,3) GROUP BY a.id ORDER BY a.first_name`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
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
                    if (index == result.length - 1) {
                        setTimeout(function () {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "users": result
                            })
                        }, 200);
                    }
                })
            } else {
                con.release();
                res.status(200).json({
                    "success": true,
                    "users": []
                })
            }
        });
    })
}

module.exports = new get_users()
