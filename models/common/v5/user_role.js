const con = require("../../db1.js");
const g_var = require("../../global_var.js");

const user_role = function () {};

user_role.prototype.userRoleFunc = function (req, res, callback) {
    const status = req.query.status; // Get the 'type' parameter from the query string
      console.log('-----------------------' , status);
    const query = `SELECT * FROM user_roles`;

    if (status) {
        // If 'type' parameter is provided, add a WHERE clause to the query
        const filteredQuery = `${query} WHERE status = '${status}'`;
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
                "User_role": result
            });
        } else {
            res.status(200).json({
                "success": true,
                "Order Status": []
            });
        }
    });
}
module.exports = new user_role();



 

