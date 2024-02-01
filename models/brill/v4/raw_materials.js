const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const raw_materials = function () {}

raw_materials.prototype.raw_materials_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * FROM brill_stored_formula_ingrediants WHERE id IN (SELECT MAX(id) FROM brill_stored_formula_ingrediants GROUP BY Code) ORDER BY Description`, function (uerr, uresult, fields) {
            if (uerr) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                // console.log(uresult);
                    res.status(200).json({
                        "success": true,
                        "raw_materials": uresult
                    })
            }
        });
    })
}

module.exports = new raw_materials()