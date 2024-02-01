const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const wbs_numbers = function () {}


wbs_numbers.prototype.wbs_numbers_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT *  FROM wbs_numbers ORDER BY wbs_desc`, function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                res.status(200).json({
                    "success": true,
                    "wbs_numbers": result
                })
            }
        });
    })
}


module.exports = new wbs_numbers()