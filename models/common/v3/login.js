const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database

const login = function () {}


login.prototype.login_func = function (req, res, callback) {
  mysqlPool.getConnection(function (err, con) {
    if (err) {
      console.log(err);

      res.status(500).json({
        "success": false,
        "message": "Error with endpoint"
      })
    } else {
      console.log(req.body);
      
      var da = new Date();
      var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
      var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
      var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);
  
      con.query(`SELECT id, sap_user_id, email, password, role_id, first_name, city, state, country, (SELECT name1 FROM plant_details WHERE id = location_id ) as location, (SELECT role FROM user_roles WHERE id = role_id ) as role, (SELECT department_name FROM departments WHERE id = department ) as department_name, department, mobile_no, is_password_changed, status FROM user_details where email = "${req.body.email}"`, function (err, result, fields) {

        con.release();
        if (err) {
          console.log(err);
          res.status(500).json({
            "success": false,
            "message": "Error with endpoint"
          })
        } else {
          if (result.length > 0) {
            if (result[0].status == 1) {
              if (result[0].password == req.body.password) {

                con.query(`UPDATE user_details set last_login = '${dateTime}'  where id = ${result[0].id}`, function (uerr, uresult, fields) {
                  if (uerr) {
                    console.log(uerr);
                    con.release();
                    res.status(500).json({
                      "success": false,
                      "message": "Error with endpoint"
                    })
                  } else {

                    res.status(200).json({
                      "success": true,
                      "message": "login sucessfully.",
                      "user": result
                    })
                  }
                });

              } else {
                res.status(200).json({
                  "success": false,
                  "message": "Email and password does not match."
                })
              }
            } else {
              res.status(200).json({
                "success": false,
                "message": "User Deactivated"
              })
            }

          } else {
            res.status(200).json({
              "success": false,
              "message": "Email does not exits."
            })
          }
        }
      });
    }
  })
}

module.exports = new login()