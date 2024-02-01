const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const formulas = function () {}

formulas.prototype.formulas_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * 
        FROM grim_s4.brill_stored_formulas
        WHERE id IN (SELECT MAX(id) FROM grim_s4.brill_stored_formulas GROUP BY FormulaCode) ORDER BY UpdatedAt Desc`, function (uerr, uresult, fields) {
            if (uerr) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                // console.log(uresult);
                    res.status(200).json({
                        "success": true,
                        "formulas": uresult
                    })
            }
        });
    })
}

module.exports = new formulas()