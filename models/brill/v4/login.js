const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const login = function () { }


login.prototype.login_func = function (req, res, callback) {
    // console.log(req.body);

    var da = new Date();
    var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
    var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
    var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);

    con.query(`SELECT * FROM brill_user_details where email = "${req.body.email}"`, function (err, result, fields) {


        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            if (result.length > 0) {
                console.log(result,'---------');
                result[0].roles = JSON.parse(result[0].roles);
                result[0].roles =  result[0].roles.map(date => `'${date}'`)

                con.query(`SELECT privileges FROM brill_roles where role in (${result[0].roles.join()})`, function (rerr, rresult, fields) {


                    if (rerr) {
                        console.log(rerr);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else {
                        // result[0].privileges = rresult.forEach(function(v){ delete v.privileges });
                        rresult[0].privileges = JSON.parse(rresult[0].privileges);
                        result[0].privileges = rresult[0].privileges[0].split(",");

                        if (result[0].status == 1) {
                            if (result[0].password == req.body.password) {
                                con.query(`UPDATE brill_user_details set last_login = '${dateTime}'  where id = ${result[0].id}`, function (uerr, uresult, fields) {
                                    if (uerr) {
                                        console.log(uerr);

                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": uerr
                                        })
                                    } else {

                                        res.status(200).json({
                                            "success": true,
                                            "message": "login sucessfully.",
                                            "user": result
                                        })
                                    }
                                });

                            } else {
                                res.status(200).json({
                                    "success": false,
                                    "message": "Email and password does not match."
                                })
                            }
                        } else {
                            res.status(200).json({
                                "success": false,
                                "message": "User Deactivated"
                            })
                        }
                    }
                })

            } else {
                res.status(200).json({
                    "success": false,
                    "message": "Email does not exits."
                })
            }
        }
    });
}

module.exports = new login()