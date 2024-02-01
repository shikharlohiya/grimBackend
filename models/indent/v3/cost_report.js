const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const cost_report = function () {}



cost_report.prototype.cost_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {


        con.query(`SELECT a.department, (SELECT department_name FROM departments WHERE id = a.department) as department_name FROM user_details as a WHERE a.id = ${req.body.user_id}`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);
                con.query(`SELECT id FROM user_details  WHERE department = ${result[0].department}`, function (d_err, d_result, fields) {
                    if (d_err) {
                        console.log(d_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        var useridsArray = d_result.map(({
                            id
                        }) => id);
                        console.log(useridsArray);

                        con.query(`SELECT  ROUND(sum((a.intial_qty - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14))) * a.price)) as total_cost  FROM user_indents as a WHERE a.user_id in (${useridsArray.join()}) AND  (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')`, function (i_err, i_result, fields) {
                            if (i_err) {
                                console.log(i_err);
                                con.release();
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                console.log('----------', i_result);

                                result[0].amount = i_result[0].total_cost
                                result[0].tcu = ""

                                result[0].cu = ""



                                con.release();
                                res.status(200).json({
                                    "success": true,
                                    "result": result
                                })
                            }
                        });
                    }
                });
            }
        });
    })
}

module.exports = new cost_report()