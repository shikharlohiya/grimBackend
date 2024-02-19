const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const update_service_status = function () {}

update_service_status.prototype.update_service_status_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                if (req.body.role_id == 11) {
                    var rm_approval = `, rm_approval = '1'`
                } else {
                    var rm_approval = ``
                }
                if (req.body.role_id == 12) {
                    var pm_approval = `, pm_approval = '1'`
                } else {
                    var pm_approval = ``
                }
                console.log(req.body);
                con.query(`UPDATE new_service_request set status = ${req.body.status}${rm_approval}${pm_approval} WHERE id = ${req.body.id}`, function (cerr, cresult, fields) {
                    if (cerr) {
                        console.log(cerr);
                        con.rollback(function () {
                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": cerr
                            })
                        })
                    } else {
                        if (req.body.status == 3) {

                            var finish = '0'
                        } else {
                            var finish = '1'
                        }

                        con.query(`UPDATE Indent_approvals set finish = '${finish}' where indent_id = ${req.body.id} and role_id = ${req.body.role_id} and service_id = 3`, function (ia_err, ia_result, fields) {
                            if (ia_err) {
                                console.log(ia_err);
                                con.rollback(function () {
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": ia_err
                                    })
                                });

                            } else {
                                console.log(ia_result);
                                con.query(`INSERT INTO service_status_logs ( service_request_id, status, remarks, created_by, role_id) VALUES (${req.body.id},${req.body.status}, '${req.body.remarks}', ${req.body.user_id}, ${req.body.role_id})`, function (serr, sresult, fields) {
                                    if (serr) {
                                        console.log(serr);
                                        con.rollback(function () {
                                            res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint",
                                                "err": serr
                                            })
                                        })
                                    } else {
                                        con.query(`select *,(select first_name from user_details where id = approver_id) as approver_name from Indent_approvals where id > (select max(id) from Indent_approvals where role_id = ${req.body.role_id} and indent_id = ${req.body.id} and service_id = 3) limit 1;`, function (ap_err, ap_result) {
                                            if (ap_err) {
                                                console.log(ap_err);
                                            }
                                            if (ap_result.length == 0) {
                                                con.query(`UPDATE new_service_request set approval_finish = '1'  where id = ${req.body.id}`, function (ai_err, ai_result, fields) {
                                                    if (ai_err) {
                                                        console.log(ai_err);
                                                    }
                                                })
                                            }
                                        })
                                        con.commit(function (err) {
                                            if (err) {
                                                con.rollback(function () {
                                                    throw err;
                                                });
                                            }

                                            res.status(200).json({
                                                "success": true,
                                                "message": "Updated Successfully"
                                            })
                                        })
                                    }
                                });
                            }
                        })
                    }
                });

            }
        })
    })
}

module.exports = new update_service_status()