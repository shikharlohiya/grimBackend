const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const indent_count = function () {}


indent_count.prototype.indent_count_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);


        var orderQuery = `SELECT  (SELECT count(1) FROM user_indents WHERE order_id =a.id and status in (2)) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders AS a HAVING indent_count = total_count`

        var auto_pr_countss = `SELECT a.material_id, a.wbs, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, sum(a.pr_qty) as quantity, sum(a.pr_qty) as pr_quantity, (SELECT JSON_OBJECT('id', b.id, 'material_sap_id', b.material_sap_id, 'material_sap_id', b.material_sap_id , 'material_sap_id', b.material_sap_id, 'name', b.name, 'base_unit', b.base_unit)) AS 'material' from PR_items as a  JOIN material_items AS b ON b.id = a.material_id  JOIN user_indents as c
        ON c.id=a.indent_id  JOIN user_orders as d
        ON d.id=c.order_id where a.wbs IS NOT NULL and a.status = 1 and c.status = 2 and a.pr_raised = '0' and d.md_approval = '0'  group by a.wbs, a.material_id`

        con.query(orderQuery, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                con.query(auto_pr_countss, function (pr_err, pr_result, fields) {
                    if (pr_err) {
                        console.log(pr_err);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        res.status(200).json({
                            "success": true,
                            "count": result.length,
                            "auto_pr_count": pr_result.length
                        })
                    }
                });
            }
        });
    })
}

module.exports = new indent_count()