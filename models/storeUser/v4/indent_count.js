const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const indent_count = function () {}


indent_count.prototype.indent_count_func = function (req, res, callback) {
    // console.log(req.body);

    con.query(`SELECT store_locations FROM user_details where id  = ${req.body.user_id}`, function (serrs, sresults, fields) {
        if (serrs) {
            console.log(serrs);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": serrs
            })
        } else {
            var storeArray = sresults.map(({
                store_locations
            }) => store_locations);
            // console.log(storeArray);

            storeArray = JSON.parse(storeArray);
            if (storeArray.length > 0) {

                var orderQuery = `SELECT (SELECT count(1) FROM user_indents WHERE order_id =a.id and status in (2)) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders AS a WHERE plant_id in (${storeArray.join()}) HAVING indent_count = total_count`

                var auto_pr_countss = `SELECT a.material_id, a.wbs, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, sum(a.pr_qty) as quantity, sum(a.pr_qty) as pr_quantity, (SELECT JSON_OBJECT('id', b.id, 'material_sap_id', b.material_sap_id, 'material_sap_id', b.material_sap_id , 'material_sap_id', b.material_sap_id, 'name', b.name, 'base_unit', b.base_unit)) AS 'material' from PR_items as a  JOIN material_items AS b ON b.id = a.material_id  JOIN user_indents as c ON c.id=a.indent_id  JOIN user_orders as d ON d.id=c.order_id where a.wbs IS NOT NULL and a.status = '1' and c.status NOT IN (3) and a.pr_raised = '0' and d.md_approval = '0' AND d.plant_id in (${storeArray.join()})  group by a.wbs, a.material_id`

                var sto_count = `SELECT (SELECT count(1) FROM user_indents WHERE order_id =a.id and status in (1)) as indent_count, (SELECT count(1) FROM user_indents WHERE order_id =a.id ) as total_count FROM user_orders as a WHERE a.type='STO' AND a.md_approval = '0' AND a.plant_id in (${storeArray.join()}) HAVING indent_count = total_count`

                con.query(orderQuery, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else {
                        con.query(auto_pr_countss, function (pr_err, pr_result, fields) {
                            if (pr_err) {
                                console.log(pr_err);

                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint",
                                    "err": pr_err
                                })
                            } else {
                                con.query(sto_count, function (sto_err, sto_result, fields) {
                                    if (sto_err) {
                                        console.log(sto_err);

                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": sto_err
                                        })
                                    } else {

                                        res.status(200).json({
                                            "success": true,
                                            "count": result.length,
                                            "auto_pr_count": pr_result.length,
                                            "sto_count": sto_result.length
                                        })
                                    }
                                });
                            }
                        });
                    }
                });

            } else {

                res.status(200).json({
                    "success": true,
                    "count": [],
                    "auto_pr_count": []
                })
            }
        }
    })
}

module.exports = new indent_count()