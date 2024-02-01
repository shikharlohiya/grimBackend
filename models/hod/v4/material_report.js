const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const material_report = function () {}


material_report.prototype.material_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        var materialArray = [];
        var filterStatus = ''
        if (req.body.indent_status.length == 0) {
            filterStatus += ''

        } else {
            filterStatus += `AND a.status in (${req.body.indent_status.join()})`

        }

        con.query(`SELECT id FROM user_details where hod =  ${req.body.user_id}`, function (m_err, m_result, fields) {
            if (m_err) {
                con.release();
                console.log(m_err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                var idsArray = m_result.map(({
                    id
                }) => id);
                idsArray.push(req.body.user_id);

                con.query(`SELECT a.product_id, MAX(a.quantity) as max_qty, MIN(a.quantity) as min_qty, MAX(a.created_at) as last_indent_created_at,  (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_group_sap_id FROM material_items WHERE id = a.product_id ) as material_group_sap_id , (SELECT material_type_sap_id FROM material_items WHERE id = a.product_id ) as material_type_sap_id ,(SELECT material_sap_id FROM material_items WHERE id = a.product_id ) as product_sap_id , sum(a.quantity)as quantity, count(id) as indent_quantity, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_loc', storage_location, 'name1', storage_location_desc) FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders WHERE id = a.order_id )) AS 'store_location' FROM user_indents as a WHERE a.user_id in (${idsArray.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ${filterStatus} GROUP BY a.product_id, store_location ORDER BY a.product_id`, function (i_err, i_result, fields) {
                    if (i_err) {
                        console.log(i_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else if (i_result.length > 0) {

                        i_result.forEach((item, index) => {
                            i_result[index].store_location = JSON.parse(i_result[index].store_location);
                            con.query(`SELECT quantity,  updated_at, price FROM material_stock WHERE material_id = ${item.product_sap_id} AND plant_id = '${item.store_location.plant_id}' AND storage_loc = '${item.store_location.storage_loc}' LIMIT 1`, function (is_err, is_result, fields) {
                                if (is_err) {
                                    console.log(is_err);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                                    i_result[index].stock = is_result[0].quantity;
                                    i_result[index].stock_updated_at = is_result[0].updated_at;
                                    i_result[index].price = is_result[0].price;

                                    if (index == i_result.length - 1) {

                                        console.log('-----------done');
                                        con.release();
                                        res.status(200).json({
                                            "success": true,
                                            "products": i_result
                                        })

                                    }
                                }
                            });
                        })
                    } else {
                        con.release();
                        res.status(200).json({
                            "success": true,
                            "products": []
                        })
                    }
                });
            }
        })
    })
}

module.exports = new material_report()