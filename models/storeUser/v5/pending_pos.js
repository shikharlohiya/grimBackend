const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const pending_pos = function () {}


pending_pos.prototype.pending_pos_func = function (req, res, callback) {


    var numRows;

    var numPerPage = req.body.npp || 10;
    var page = (req.body.page || 1) - 1;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    if (req.body.user_id != undefined) {
        var filter_query = `and a.created_by = ${req.body.user_id}`
    } else {
        var filter_query = ``

    }
    con.query(`SELECT a.PO_number, (Select PO_created_at FROM purchase_requests Where PO_number = a.PO_number LIMIT 1) as PO_created_at, COUNT(a.PO_number) as PO_count FROM purchase_requests as a WHERE a.PO_number is not null and GRN is null GROUP BY a.PO_number ORDER BY a.created_at DESC LIMIT ${limit}`, function (po_err, po_result, fields) {
        if (po_err) {
            console.log(po_err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": po_err
            })
        } else if (po_result.length > 0) {
            po_result.forEach((poitem, indexx) => {

                con.query(`SELECT a.*, b.name, b.material_sap_id, b.image_url, b.price, b.material_group_sap_id, b.material_type_sap_id, (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT wbs_desc FROM wbs_numbers WHERE wbs_number = a.wbs ) as wbs_desc, (SELECT color FROM order_status WHERE value = a.status ) as color, a.status FROM purchase_requests as a LEFT JOIN material_items as b ON a.product_id = b.id WHERE GRN is null and a.PO_number =  '${poitem.PO_number}' ORDER BY a.created_at DESC`, function (err, result, fields) {
                    if (err) {
                        console.log(err);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": err
                        })
                    } else if (result.length > 0) {
                        result.forEach((item, index) => {
                            con.query(`SELECT a.indent_id, a.pr_qty, a.created_by, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name, (SELECT created_at FROM user_indents WHERE id = a.indent_id ) as created_at, (SELECT order_id FROM user_indents WHERE id = a.indent_id ) as order_id, (SELECT s_no FROM user_indents WHERE id = a.indent_id ) as s_no FROM PR_items as a WHERE purchase_request_id = ${item.id}`, function (i_err, i_result, fields) {
                                if (i_err) {
                                    console.log(i_err);

                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": i_err
                                    })
                                } else {
                                    result[index].indents = i_result;
                                    if (index == result.length - 1) {
                                        po_result[indexx].materials = result;
                                        if (indexx == po_result.length - 1) {
                                            setTimeout(function () {
                                                res.status(200).json({
                                                    "success": true,
                                                    "data": {
                                                        "result": po_result
                                                    }
                                                })
                                            }, 3000);
                                        }
                                    }

                                }
                            });
                        })
                    } else {
                        res.status(200).json({
                            "success": true,
                            "data": {
                                "result": []
                            }
                        })
                    }
                });
            })
        } else {

            res.status(200).json({
                "success": true,
                "data": {
                    "result": []
                }
            })
        }
    });
}

module.exports = new pending_pos()