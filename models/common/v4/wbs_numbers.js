const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const wbs_numbers = function () {}


wbs_numbers.prototype.wbs_numbers_func = function (req, res, callback) {
    // console.log(req.query.plant_id);
    if (req.query.plant_id == undefined) {
        var filter = ""
    } else {
        var filter = `where plant_id = '${req.query.plant_id}'`
    }
    con.query(`SELECT *  FROM wbs_numbers ${filter} ORDER BY wbs_desc`, function (err, result, fields) {
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
                "wbs_numbers": result
            })
        }
    });
}


module.exports = new wbs_numbers()