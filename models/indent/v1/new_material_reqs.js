const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const new_material_reqs = function () {}


new_material_reqs.prototype.new_material_reqs_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT a.*,  (SELECT JSON_OBJECT('id', b.id, 'user_id', b.user_id, 'name', b.name, 'vendor_name', b.vendor_name , 'mobile_no', b.mobile_no , 'address', b.address , 'remarks', b.remarks , 'is_verified', b.is_verified , 'manager_remarks', b.manager_remarks, 'created_at', b.created_at, 'status', b.status)) AS 'vendor_details', (SELECT JSON_OBJECT('id', c.id, 'material_type_sap_id', c.material_type_sap_id, 'material_type_sap_description', c.material_type_sap_description)) AS 'material_type' , (SELECT JSON_OBJECT('id', d.id, 'material_group_sap_id', d.material_group_sap_id, 'material_group_sap_description', d.material_group_sap_description)) AS 'material_group' ,(SELECT JSON_OBJECT('id', e.id, 'plant_id', e.plant_id, 'plant_name', e.plant_name, 'storage_loc', e.storage_location, 'storage_location_desc', e.storage_location_desc)) AS 'location', (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name  FROM new_product_request as a LEFT JOIN vendors as b ON a.vendor_id = b.id LEFT JOIN material_type_sync as c ON c.material_type_sap_id = a.product_type_id LEFT JOIN material_group_sync as d ON d.material_group_sap_id = a.product_group_id LEFT JOIN plant_details_sync as e ON e.id = a.location where a.user_id = ${req.body.user_id} ORDER BY a.id DESC`, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (result.length > 0) {
                    result.forEach((item, index) => {
                        result[index].vendor_details = JSON.parse(result[index].vendor_details);
                        result[index].material_type = JSON.parse(result[index].material_type);

                        result[index].material_group = JSON.parse(result[index].material_group);
                        result[index].location = JSON.parse(result[index].location);


                        if (index == result.length - 1) {
                            res.status(200).json({
                                "success": true,
                                "new_material_reqs": result
                            })
                        }
                    })
                } else {
                    res.status(200).json({
                        "success": true,
                        "new_material_reqs": []
                    })
                }

            }
        });
    })
}

module.exports = new new_material_reqs()