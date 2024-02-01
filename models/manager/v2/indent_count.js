const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const indent_count = function () {}


indent_count.prototype.indent_count_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);

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
                
                    var orderQuery = `SELECT  (SELECT count(1) FROM user_indents WHERE order_id =a.id and status = 1) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders AS a  where a.user_id in (${idsArray.join()}) HAVING indent_count = total_count`

                con.query(orderQuery, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        res.status(200).json({
                            "success": true,
                            "count": result.length
                        })
                    }
                });

            }
        });
    })
}

module.exports = new indent_count()