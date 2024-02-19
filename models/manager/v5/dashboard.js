const con = require("../../db1.js"),
  g_var = require("../../global_var.js")

const dashboard = function () { }


dashboard.prototype.dashboard_func = function (req, res, callback) {
  // console.log(req.body);
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


          con.query(`SELECT id FROM user_orders where user_id in (${idsArray.join()}) AND (date(created_at) >= '${req.body.from_date}' AND date(created_at) <= '${req.body.to_date}') ORDER BY id DESC`, function (err, result, fields) {
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
      });
    }
  });
}

module.exports = new dashboard()