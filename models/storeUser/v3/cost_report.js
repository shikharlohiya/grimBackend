const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const cost_report = function () {}



cost_report.prototype.cost_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        con.query(`SELECT id as department, department_name FROM departments where status = '1'`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result);

                result.forEach((item, index) => {
                    
                    result[index].tcu = "";
                    result[index].cu = "";
                    con.query(`SELECT id FROM user_details where department in (${item.department})`, function (de_err, de_result, fields) {
                        if (de_err) {
                            console.log(de_err);
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                            })
                        } else {
                            var useridsArray = de_result.map(({
                                id
                            }) => id);
                            if (useridsArray.length > 0) {

                                con.query(`SELECT IFNULL(ROUND(sum((a.intial_qty - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14))) * a.price)), 0) as total_cost  FROM user_indents as a WHERE a.user_id in (${useridsArray.join()}) AND  (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')`, function (i_err, i_result, fields) {
                                    if (i_err) {
                                        console.log(i_err);
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                        })
                                    } else {
                                        console.log('----------', i_result, index);

                                        result[index].amount = i_result[0].total_cost
                                        if (index == result.length - 1) {

                                            console.log('-----------done');

                                            setTimeout(function () {
                                                res.status(200).json({
                                                    "success": true,
                                                    "result": result
                                                })
                                            }, 1000)
                                        }
                                    }
                                });

                            } else {
                                result[index].amount = 0
                                if (index == result.length - 1) {

                                    console.log('-----------done');
                                    setTimeout(function () {
                                        res.status(200).json({
                                            "success": true,
                                            "result": result
                                        })
                                    }, 1000)
                                }
                            }
                        }
                    })
                })
            }
        });
    })
}

module.exports = new cost_report()