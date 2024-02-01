const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const user_details = function () {}


user_details.prototype.user_details_func = function (req, res, callback) {
    // console.log(req.body);

    if (req.body.role_id == 3) {
        var orderQuery = `SELECT a.*,(SELECT department_name FROM departments WHERE id = a.department ) as department_name, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, (SELECT first_name  from user_details where id = a.manager_id) as reporting_to, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location_desc', b.storage_location_desc)) AS 'user_location', (SELECT JSON_ARRAYAGG(c.location_id)) AS 'delivery_locations' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id LEFT JOIN user_locations as c ON c.user_id = a.id WHERE a.id = ${req.body.user_id}`
    } else {
        var orderQuery = `SELECT a.*,(SELECT department_name FROM departments WHERE id = a.department ) as department_name, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location_desc', b.storage_location_desc)) AS 'user_location', (SELECT JSON_ARRAYAGG(c.location_id)) AS 'delivery_locations' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id LEFT JOIN user_locations as c ON c.user_id = a.id WHERE a.id = ${req.body.user_id}`
    }



    con.query(orderQuery, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else if (result.length > 0) {
            result[0].delivery_locations = JSON.parse(result[0].delivery_locations);
            result[0].store_locations = JSON.parse(result[0].store_locations);

            if (req.body.role_id == 3 || req.body.role_id == 2 || req.body.role_id == 19 || req.body.role_id == 5 || req.body.role_id == 7 || req.body.role_id == 8 || req.body.role_id == 9 || req.body.role_id == 11 || req.body.role_id == 12 || req.body.role_id == 13) {
                if (req.body.role_id == 5) {
                    result[0].sto_stores = JSON.parse(result[0].sto_stores);

                    var storeDeliveryQuery = `SELECT * FROM plant_details_sync where id in (${result[0].sto_stores.join()});SELECT * FROM plant_details_sync where id in (${result[0].store_locations.join()});`
                } else if (req.body.role_id == 11 || req.body.role_id == 12 || req.body.role_id == 13) {
                    var storeDeliveryQuery = `SELECT * FROM plant_details_sync where id in (${result[0].store_locations.join()});`
                } else {
                    var storeDeliveryQuery = `SELECT * FROM plant_details_sync where id in (${result[0].delivery_locations.join()}); SELECT * FROM plant_details_sync where id in (${result[0].store_locations.join()});`
                }


                con.query(storeDeliveryQuery, function (sderr, sdresult, fields) {
                    if (sderr) {
                        console.log(sderr);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": sderr
                        })
                    } else {
                        // console.log(sdresult);
                        if (req.body.role_id == 5) {

                            result[0].sto_plants = sdresult[0];
                            result[0].store_plants = sdresult[1];
                        } else if (req.body.role_id == 11 || req.body.role_id == 12 || req.body.role_id == 13) {

                            result[0].store_plants = sdresult;
                        } else {

                            result[0].delivery_plants = sdresult[0];
                            result[0].store_plants = sdresult[1];
                        }

                        res.status(200).json({
                            "success": true,
                            "user": result
                        })
                    }
                });
            } else {

                res.status(200).json({
                    "success": true,
                    "user": result
                })
            }
        } else {

            res.status(200).json({
                "success": true,
                "user": []
            })
        }
    });
}

module.exports = new user_details()