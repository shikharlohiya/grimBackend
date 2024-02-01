const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const logout = function () {}


logout.prototype.logout_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {
            console.log(req.body);

            var da = new Date();
            var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
            var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
            var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);


            con.query(`UPDATE user_details set last_logout = '${dateTime}'  where id = ${req.body.id}`, function (uerr, uresult, fields) {
                if (uerr) {
                    console.log(uerr);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint"
                    })
                } else {

                    res.status(200).json({
                        "success": true,
                        "message": "logout sucessfully."
                    })
                }
            });

        }
    })
}

module.exports = new logout()