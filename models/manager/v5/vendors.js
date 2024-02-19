const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const vendors = function () { }


vendors.prototype.vendors_func = function (req, res, callback) {
    // console.log(req.body);
    var indentList = [];
    var indents = [];
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
                    con.query(`SELECT id,user_id, name, vendor_name, mobile_no,address,is_verified, manager_remarks, created_at,(SELECT description FROM order_status WHERE value = status ) as status, (SELECT color FROM order_status WHERE value = status ) as color, (SELECT first_name FROM user_details WHERE id = user_id ) as user_name FROM vendors where user_id in (${idsArray.join()}) ORDER BY id DESC`, function (err, result, fields) {
                        if (err) {
                            console.log(err);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": err
                            })
                        } else {

                            res.status(200).json({
                                "success": true,
                                "vendors": result
                            })
                        }
                    });

                }
            });
        }
    });
}

module.exports = new vendors()