const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const vendors = function () {}


vendors.prototype.vendors_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        var indentList = [];
        var indents = [];
        con.query(`SELECT id FROM user_details where manager_id =  ${req.body.user_id}`, function (m_err, m_result, fields) {
            if (m_err) {
                console.log(m_err);
                con.release();
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                var idsArray = m_result.map(({
                    id
                }) => id);
                idsArray.push(req.body.user_id);
                con.query(`SELECT id,user_id, name, vendor_name, mobile_no,address,is_verified, manager_remarks, created_at,(SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, (SELECT first_name FROM user_details WHERE id = user_id ) as user_name FROM vendors where user_id in (${idsArray.join()}) ORDER BY id DESC`, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        con.release();
                        res.status(200).json({
                            "success": true,
                            "vendors": result
                        })
                    }
                });

            }
        });
    })
}

module.exports = new vendors()