const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const privileges = function () {}


privileges.prototype.privileges_func = function (req, res, callback) {
    // console.log(req.query);
    var role_id = req.query.role_id;
    con.query("SELECT * FROM role_privileges where json_contains(`roles`,'" + role_id + "')", function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result);

            res.status(200).json({
                "success": true,
                "privileges": result
            })
        }
    });
}

module.exports = new privileges()