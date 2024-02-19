const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const cost_report = function () { }



cost_report.prototype.cost_report_func = function (req, res, callback) {
    con.query(`SELECT * FROM user_details where id =  ${req.body.user_id}`, function (r_err, r_result, fields) {
        if (r_err) {

            console.log(r_err);
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": r_err
            })
        } else {
            if (r_result[0].role_id == 2) {
                var query = `SELECT id FROM user_details where manager_id =  ${req.body.user_id}`
            } else {
                var query = `SELECT id FROM user_details where manager2 =  ${req.body.user_id}`

            }
            con.query(query, function (m_err, m_result, fields) {
                if (m_err) {

                    console.log(m_err);
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": m_err
                    })
                } else {
                    var idsArray = m_result.map(({
                        id
                    }) => id);
                    idsArray.push(req.body.user_id);
                    con.query(`SELECT DISTINCT(a.department), (SELECT department_name FROM departments WHERE id = a.department) as department_name FROM user_details as a WHERE a.id in (${idsArray.join()})`, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else {
                            // console.log(result);

                            result.forEach((item, index) => {

                                result[index].tcu = "";
                                result[index].cu = "";
                                con.query(`SELECT id FROM user_details where department in (${item.department})`, function (de_err, de_result, fields) {
                                    if (de_err) {
                                        console.log(de_err);

                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": de_err
                                        })
                                    } else {
                                        var useridsArray = de_result.map(({
                                            id
                                        }) => id);
                                        con.query(`SELECT IFNULL(ROUND(sum((a.intial_qty - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status = 3) - (select COALESCE(sum(qty), 0) from order_status_logs where indent_id = a.id and status in (14))) * a.price)), 0) as total_cost  FROM user_indents as a WHERE a.user_id in (${useridsArray.join()}) AND  (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}')`, function (i_err, i_result, fields) {
                                            if (i_err) {
                                                console.log(i_err);

                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint",
                                                    "err": i_err
                                                })
                                            } else {
                                                // console.log('----------', i_result);

                                                result[index].amount = i_result[0].total_cost
                                                if (index == result.length - 1) {

                                                    // console.log('-----------done');

                                                    setTimeout(function () {
                                                        res.status(200).json({
                                                            "success": true,
                                                            "result": result
                                                        })
                                                    }, 100)
                                                }
                                            }
                                        });
                                    }
                                })
                            })
                        }
                    });

                }
            })

        }
    })
}

module.exports = new cost_report()