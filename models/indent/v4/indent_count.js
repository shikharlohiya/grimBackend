const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const indent_count = function () {}


indent_count.prototype.indent_count_func = function (req, res, callback) {
    // console.log(req.body);


    var orderQuery = `SELECT  (SELECT count(1) FROM user_indents WHERE order_id =a.id and status = 1) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders AS a  where a.user_id = ${req.body.user_id} HAVING indent_count = total_count; SELECT * FROM new_product_request AS a  where a.user_id = ${req.body.user_id} and a.status = 1;`

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

module.exports = new indent_count()