const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const temp_details = function () { }

temp_details.prototype.temp_details_get_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT * FROM temp_details where active = '1' and user_id = '${req.query.user_id}' ORDER BY created_at`, function (uerr, uresult, fields) {
        if (uerr) {

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": uerr
            })
        } else {
            // console.log(uresult);

            res.status(200).json({
                "success": true,
                "results": uresult
            })
        }
    });
}

temp_details.prototype.temp_details_post_func = function (req, res, callback) {
    // console.log(req.body);
    if (req.body.data != undefined && req.body.data != null && req.body.data.length > 0) {

        con.query('INSERT INTO temp_details (user_id, device, temp, status) VALUES ?',
            [req.body.data.map(temp => [`${temp.user_id}`, `${temp.device}`, `${temp.temp}`, `${temp.status}`])],
            function (l_err, l_result) {
                if (l_err) {
                    console.log(l_err);
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": l_err
                    })
                } else {
                    res.status(200).json({
                        "success": true,
                        "message": "Inserted Successfully...!",
                    })
                }
            });
    } else {
        res.status(500).json({
            "success": false,
            "message": "Please send all the parameters...!"
        })
    }
}

module.exports = new temp_details()