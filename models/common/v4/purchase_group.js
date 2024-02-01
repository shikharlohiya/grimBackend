const con = require("../../db1.js");
const g_var = require("../../global_var.js");

const purchase_group = function () {};

purchase_group.prototype.purchaseGroupFunc = function (req, res, callback) {
    // const status = req.query.status; // Get the 'type' parameter from the query string
      console.log('-----------------------');
    const query = `SELECT * FROM purchase_group`;

        // If 'type' parameter is not provided, fetch all data
        executeQuery(res, query);
    
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
                "Purchase Group": result
            });
        } else {
            res.status(200).json({
                "success": true,
                "Purchase Group": []
            });
        }
    });
}

module.exports = new purchase_group();



 

