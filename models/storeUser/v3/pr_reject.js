const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const axios = require('axios');
var requestss = require('request');
require('dotenv/config')



const pr_reject = function () {}


pr_reject.prototype.pr_reject_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body.requests);


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

                                con.release();
                                res.status(500).json({
                                  "success": false,
                                  "message": "Error with endpoint"
                                })
                              });
                        } else {
                            request.indents.forEach((indent, i) => {
                                con.query(`INSERT INTO order_status_logs ( indent_id, order_id, status, qty, remarks, created_by) VALUES (${indent.id}, ${indent.order_id},17,${indent.quantity}, '${indent.remarks}', ${req.body.user_id} )`, function (os_err, i_result) {
                                    if (os_err) {
                                        console.log(os_err);
                                        con.rollback(function () {

                                            con.release();
                                            res.status(500).json({
                                              "success": false,
                                              "message": "Error with endpoint"
                                            })
                                          });
                                    } else {
                                        con.query(`UPDATE user_indents set status = 17, remaining_qty = 0 WHERE id = ${indent.id}`, function (indent_err, indent_result) {
                                            if (indent_err) {
                                                console.log(indent_err);
                                                con.rollback(function () {

                                                    con.release();
                                                    res.status(500).json({
                                                      "success": false,
                                                      "message": "Error with endpoint"
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
                                                        con.release();
                                                        res.status(200).json({
                                                            "success": true,
                                                            "message": "PR Rejected Successfully"
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

module.exports = new pr_reject()