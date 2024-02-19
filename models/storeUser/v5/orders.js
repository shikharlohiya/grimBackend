const con = require("../../db1.js"),

    mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const orders = function () { }


orders.prototype.orders_func = function (req, res, callback) {
    // console.log(req.body);

    mysqlPool.getConnection(function (err, con) {
        var numRows;
        if (req.body.indent_type == 'Pending') {
            var filter_indent_type = "and approval_finish = '1' and rm_approval = '0' and remaining_qty > 0";
            var count_filter_indent_type = `AND (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.approval_finish = '1' and c.rm_approval = '0' and c.remaining_qty > 0) > 0`;
        } else {
            var filter_indent_type = "";
            var count_filter_indent_type = "";
        }

        var numPerPage = req.body.npp;
        var page = (req.body.page) - 1;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        var filterStatus = ''
        var ifilterStatus = ''
        if (req.body.indent_status.length == 0) {
            filterStatus += ''
            ifilterStatus += ''


        } else {
            filterStatus += `and status in (${req.body.indent_status.join()})`
            ifilterStatus += `and a.status in (${req.body.indent_status.join()})`
        }

        if (req.body.search != undefined && req.body.search != "") {
            var search = `AND (a.id = ${req.body.search} OR (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.product_id = (SELECT id FROM material_items WHERE material_sap_id = ${req.body.search})) > 0)`;
        } else {
            var search = '';
        }
        con.query(`SELECT store_locations FROM user_details where id  = ${req.body.user_id}`, function (serrs, sresults, fields) {
            if (serrs) {
                console.log(serrs);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": serrs
                })
            } else {
                var idsArray = sresults.map(({
                    store_locations
                }) => store_locations);
                console.log(idsArray);

                idsArray = JSON.parse(idsArray);
                if (idsArray.length > 0) {
                    var order_filter = `AND a.plant_id in (${idsArray.join()})`
                    if (req.body.location_id.length > 0) {
                        order_filter = `AND a.plant_id in (${req.body.location_id.join()})`
                    }
                    if (req.body.role_id == 5) {
                        if (req.body.indent_type == "Open") {

                            var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1' and rm_approval='1' and remaining_qty>0) as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} AND (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.approval_finish = '1' and c.rm_approval = '1' and c.remaining_qty>0) > 0`
                        } else if (req.body.indent_type == "Closed") {

                            var orderQuery = `SELECT a.*, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish='1' and rm_approval = '1' ) as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1' and rm_approval = '1') as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count = all_count and indent_count>0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish='1' and rm_approval = '1' ) as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1' and rm_approval = '1') as indent_count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} GROUP BY a.id HAVING indent_count = all_count and indent_count>0`;
                        } else {

                            var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1' and rm_approval='1') as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} AND (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.approval_finish = '1' and c.rm_approval = '1') > 0`
                        }
                    } else {
                        if (req.body.indent_type == "Pending") {

                            var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1' and rm_approval='0' and remaining_qty>0) as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} AND (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.approval_finish = '1' and c.remaining_qty>0 and c.rm_approval='0') > 0`
                        } else if (req.body.indent_type == "Open") {

                            var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1' and remaining_qty>0) as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1' and remaining_qty>0) as indent_count FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} GROUP BY a.id HAVING indent_count > 0`
                        } else if (req.body.indent_type == "Closed") {

                            var orderQuery = `SELECT a.*, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish='1') as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1') as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} GROUP BY a.id HAVING indent_count = all_count and indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count, (SELECT count(id) FROM user_indents WHERE order_id =a.id  and approval_finish='1') as all_count, (SELECT count(id) FROM user_indents WHERE order_id =a.id and remaining_qty = 0  and approval_finish='1') as indent_count FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} GROUP BY a.id HAVING indent_count = all_count and indent_count > 0`;
                        } else {

                            var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus} and approval_finish='1') as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}' AND a.type='indent' AND date(a.created_at) <= '${req.body.to_date}') AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`;

                            var orderCount = `SELECT count(*) as count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='indent' AND a.md_approval = '0' ${order_filter} ${search} AND (SELECT count(1) FROM user_indents as c WHERE c.order_id =a.id AND c.approval_finish = '1') > 0`
                        }
                    }

                    console.log(orderQuery);
                    console.log(orderCount);


                    con.query(orderQuery, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else if (result.length > 0) {
                            con.query(orderCount, function (errs, results, fields) {
                                if (errs) {
                                    console.log(errs);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": errs
                                    })
                                } else {
                                    // console.log(result);
                                    console.log(results[0].count);
                                    if(results.length == 1){
                                        numRows = results[0].count;
                                    } else {
                                        numRows = results.length;
                                    }
                                    
                                    numPages = Math.ceil(numRows / numPerPage);

                                    result.forEach((item, index) => {

                                        result[index].address = JSON.parse(result[index].address);
                                        result[index].store_address = JSON.parse(result[index].store_address);

                                        if (req.body.role_id == 5) {
                                            var stock = `(SELECT IFNULL( (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = a.product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' and valution_type = a.valution_type LIMIT 1) ,0)) as stock`


                                            con.query(`SELECT * FROM cost_centers WHERE plant = '${result[index].address.plant_id}';`, function (ccerrs, ccresults, fields) {
                                                if (ccerrs) {
                                                    result[index].cost_centers = [];
                                                } else {
                                                    result[index].cost_centers = ccresults;
                                                }
                                            })
                                        } else {
                                            var stock = `(select greatest(0,(SELECT IFNULL( (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = a.product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' and valution_type = a.valution_type LIMIT 1) ,0) - (SELECT IFNULL((SELECT sum(qty) FROM stock_reserve WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = a.product_id ) and plant_id = ${result[index].store_address.id} and valution_type = a.valution_type  ) ,0))))) as stock`
                                            result[index].cost_centers = [];
                                        }
                                        con.query(`SELECT a.id,(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'role_id', d.role_id, 'finish', d.finish, 'last_approval', d.last_approval, 'role_name', (Select role from user_roles where id = d.role_id))) FROM Indent_approvals as d WHERE indent_id = a.id) as indent_approvals, (SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, (SELECT sap_user_id FROM user_details WHERE id = a.user_id ) as sap_id, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5) as issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 5 and (sto IS NOT NULL or document IS NOT NULL) ) as actual_issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14)) as return_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 11) as received_qty,  (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) as rejected_qty,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id , ${stock}, a.quantity, ROUND(a.price, 2) AS price, ROUND(a.total_price, 2) AS total_price, (SELECT description FROM order_status WHERE value = a.status ) as status,(SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.closed, a.closed as close, a.remaining_qty, a.intial_qty, a.created_at, a.created_by, a.s_no, a.is_pr_raised, a.rm_approval, a.approval_finish, a.delivery_date, a.quality_check_by, a.valution_type FROM user_indents as a INNER JOIN material_items as b ON a.product_id=b.id WHERE a.order_id =${item.id} ${ifilterStatus}`, function (i_err, i_result, fields) {
                                            if (i_err) {
                                                console.log(i_err);
                                                con.release();
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint",
                                                    "err": i_err
                                                })
                                            } else {

                                                i_result.forEach((element, i, array) => {
                                                    element.indent_approvals = JSON.parse(element.indent_approvals);
                                                    console.log(element.valution_type);
                                                    if (element.valution_type == '0') {
                                                        element.valution_type = "";
                                                    }

                                                    element.batch_ids = [];
                                                    element.serial_numbers = [];

                                                    con.query(`SELECT * FROM batch_ids WHERE  plant_id = '${result[index].store_address.plant_id}' and store_id = '${result[index].store_address.storage_location}' and material_id = '${element.product_sap_id}' and stock > 0; SELECT * FROM serial_numbers WHERE  plant_id = '${result[index].store_address.plant_id}' and store_id = '${result[index].store_address.storage_location}' and material_id = '${element.product_sap_id}' and (valution_type = '${element.valution_type}' or valution_type NOT IN ('NEW', 'DAMAGE', 'REPAIR', 'REFURBISH', 'PURCHASE')) and status='1';`, function (bserrs, bsresults, fields) {
                                                        if (bserrs) {
                                                            element.batch_ids = [];
                                                            element.serial_numbers = [];
                                                        } else {
                                                            element.batch_ids = bsresults[0];
                                                            element.serial_numbers = bsresults[1];
                                                        }
                                                    })
                                                });

                                                result[index].order_items = i_result;

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
                                                result[index].total = get_total_price(i_result);
                                                result[index].total_quantity = get_total_quantity(i_result);

                                                if (index == result.length - 1) {

                                                    var responsePayload = {
                                                        result: result
                                                    };
                                                    if (page < numPages) {
                                                        responsePayload.pagination = {
                                                            current: page,
                                                            perPage: numPerPage,
                                                            previous: page > 1 ? page - 1 : undefined,
                                                            next: page < numPages - 1 ? page + 1 : undefined,
                                                            total: numPages
                                                        }
                                                    } else responsePayload.pagination = {
                                                        err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                                                    }

                                                    con.release();
                                                    setTimeout(function () {
                                                        res.status(200).json({
                                                            "success": true,
                                                            "orders": responsePayload
                                                        })
                                                    }, 500);

                                                }
                                            }
                                        });
                                    })

                                }
                            });
                        } else {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "orders": {
                                    "result": [],
                                    "pagination": {
                                        "err": 'queried page ' + page + ' is >= to maximum page number'
                                    }
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
                            "pagination": {
                                "err": 'queried page ' + page + ' is >= to maximum page number'
                            }
                        }
                    })
                }
            }
        })
    })
}

module.exports = new orders()