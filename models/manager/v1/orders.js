const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const orders = function () {}


orders.prototype.orders_func = function (req, res, callback) {
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
        if (req.body.indent_status.length == 0) {
         filterStatus += ''
            
        } else {
         filterStatus += `and status in (${req.body.indent_status.join()})`
        }

        con.query(`SELECT id FROM user_details where manager_id =  ${req.body.user_id}`, function (m_err, m_result, fields) {
            if (m_err) {
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
                    var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus}) as indent_count,  (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.storage_location_desc, 'storage_location', b.storage_location)) AS 'address' , (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')  HAVING indent_count > 0 ORDER BY id DESC Limit ${limit}`

                    var orderCount = `SELECT count(*) as count FROM user_orders as a where user_id in (${idsArray.join()}) AND (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}')`
                } else {
                    var orderQuery = `SELECT a.*, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus}) as indent_count,  (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'name1', b.storage_location_desc, 'storage_location', b.storage_location)) AS 'address', (SELECT JSON_OBJECT('id', c.id, 'plant_id', c.plant_id, 'name1', c.storage_location_desc, 'storage_location', c.storage_location)) AS 'store_address' FROM user_orders AS a LEFT JOIN plant_details_sync AS b ON b.id = a.address LEFT JOIN plant_details_sync AS c ON c.id = a.plant_id where a.user_id in (${idsArray.join()}) and  a.address in (${req.body.location_id.join()}) AND (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')  HAVING indent_count > 0 ORDER BY id DESC Limit ${limit}`

                    var orderCount = `SELECT count(*) as count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ${filterStatus}) as indent_count FROM user_orders as a where user_id in (${idsArray.join()}) AND address in (${req.body.location_id.join()}) AND (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}')  GROUP BY a.id HAVING indent_count > 0 `
                }
                con.query(orderQuery, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else if (result.length > 0) {

                        con.query(orderCount, function (errs, results, fields) {
                            if (errs) {
                                console.log(errs);

                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                console.log(result);
                                console.log(results[0].count);
                                numRows = results[0].count;
                                numPages = Math.ceil(numRows / numPerPage);

                                result.forEach((item, index) => {
                                    result[index].address = JSON.parse(result[index].address);
                                    result[index].store_address = JSON.parse(result[index].store_address);
                                    con.query(`SELECT id,(SELECT manager_id FROM user_details WHERE id = user_id ) as manager_id,  product_id, order_id, (SELECT name FROM material_items WHERE id = product_id ) as product_name , (SELECT material_sap_id FROM material_items WHERE id = product_id ) as product_sap_id , (SELECT quantity FROM material_stock WHERE material_id = (SELECT material_sap_id FROM material_items WHERE id = product_id ) and plant_id = '${result[index].store_address.plant_id}' and storage_loc = '${result[index].store_address.storage_location}' ) as stock , quantity, price, total_price, (SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, (SELECT first_name FROM user_details WHERE id = user_id ) as first_name, delivery_priority, remarks, created_at,created_by FROM user_indents WHERE order_id =${item.id} ${filterStatus}`, function (i_err, i_result, fields) {
                                        if (i_err) {
                                            console.log(i_err);
                                            
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
                                                console.log(sum);
                                                return sum

                                            }
                                            function get_total_price(i_result) {
                                                var totalsum = 0;
                                                for (var i = 0; i < i_result.length; i++) {
                                                    totalsum += i_result[i].total_price;
                                                }
                                                console.log(totalsum);
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

            }
        });
    })
}

module.exports = new orders()