const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const indent_line_item_report = function () { }


indent_line_item_report.prototype.indent_line_item_report_func = function (req, res, callback) {
    var da = new Date();
    var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);
    var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        var numPerPage = req.body.npp;
        var page = (req.body.page) - 1;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;
        var filterStatus = ''
        var filtersStatus = ''

        if (req.body.indent_status.length == 0) {
            filterStatus += ''
            filtersStatus += ''


        } else {
            filterStatus += `and a.status in (${req.body.indent_status.join()})`
            filtersStatus += `and status in (${req.body.indent_status.join()})`

        }
        if (req.body.report_type == undefined) {
            filterStatus += ''
            filtersStatus += ''

        } else {
            filterStatus += `and a.remaining_qty > 0`
            filtersStatus += `and remaining_qty > 0`

        }

        if (req.body.npp == undefined) {
            var limitFilter = ""
        } else {
            var limitFilter = `Limit ${limit}`
        }

        if (req.body.search != undefined && req.body.search != "") {
            var search = `AND (a.id = ${req.body.search} OR (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.product_id = (SELECT id FROM material_items WHERE material_sap_id = ${req.body.search})) > 0)`;
        } else {
            var search = '';
        }

        con.query(`SELECT * FROM user_details where id =  ${req.body.user_id}`, function (r_err, r_result, fields) {
            if (r_err) {

                console.log(r_err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": r_err
                })
            } else {
                if (r_result[0].role_id == 2) {
                    var query = `SELECT id FROM user_details where manager_id =  ${req.body.user_id}`
                } else {
                    var query = `SELECT id FROM user_details where manager2 =  ${req.body.user_id}`

                }
                con.query(query, function (m_err, m_result, fields) {
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

                        if (req.body.location_id.length == 0) {
                            var orderQuery = `SELECT SQL_CALC_FOUND_ROWS a.*,(SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, (SELECT count(id) FROM user_indents WHERE order_id =a.id ${filtersStatus}) as indent_count ,(SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ${search} HAVING indent_count > 0  ORDER BY id DESC; SELECT FOUND_ROWS() as total;`
                            console.log(orderQuery, '---------');


                        } else {
                            var orderQuery = `SELECT SQL_CALC_FOUND_ROWS a.*,(SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, (SELECT count(id) FROM user_indents WHERE order_id =a.id ${filtersStatus}) as indent_count, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) AND a.plant_id in (${req.body.location_id.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') and ${search} HAVING indent_count > 0 ORDER BY id DESC; SELECT FOUND_ROWS() as total;`

                        }

                        con.query(orderQuery, function (err, result, fields) {
                            if (err) {
                                console.log(err);
                                con.release();
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else if (result[0].length > 0) {
                                var idsArray = result[0].map(({
                                    id
                                }) => id);
                                con.query(`SELECT SQL_CALC_FOUND_ROWS a.id, DATEDIFF('${date}', date(created_at)) AS days,(SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, (SELECT first_name FROM user_details WHERE id = (SELECT manager_id FROM user_details WHERE id = a.user_id) ) as manager_name,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_group_sap_id FROM material_items WHERE id = a.product_id ) as material_group_sap_id , (SELECT material_type_sap_id FROM material_items WHERE id = a.product_id ) as material_type_sap_id ,(SELECT material_sap_id FROM material_items WHERE id = a.product_id ) as product_sap_id , a.quantity, a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.intial_qty, a.remaining_qty, a.closed, a.created_at,(select created_at FROM order_status_logs where indent_id = a.id and status = 2 limit 1) as approved_at, a.created_by, a.s_no FROM user_indents as a WHERE a.order_id in (${idsArray.join()}) ${filterStatus} order by id desc ${limitFilter}; SELECT FOUND_ROWS() as total;`, function (i_err, i_result, fields) {
                                    if (i_err) {
                                        console.log(i_err);
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    } else {
                                        result[0].forEach((item, index) => {

                                            result[0][index].address = JSON.parse(result[0][index].address);
                                            result[0][index].store_address = JSON.parse(result[0][index].store_address);

                                            if (index == result[0].length - 1) {
                                                i_result[0].forEach((lineitem, i) => {
                                                    let order = result[0].filter(e => e.id = lineitem.order_id);
                                                    i_result[0][i].order = order[0];
                                                    if (i == i_result[0].length - 1) {
                                                        var responsePayload = {
                                                            totalItems: i_result[1][0].total,
                                                            result: i_result[0]
                                                        };
                                                        con.release();
                                                        setTimeout(function () {
                                                            res.status(200).json({
                                                                "success": true,
                                                                "orders": responsePayload
                                                            })
                                                        }, 10)
                                                    }

                                                })
                                            }

                                        })
                                    }
                                });
                            } else {
                                con.release();
                                res.status(200).json({
                                    "success": true,
                                    "orders": {
                                        "result": [],
                                        "totalItems": 0
                                    }
                                })
                            }
                        });
                    }
                })
            }
        })
    })
}

module.exports = new indent_line_item_report()