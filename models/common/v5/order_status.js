const con = require("../../db1.js");
const g_var = require("../../global_var.js");

const order_status = function () {};

order_status.prototype.orderStatusFunc = function (req, res, callback) {
    const created_by = req.query.created_by; // Get the 'type' parameter from the query string
      console.log(created_by, '-----------------------');
    const query = `SELECT * FROM order_status`;

    if (created_by) {
        // If 'type' parameter is provided, add a WHERE clause to the query
        const filteredQuery = `${query} WHERE created_by = '${created_by}'`;
        executeQuery(res, filteredQuery);
    } else {
        // If 'type' parameter is not provided, fetch all data
        executeQuery(res, query);
    }
};

function executeQuery(res, query) {
    con.query(query, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            });
        } else if (result.length > 0) {
            res.status(200).json({
                "success": true,
                "Order Status": result
            });
        } else {
            res.status(200).json({
                "success": true,
                "Order Status": []
            });
        }
    });
}

module.exports = new order_status();