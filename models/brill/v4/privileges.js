const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const privileges = function () { }

privileges.prototype.privileges_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_privileges`, function (uerr, uresult, fields) {
            if (uerr) {
                console.log(uerr);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                // console.log(uresult);
                res.status(200).json({
                    "success": true,
                    "privileges": uresult
                })
            }
        });
    })
}

module.exports = new privileges()