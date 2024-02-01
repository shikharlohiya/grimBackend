const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
var requestss = require('request');
require('dotenv/config')



const pr_cancel = function () {}


pr_cancel.prototype.pr_cancel_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log(req.body.requests);


                var da = new Date();
                var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
                var date = da.getFullYear() + ("0" + (da.getMonth() + 1)).slice(-2) + ("0" + (da.getDate())).slice(-2);
                var ndate =
                    da.getFullYear() +
                    "-" +
                    ("0" + (da.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + da.getDate()).slice(-2) +
                    " " +
                    ("0" + da.getHours()).slice(-2) +
                    ":" +
                    ("0" + da.getMinutes()).slice(-2) +
                    ":" +
                    ("0" + da.getSeconds()).slice(-2);

                req.body.requests.forEach((request, index) => {
                    var indent_ids = request.indents.map(({
                        id
                    }) => id);
                    con.query(`UPDATE PR_items set status = '0' WHERE indent_id in (${indent_ids.join()})`, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            con.rollback(function () {
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "err": err
                                })
                            });
                        } else {
                            request.indents.forEach((indent, i) => {
                                con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, qty, remarks, created_by) VALUES (${indent.id}, ${indent.order_id},18,${indent.quantity}, '${indent.remarks}', ${req.body.user_id} )`, function (os_err, i_result) {
                                    if (os_err) {
                                        console.log(os_err);
                                        con.rollback(function () {


                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": os_err
                                            })
                                        });
                                    } else {
                                        con.query(`UPDATE user_indents set status = 18 WHERE id = ${indent.id}`, function (indent_err, indent_result) {
                                            if (indent_err) {
                                                console.log(indent_err);
                                                con.rollback(function () {


                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint",
                                                        "err": indent_err
                                                    })
                                                });
                                            } else {
                                                if ((i == request.indents.length - 1) && (index == req.body.requests.length - 1)) {
                                                    con.commit(function (err) {
                                                        if (err) {
                                                            con.rollback(function () {
                                                                throw err;
                                                            });
                                                        }
                                                        setTimeout(function () {

                                                            res.status(200).json({
                                                                "success": true,
                                                                "message": "PR Cancelled Successfully"
                                                            })
                                                        }, 100);
                                                    })
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        })
    })
}

module.exports = new pr_cancel()