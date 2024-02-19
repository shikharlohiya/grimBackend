const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const item_group = function () {}


item_group.prototype.item_group_func = function (req, res, callback) {
    con.query("SELECT * FROM material_group_sync ", function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "item_group": result
            })
        }
    });
}

module.exports = new item_group()