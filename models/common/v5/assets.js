const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const assets = function () {}


assets.prototype.assets_func = function (req, res, callback) {
    // console.log(req.query.plant_id);
    con.query(`SELECT *  FROM assets order by created_at desc`, function (err, result, fields) {
        if (err) {

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "assets": result
            })
        }
    });
}


module.exports = new assets()