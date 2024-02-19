const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database


const indent_report = function () {}


indent_report.prototype.indent_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        var da = new Date();
        var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);
        var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
        // console.log(req.body);
        var numRows;
        var indentsArray = [];
        var numPerPage = req.body.npp;
        var page = (req.body.page) - 1;
        var numPages;
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

                        console.log(m_err);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": m_err
                        })
                    } else {
                        var idsArray = m_result.map(({
                            id
                        }) => id);
                        idsArray.push(req.body.user_id);
                        if (req.body.location_id.length == 0) {
                            var orderQuery = `SELECT a.*,(SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filtersStatus}) as indent_count ,(SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) AND a.type='indent' AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ${search} HAVING indent_count > 0  ORDER BY id DESC ${limitFilter}`
                            // console.log(orderQuery, '---------');


                        } else {
                            var orderQuery = `SELECT a.*,(SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filtersStatus}) as indent_count, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) and a.type='indent' AND a.address in (${req.body.location_id.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ${search} HAVING indent_count > 0 ORDER BY id DESC ${limitFilter}`

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

                                result.forEach((item, index) => {

                                    result[index].address = JSON.parse(result[index].address);
                                    result[index].store_address = JSON.parse(result[index].store_address);
                                    con.query(`SELECT a.id, CONVERT(a.id, CHAR(50)) as id_string, DATEDIFF('${date}', date(created_at)) AS days,(SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, (SELECT first_name FROM user_details WHERE id = (SELECT manager_id FROM user_details WHERE id = a.user_id) ) as manager_name, (SELECT first_name FROM user_details WHERE id = (SELECT manager2 FROM user_details WHERE id = a.user_id) ) as sub_hod_name,(SELECT first_name FROM user_details WHERE id = (SELECT hod FROM user_details WHERE id = a.user_id) ) as hod_name,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_group_sap_id FROM material_items WHERE id = a.product_id ) as material_group_sap_id , (SELECT material_type_sap_id FROM material_items WHERE id = a.product_id ) as material_type_sap_id ,(SELECT material_sap_id FROM material_items WHERE id = a.product_id ) as product_sap_id , a.quantity, a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, (SELECT email FROM user_details WHERE id = a.user_id ) as email, (SELECT mobile_no FROM user_details WHERE id = a.user_id ) as mobile_no, (SELECT department_name FROM departments WHERE id = (SELECT department FROM user_details WHERE id = a.user_id) ) as department, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.intial_qty, a.remaining_qty, a.closed, a.created_at, a.created_by, a.s_no, (select created_at FROM order_status_logs where indent_id = a.id and status = 2 and role_id = 2 limit 1) as manager_approved_at,(select created_at FROM order_status_logs where indent_id = a.id and status = 2 and role_id = 19 limit 1) as sub_hod_approved_at,(select created_at FROM order_status_logs where indent_id = a.id and status = 2 and role_id = 7 limit 1) as hod_approved_at, (select created_at FROM order_status_logs where indent_id = a.id and status = 2 and role_id = 11 limit 1) as req_manager_approved_at,(select created_at FROM order_status_logs where indent_id = a.id and status = 3 and role_id = 11 limit 1) as req_manager_rejected_at,(select created_at FROM order_status_logs where indent_id = a.id and status = 22 and role_id = 11 limit 1) as req_manager_hold_at,(select remarks FROM order_status_logs where indent_id = a.id and status = 2 and role_id = 11 limit 1) as req_manager_approved_remarks,(select remarks FROM order_status_logs where indent_id = a.id and status = 3 and role_id = 11 limit 1) as req_manager_rejected_remarks,(select remarks FROM order_status_logs where indent_id = a.id and status = 22 and role_id = 11 limit 1) as req_manager_hold_remarks, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5) as issued_qty, (select created_at FROM order_status_logs where indent_id = a.id and status = 7 limit 1) as pr_requested_at,(select remarks FROM order_status_logs where indent_id = a.id and status = 7  limit 1) as pr_requested_remarks,(select created_at FROM order_status_logs where indent_id = a.id and status = 18 limit 1) as pr_cancelled_at,(select remarks FROM order_status_logs where indent_id = a.id and status = 18  limit 1) as pr_cancelled_remarks,(select created_at FROM order_status_logs where indent_id = a.id and status = 17 limit 1) as pr_rejected_at,(select remarks FROM order_status_logs where indent_id = a.id and status = 17 limit 1) as pr_rejected_remarks,(select qty FROM order_status_logs where indent_id = a.id and status = 7  limit 1) as pr_requested_qty,  (select sap_ref_id FROM order_status_logs where indent_id = a.id and status = 7 and sap_ref_id is not null limit 1) as pr_number, (select updated_at FROM order_status_logs where indent_id = a.id and status = 7 and sap_ref_id is not null limit 1) as pr_created_at, (select updated_at FROM order_status_logs where indent_id = a.id and status = 8 and sap_ref_id is not null limit 1) as PO_created_at, (select sap_ref_id FROM order_status_logs where indent_id = a.id and status = 8 and sap_ref_id is not null limit 1) as PO_number, (select updated_at FROM order_status_logs where indent_id = a.id and status = 15 and sap_ref_id is not null limit 1) as GRN_created_at, (select sap_ref_id FROM order_status_logs where indent_id = a.id and status = 15 and sap_ref_id is not null limit 1) as GRN, (select created_at from order_status_logs where indent_id = a.id and status = 5 limit 1) as diaspatched_at, (select GROUP_CONCAT(document SEPARATOR ', ') from order_status_logs where indent_id = a.id and status = 5) as document_ids FROM user_indents as a WHERE a.order_id =${item.id} ${filterStatus}`, function (i_err, i_result, fields) {
                                        if (i_err) {
                                            console.log(i_err);

                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": i_err
                                            })
                                        } else {

                                            result[index].total_items = i_result.length;

                                            function get_total_quantity(i_result) {
                                                var sum = 0;
                                                for (var i = 0; i < i_result.length; i++) {
                                                    sum += i_result[i].quantity;
                                                }
                                                // console.log(sum);
                                                return sum

                                            }

                                            function get_total_price(i_result) {
                                                var totalsum = 0;
                                                for (var i = 0; i < i_result.length; i++) {
                                                    totalsum += i_result[i].total_price;
                                                }
                                                // console.log(totalsum);
                                                return totalsum

                                            }
                                            // result[index].total = get_total_price(i_result);
                                            // result[index].total_quantity = get_total_quantity(i_result);
                                            // result[index].order_items = i_result;
                                            i_result.forEach((obj) => obj.order = item);
                                            result[index].total = get_total_price(i_result);
                                            result[index].total_quantity = get_total_quantity(i_result);
                                            result[index].order_items = JSON.parse(JSON.stringify(i_result));
                                            indentsArray = indentsArray.concat(i_result);

                                            if (index == result.length - 1) {

                                                // console.log('-----------done');
                                                setTimeout(function () {
                                                    var responsePayload = {
                                                        result: indentsArray,
                                                        order_result: result
                                                    };

                                                    res.status(200).json({
                                                        "success": true,
                                                        "orders": responsePayload
                                                    })
                                                }, 500);

                                            }
                                        }
                                    });
                                })
                            } else {

                                res.status(200).json({
                                    "success": true,
                                    "orders": {
                                        "result": [],
                                        "order_result": []
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

module.exports = new indent_report()