const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const return_items = function () { }


return_items.prototype.return_items_func = function (req, res, callback) {
    // console.log(req.body);
    var numPerPage = req.body.npp || 10;
    var page = (req.body.page || 1) - 1;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;
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
                    if (req.body.status.length != 0) {
                        var statusFilter = `a.status in (${req.body.status.join()}) and`

                    } else {
                        var statusFilter = ""

                    }
                    con.query(`SELECT SQL_CALC_FOUND_ROWS a.*, (SELECT manager_id FROM user_details WHERE id = a.created_by ) as manager_id,  (SELECT document FROM order_status_logs WHERE id = a.ref_id ) as document, (SELECT document_year FROM order_status_logs WHERE id = a.ref_id ) as document_year, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as indent_created_at, (SELECT sto FROM order_status_logs WHERE id = a.ref_id ) as sto, (SELECT name FROM material_items WHERE material_sap_id = a.product_id ) as product_name , (SELECT price FROM user_indents WHERE id = a.indent_id ) as price, (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no, (SELECT total_price FROM user_indents WHERE id = a.indent_id ) as total_price, (SELECT description FROM order_status WHERE value = a.status ) as status, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT remarks FROM order_status_logs WHERE created_by = a.created_by and status = a.status and indent_id = a.indent_id order by id limit 1) as remarks FROM return_items as a WHERE  ${statusFilter} a.created_by in (${idsArray.join()}) ORDER BY id DESC; SELECT FOUND_ROWS() as totalCount;`, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else {
                            if (result[0].length > 0) {
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
                                var responsePayload = {
                                    result: []
                                };
                                responsePayload.pagination = {
                                    current: page,
                                    perPage: numPerPage,
                                    previous: page > 1 ? page - 1 : undefined,
                                    next: page < numPages - 1 ? page + 1 : undefined,
                                    total: 0,
                                    totalCount: 0
                                }

                                res.status(200).json({
                                    "success": true,
                                    "data": responsePayload
                                })
                            }
                        }
                    });
                }
            })
        }
    })
}

module.exports = new return_items()