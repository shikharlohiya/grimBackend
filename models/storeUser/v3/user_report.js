const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const user_report = function () {}


user_report.prototype.user_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        var materialArray = [];
        var filterStatus = ''
        if (req.body.indent_status.length == 0) {
            filterStatus += ''

        } else {
            filterStatus += `AND a.status in (${req.body.indent_status.join()})`

        }

        con.query(`SELECT store_locations FROM user_details where id  = ${req.body.user_id}`, function (m_err, sresults, fields) {
            if (m_err) {
                con.release();
                console.log(m_err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                var idsArray = sresults.map(({
                    store_locations
                }) => store_locations);
                console.log(idsArray);

                idsArray = JSON.parse(idsArray);

                con.query(`SELECT t1.user_id, (SELECT first_name FROM user_details WHERE id = t1.user_id ) as first_name, COUNT(DISTINCT(t1.order_id)) as indent_count, COUNT(DISTINCT(t1.id)) as total_materials, COUNT(IF(t1.status=1,1, NULL)) 'Pending', COUNT(IF(t1.status=2,1, NULL)) 'Approved', COUNT(IF(t1.status=3,1, NULL)) 'Rejected',  COUNT(IF(t1.status=5,1, NULL)) 'Dispatched', COUNT(IF(t1.status=7,1, NULL)) 'PRRaised', COUNT(IF(t1.status=8,1, NULL)) 'PORaised', COUNT(IF(t1.status=15,1, NULL)) 'GRNDone', COUNT(IF(t1.status=17,1, NULL)) 'PRRejected', COUNT(IF(t1.status=18,1, NULL)) 'PRCancelled',COUNT(IF(t1.status=11,1, NULL)) 'Completed',COUNT(IF(t1.status=12,1, NULL)) 'Return',COUNT(IF(t1.status=13,1, NULL)) 'ReturnApproved',COUNT(IF(t1.status=14,1, NULL)) 'ReturnCompleted', COUNT(IF(t1.status=19,1, NULL)) 'STORaised', COUNT(IF(t1.status=20,1, NULL)) 'STODispatched' , COUNT(IF(t1.status=21,1, NULL)) 'STOReceived' FROM user_indents as t1  JOIN user_orders as t2 ON t1.order_id = t2.id where t1.user_id = ${req.body.user_id} AND (date(t1.created_at) >= '${req.body.from_date}' AND date(t1.created_at) <= '${req.body.to_date}') AND t2.plant_id in (${idsArray.join()})  GROUP BY t1.user_id, first_name`, function (i_err, i_result, fields) {
                    if (i_err) {
                        console.log(i_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        con.query(`SELECT a.id, a.first_name, a.created_at, a.last_login, a.last_logout, (SELECT department_name FROM departments WHERE id = a.department ) as department_name, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, (SELECT first_name  from user_details where id = a.manager_id) as reporting_to, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location', storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'user_location' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id  WHERE a.id = ${req.body.user_id}`, function (iu_err, iu_result, fields) {
                            if (iu_err) {
                                console.log(iu_err);
                                con.release();
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                con.release();
                                res.status(200).json({
                                    "success": true,
                                    "userIndents": i_result,
                                    "users": iu_result
                                })
                            }
                        });
                    }
                });
            }
        })
    })
}

module.exports = new user_report()