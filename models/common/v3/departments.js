const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const departments = function () { }

var da = new Date();
var date =
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


departments.prototype.departments_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        con.query(`SELECT a.*, (SELECT JSON_OBJECT('id', b.id, 'sap_user_id', b.sap_user_id, 'first_name', b.first_name , 'department', b.department)) AS 'user_details'  FROM departments as a LEFT JOIN user_details as b ON a.department = b.id`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length > 0) {
                result.forEach((department, index) => {
                    department.user_details = JSON.parse(department.user_details);
                    if (index == result.length - 1) {
                        setTimeout(function () {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "departments": result
                            })
                        }, 10);
                    }
                })
            } else {
                con.release();
                res.status(200).json({
                    "success": true,
                    "departments": []
                })
            }
        });
    })
}

departments.prototype.departments_delete_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`UPDATE departments set status = ${req.body.status} WHERE id = ${req.body.id}`, function (err, result, fields) {
            if (err) {
                console.log(err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                if (req.body.status == 1) {
                    var message = "Department Enabled Successfully";
                } else {
                    var message = "Department Disabled Successfully";

                }
                con.release();
                res.status(200).json({
                    "success": true,
                    "message": message
                })
            }
        });
    })
}


departments.prototype.departments_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {

        console.log(req.body);
        var department = req.body.department;

        if (department.department_name != undefined && department.description != undefined && department.user_id != undefined) {
            con.query(`SELECT id FROM departments WHERE department_name = '${department.department_name}'`, function (err, result) {
                if (err) {
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error while creating department details...!",
                        "err": err
                    })
                } else if(result.length == 0) {
                    con.query(`INSERT INTO departments (department_name, description,status, user_id) VALUES ('${department.department_name}','${department.description}', ${department.status}, ${department.user_id}')`, function (o_err, o_result) {
                        if (o_err) {
                            con.release();
                            res.status(500).json({
                                "success": false,
                                "message": "Error while creating department details...!",
                                "err": o_err
                            })
                        } else {
                            con.release();
                            res.status(200).json({
                                "success": true,
                                "message": "Department Created Successfully",
                                "data": o_result
                            })
                        }
                    })
                } else {
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Department Already Exist..."
                    })
                }
            })
        } else {
            con.release();
            res.status(500).json({
                "success": false,
                "message": "Error while creating department details...!"
            })
        }
    })
}

module.exports = new departments()