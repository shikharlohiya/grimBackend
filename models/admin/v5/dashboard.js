const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const dashboard = function () {}


dashboard.prototype.dashboard_func = function (req, res, callback) {
    // console.log(req.body);

    if (req.body.department != undefined && req.body.department != "" && req.body.department != null) {
        var departmentFilter = `and b.department = ${req.body.department}`
    } else {
        var departmentFilter = ""

    }

    con.query(`SELECT a.id FROM user_orders as a JOIN user_details AS b ON b.id = a.user_id where (date(a.created_at) >= '${req.body.from_date}' AND date(a.created_at) <= '${req.body.to_date}') ${departmentFilter} ORDER BY id DESC`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else if (result.length > 0) {
            // console.log(result);
            var idsArrays = result.map(({
                id
            }) => id);

            con.query(`SELECT (SELECT CONCAT(plant_id,'-',storage_location,'-',storage_location_desc) FROM plant_details_sync WHERE t2.address = id ) as address, COUNT(IF(t1.status=1,1, NULL)) 'Pending', COUNT(IF(t1.status=2,1, NULL)) 'Approved', COUNT(IF(t1.status=3,1, NULL)) 'Rejected',  COUNT(IF(t1.status=5,1, NULL)) 'Dispatched', COUNT(IF(t1.status=7,1, NULL)) 'PRRaised', COUNT(IF(t1.status=8,1, NULL)) 'PORaised', COUNT(IF(t1.status=15,1, NULL)) 'GRNDone',COUNT(IF(t1.status=11,1, NULL)) 'Completed',COUNT(IF(t1.status=12,1, NULL)) 'Return',COUNT(IF(t1.status=13,1, NULL)) 'ReturnApproved',COUNT(IF(t1.status=14,1, NULL)) 'ReturnCompleted'  FROM user_indents as t1 left join user_orders as t2 on t1.order_id=t2.id where t1.order_id in (${idsArrays.join()}) GROUP BY t2.address`, function (lperr, lpresult) {
                if (lperr) {
                    console.log(lperr);

                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": lperr
                    })
                } else {
                    // console.log(lpresult);

                    res.status(200).json({
                        "success": true,
                        "orders": lpresult
                    })
                }
            });

        } else {

            res.status(200).json({
                "success": true,
                "orders": []
            })
        }
    });
}

module.exports = new dashboard()