const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const auto_pr_items_wbs = function () {}


auto_pr_items_wbs.prototype.auto_pr_items_wbs_func = function (req, res, callback) {
    // console.log(req.body);

    con.query(`SELECT store_locations FROM user_details where id  = ${req.query.user_id}`, function (serrs, sresults, fields) {
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
                con.query(`SELECT a.material_id, a.wbs, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, sum(a.pr_qty) as quantity, (SELECT JSON_OBJECT('id', b.id, 'material_sap_id', b.material_sap_id, 'material_sap_id', b.material_sap_id , 'material_sap_id', b.material_sap_id, 'name', b.name, 'base_unit', b.base_unit)) AS 'material' from PR_items as a  JOIN material_items AS b ON b.id = a.material_id  JOIN user_indents as c ON c.id=a.indent_id  JOIN user_orders as d ON d.id=c.order_id where a.wbs IS NOT NULL and a.status = '1' and c.status NOT IN (3) and a.pr_raised = '0' and d.md_approval = '0' and d.plant_id in (${storeArray.join()})  group by a.wbs, a.material_id`, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else {
                        // console.log(result, '------wbs------');

                        if (result.length > 0) {
                            var wbsArray = [];

                            result.forEach((o, i) => {
                                o.id = i + 1;
                                wbsArray.push(o.wbs);
                            });
                            var wbs = [...new Set(wbsArray)]

                            setTimeout(function () {
                                res.status(200).json({
                                    "success": true,
                                    "data": {
                                        "wbs": wbs
                                    }
                                })
                            }, 10);
                        } else {

                            res.status(200).json({
                                "success": true,
                                "data": {
                                    "wbs": []
                                }
                            })
                        }
                    }
                });
            } else {

                res.status(200).json({
                    "success": true,
                    "data": {
                        "wbs": []
                    }
                })
            }
        }
    })
}

module.exports = new auto_pr_items_wbs()