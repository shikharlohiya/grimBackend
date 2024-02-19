const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const get_managers = function () {}


get_managers.prototype.get_managers_func = function (req, res, callback) {
    con.query("SELECT * FROM user_details where role_id != 3 and status ='1' and id != 1 ORDER BY first_name ", function (err, result, fields) {
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
                "data": result
            })
        }
    });
}

module.exports = new get_managers()