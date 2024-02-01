const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const plants = function () {}

plants.prototype.plants_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);
        con.query(`SELECT * 
        FROM grim_s4.brill_stored_formulas
        WHERE id IN (SELECT MAX(id) FROM grim_s4.brill_stored_formulas GROUP BY PlantCode) ORDER BY UpdatedAt Desc`, function (uerr, uresult, fields) {
            if (uerr) {
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                // console.log(uresult);
                    res.status(200).json({
                        "success": true,
                        "plants": uresult
                    })
            }
        });
    })
}

module.exports = new plants()