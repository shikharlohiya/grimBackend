const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

var request = require('request');


const update_sto_md_my = function () {}


update_sto_md_my.prototype.update_sto_md_my_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        if (req.body.id == undefined || req.body.type == undefined) {
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {
            con.query(`SELECT id FROM order_status_logs where id = ${req.body.id}`, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint"
                    })
                } else if (result.length == 0) {
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Something went wrong...!"
                    })
                } else if (result.length > 0) {
                    if (req.body.type == 'STO') {
                        var query = `UPDATE order_status_logs set sto = '${req.body.sto}' WHERE id = ${req.body.id}`
                    } else {
                        var query = `UPDATE order_status_logs set document = '${req.body.document}' , document_year = '${req.body.document_year}' WHERE id = ${req.body.id}`
                    }
                    console.log(result, '-----------');

                    con.query(query, function (derr, dresult, fields) {
                        if (derr) {
                            console.log(derr);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "message": "Updated Successfully"
                            })
                        }
                    });
                }
            });
        }
    })
}

module.exports = new update_sto_md_my()