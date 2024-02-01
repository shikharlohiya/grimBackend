const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const sto = function () {}


sto.prototype.sto_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

        var numRows;

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
                    "message": "Error with endpoint"
                })
            } else {

                if (req.body.location_id.length > 0) {
                    var idsArray = req.body.location_id
                } else {
                    var idsArray = sresults.map(({
                        store_locations
                    }) => store_locations);
                    console.log(idsArray);
    
                    idsArray = JSON.parse(idsArray);
                }
              
                if (idsArray.length > 0) {
                    var order_filter = `AND (a.plant_id in (${idsArray.join()}) OR  a.created_by = ${req.body.user_id}) `
                    con.query(`SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus}) as indent_count, (SELECT count(1) FROM order_status_logs WHERE order_id =a.id and status = 7) as wbs_check, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.plant_name, 'storage_location', b.storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location_desc', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id WHERE (date(a.created_at) >= '${req.body.from_date}'  AND date(a.created_at) <= '${req.body.to_date}') AND a.type='STO' AND  a.md_approval = '0' ${order_filter} ${search} HAVING indent_count > 0  ORDER BY id DESC Limit ${limit}`, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else if (result.length > 0) {
                            con.query(`SELECT count(*) as count  FROM user_orders as a WHERE (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') AND  type='STO' AND a.md_approval = '0' ${order_filter} ${search} `, function (errs, results, fields) {
                                if (errs) {
                                    console.log(errs);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                    })
                                } else {
                                    // console.log(result);
                                    // console.log(results[0].count);
                                    numRows = results[0].count;
                                    numPages = Math.ceil(numRows / numPerPage);

                                    result.forEach((item, index) => {

                                        result[index].address = JSON.parse(result[index].address);
                                        result[index].store_address = JSON.parse(result[index].store_address);
                                        con.query(`SELECT a.id, (SELECT manager_id FROM user_details WHERE id = a.user_id ) as manager_id, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 20) as issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 20 and (sto IS NOT NULL or document IS NOT NULL) ) as actual_issued_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14)) as return_qty, (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 21) as received_qty,  (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) as rejected_qty,  a.product_id, a.order_id, (SELECT name FROM material_items WHERE id = a.product_id ) as product_name , (SELECT base_unit FROM material_items WHERE id = a.product_id ) as base_unit , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id , (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' ) as stock , a.quantity, a.price, a.total_price, (SELECT description FROM order_status WHERE value = a.status ) as status,(SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name, a.delivery_priority, a.remarks,a.reason, a.where_used, a.section, a.tracking_no, a.priority_days, a.closed, a.closed as close, a.remaining_qty, a.intial_qty, a.created_at, a.created_by, a.s_no FROM user_indents as a INNER JOIN material_items as b ON a.product_id=b.id WHERE a.order_id =${item.id} ${ifilterStatus}`, function (i_err, i_result, fields) {
                                            if (i_err) {
                                                console.log(i_err);
                                                con.release();
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint"
                                                })
                                            } else {


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

                                                    setTimeout(function () {
                                                        con.release();
                                                        res.status(200).json({
                                                            "success": true,
                                                            "orders": responsePayload
                                                        })
                                                    }, 100);

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

module.exports = new sto()