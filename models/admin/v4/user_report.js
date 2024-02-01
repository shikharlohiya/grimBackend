const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const user_report = function () {}


user_report.prototype.user_report_func = function (req, res, callback) {
    // console.log(req.body);
    var materialArray = [];
    var filterStatus = ''
    if (req.body.indent_status.length == 0) {
        filterStatus += ''

    } else {
        filterStatus += `AND a.status in (${req.body.indent_status.join()})`

    }

    if (req.body.department != undefined && req.body.department != "" && req.body.department != null) {
        var departmentFilter = `and d.department = ${req.body.department}`
        var depFilter = `WHERE a.department = ${req.body.department}`

    } else {
        var departmentFilter = ""

    }


    con.query(`SELECT t1.user_id, (SELECT first_name FROM user_details WHERE id = t1.user_id ) as first_name, COUNT(DISTINCT(t1.order_id)) as indent_count, COUNT(DISTINCT(t1.id)) as total_materials, COUNT(IF(t1.status=1,1, NULL)) 'Pending', COUNT(IF(t1.status=2,1, NULL)) 'Approved', COUNT(IF(t1.status=3,1, NULL)) 'Rejected',  COUNT(IF(t1.status=5,1, NULL)) 'Dispatched', COUNT(IF(t1.status=7,1, NULL)) 'PRRaised', COUNT(IF(t1.status=8,1, NULL)) 'PORaised', COUNT(IF(t1.status=15,1, NULL)) 'GRNDone', COUNT(IF(t1.status=17,1, NULL)) 'PRRejected', COUNT(IF(t1.status=18,1, NULL)) 'PRCancelled',COUNT(IF(t1.status=11,1, NULL)) 'Completed',COUNT(IF(t1.status=12,1, NULL)) 'Return',COUNT(IF(t1.status=13,1, NULL)) 'ReturnApproved',COUNT(IF(t1.status=14,1, NULL)) 'ReturnCompleted', COUNT(IF(t1.status=19,1, NULL)) 'STORaised', COUNT(IF(t1.status=20,1, NULL)) 'STODispatched' , COUNT(IF(t1.status=21,1, NULL)) 'STOReceived' FROM user_indents as t1  JOIN user_orders as t2 ON t1.order_id = t2.id JOIN user_details AS d ON d.id = t1.user_id where (date(t1.created_at) >= '${req.body.from_date}' AND date(t1.created_at) <= '${req.body.to_date}') ${departmentFilter} GROUP BY t1.user_id, first_name`, function (i_err, i_result, fields) {
        if (i_err) {
            console.log(i_err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": i_err
            })
        } else {
            con.query(`SELECT a.id, a.first_name, a.created_at, a.last_login, a.last_logout, (SELECT department_name FROM departments WHERE id = a.department ) as department_name, (SELECT role FROM user_roles WHERE id = a.role_id ) as role, (SELECT first_name  from user_details where id = a.manager_id) as reporting_to, (SELECT JSON_OBJECT('id', b.id, 'plant_id', b.plant_id, 'storage_location', storage_location, 'storage_location_desc', b.storage_location_desc)) AS 'user_location' FROM user_details AS a LEFT JOIN plant_details_sync AS b ON b.id = a.location_id ${depFilter}`, function (iu_err, iu_result, fields) {
                if (iu_err) {
                    console.log(iu_err);

                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": iu_err
                    })
                } else {

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

module.exports = new user_report()