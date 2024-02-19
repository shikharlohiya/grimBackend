const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const indent_count = function () { }


indent_count.prototype.indent_count_func = function (req, res, callback) {
    console.log(req.body);
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

                    var orderQuery = `SELECT  (SELECT count(1) FROM user_indents WHERE order_id =a.id and status = 1) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders AS a  where a.user_id in (${idsArray.join()}) HAVING indent_count = total_count; SELECT * FROM new_product_request AS a  where a.user_id in (${idsArray.join()}) and a.status = 1`



                    con.query(orderQuery, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else {

                            res.status(200).json({
                                "success": true,
                                "count": result[0].length,
                                "new_product_requests_count": result[1].length,
                            })
                        }
                    });

                }
            });
        }
    });
}

module.exports = new indent_count()