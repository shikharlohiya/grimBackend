const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const pr_report = function () {}



pr_report.prototype.pr_report_func = function (req, res, callback) {

    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        var indentsArrays = []

        if (req.body.location_id.length == 0) {
            var loc_filter = ""
        } else {
            var loc_filter = `AND e.address in (${req.body.location_id.join()})`
        }
        con.query(`SELECT role_id FROM user_details WHERE id = ${req.body.user_id}`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {

                if (uresult[0].role_id == 5) {
                    var filter_query = `a.created_by = ${req.body.user_id} AND`;
                } else {
                    var filter_query = "";

                }

                con.query(`SELECT a.*, b.name, b.material_sap_id, b.image_url, b.base_unit, b.material_group_sap_id, b.material_type_sap_id, (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, (SELECT color FROM order_status WHERE value = a.status ) as color FROM purchase_requests as a JOIN material_items as b ON a.product_id = b.id WHERE ${filter_query} (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ORDER BY a.created_at DESC`, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else if (result.length > 0) {
                        result.forEach((item, index) => {
                            con.query(`SELECT   a.*, (SELECT pr_qty FROM PR_items WHERE indent_id = a.id limit 1) as pr_qty, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id ) ) as department_name,(SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT first_name FROM user_details WHERE id = (SELECT manager_id FROM user_details WHERE id = a.created_by ) ) as manager_name, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_loc', storage_location, 'plant_name', plant_name, 'name1', storage_location_desc) FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders WHERE id = a.order_id )) AS 'store_location', (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_loc', storage_location, 'plant_name', plant_name, 'name1', storage_location_desc) FROM plant_details_sync WHERE id = (SELECT address FROM user_orders WHERE id = a.order_id )) AS 'delivery_location' FROM user_indents as a WHERE id in  (${JSON.parse(item.indent_ids).join()}) ORDER BY a.created_at DESC`, function (i_err, i_result, fields) {
                                if (i_err) {
                                    console.log(i_err);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                                    i_result[0].delivery_location = JSON.parse(i_result[0].delivery_location)
                                    i_result[0].store_location = JSON.parse(i_result[0].store_location)
                                    i_result[0].pr_data = item
                                    // result[index].indents = i_result;
                                    indentsArrays = indentsArrays.concat(i_result);
                                    if (index == result.length - 1) {

                                        res.status(200).json({
                                            "success": true,
                                            "result": indentsArrays
                                        })

                                    }
                                }
                            });
                        })
                    } else {

                        res.status(200).json({
                            "success": true,
                            "result": []
                        })
                    }
                });
            }
        })
    })
}

module.exports = new pr_report()