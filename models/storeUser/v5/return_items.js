const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const return_items = function () {}


return_items.prototype.return_items_func = function (req, res, callback) {
    // console.log(req.body);

    var numPerPage = req.body.npp || 10;
    var page = (req.body.page || 1) - 1;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;


    con.query(`SELECT store_locations FROM user_details where id  = ${req.body.user_id}`, function (serrs, sresults, fields) {
        if (serrs) {
            console.log(serrs);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": serrs
            })
        } else {
            var storeArray = sresults.map(({
                store_locations
            }) => store_locations);
            // console.log(storeArray);

            storeArray = JSON.parse(storeArray);
            if (storeArray.length > 0) {
                if (req.body.status.length == 0) {
                    var returnQuery = `SELECT SQL_CALC_FOUND_ROWS a.*, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id, (SELECT document FROM order_status_logs WHERE id = a.ref_id ) as document, (SELECT document_year FROM order_status_logs WHERE id = a.ref_id ) as document_year, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as indent_created_at, (SELECT sto FROM order_status_logs WHERE id = a.approval_id ) as sto, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , (SELECT price FROM user_indents WHERE id = a.indent_id ) as price,  (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks FROM return_items as a INNER JOIN user_orders as b ON a.order_id = b.id WHERE b.plant_id in (${storeArray.join()})  ORDER BY id DESC; SELECT FOUND_ROWS() as totalCount; `;
                } else {
                    var returnQuery = `SELECT SQL_CALC_FOUND_ROWS a.*, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id,  (SELECT document FROM order_status_logs WHERE id = a.ref_id ) as document, (SELECT document_year FROM order_status_logs WHERE id = a.ref_id ) as document_year, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as indent_created_at,  (SELECT sto FROM order_status_logs WHERE id = a.approval_id ) as sto, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , (SELECT price FROM user_indents WHERE id = a.indent_id ) as price, (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE  status = a.status and indent_id = a.indent_id limit 0,1) as remarks FROM return_items as a INNER JOIN user_orders as b ON a.order_id = b.id WHERE a.status in (${req.body.status.join()}) AND b.plant_id in (${storeArray.join()})  ORDER BY id DESC; SELECT FOUND_ROWS() as totalCount;`;
                }
                con.query(returnQuery, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else {
                        if (result.length > 0) {

                            numRows = result[1][0].totalCount;
                            numPages = Math.ceil(numRows / numPerPage);

                            var responsePayload = {
                                result: result[0]
                            };
                            if (page < numPages) {
                                responsePayload.pagination = {
                                    current: page,
                                    perPage: numPerPage,
                                    previous: page > 1 ? page - 1 : undefined,
                                    next: page < numPages - 1 ? page + 1 : undefined,
                                    total: numPages,
                                    totalCount: numRows
                                }
                            } else responsePayload.pagination = {
                                err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                            }

                            res.status(200).json({
                                "success": true,
                                "data": responsePayload
                            })
                        } else {

                            res.status(200).json({
                                "success": true,
                                "data": []
                            })
                        }
                    }
                });
            } else {

                res.status(200).json({
                    "success": true,
                    "data": []
                })
            }
        }
    })
}

module.exports = new return_items()