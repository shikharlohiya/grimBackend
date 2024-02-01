const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');

var request = require('request');
require('dotenv/config')


const edit_indent = function () { }


edit_indent.prototype.edit_indent_func = function (req, res, callback) {
    // console.log(req.body);
    con.query(`SELECT order_id, (SELECT first_name FROM user_details where id = ${req.body.item.indentUser_id} ) as user_name, (SELECT email FROM user_details where id = ${req.body.item.indentUser_id} ) as user_email,  total_price, quantity, price FROM user_indents where id = ${req.body.item.id} and status in(1, 22)`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else if (result.length == 0) {

            res.status(500).json({
                "success": false,
                "message": "Something went wrong...!"
            })
        } else if (result.length > 0) {
            // console.log(result, '-----------');

            if (result[0].total_price > req.body.item.total_price) {
                var total_query = `UPDATE user_orders set total = total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) WHERE id = ${result[0].order_id}`
            } else {
                var total_query = `UPDATE user_orders set total = total+(${req.body.item.total_price} - ${result[0].quantity * result[0].price} ) WHERE id = ${result[0].order_id}`
            }

            // md_approval = Case
            // When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) > 200000 Then '1' 
            // When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) < 200000 Then '0'
            // End WHERE id = ${result[0].order_id}

            // console.log(total_query, '------------------------');

            con.query(total_query, function (derr, dresult, fields) {
                if (derr) {
                    console.log(derr);

                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": derr
                    })
                } else {
                    // console.log(dresult, '-----------');
                    var indent_query = `UPDATE user_indents set total_price = ${req.body.item.total_price}, quantity = ${req.body.item.quantity}, remaining_qty = ${req.body.item.quantity}, intial_qty = ${req.body.item.quantity},delivery_priority = '${req.body.item.delivery_priority}', reason = '${req.body.item.reason}',where_used = '${req.body.item.where_used}',section = '${req.body.item.section}',tracking_no = '${req.body.item.tracking_no}',priority_days = '${req.body.item.priority_days}',updated_at = now() WHERE id = ${req.body.item.id}`

                    con.query(indent_query, function (uierr, uiresult, fields) {
                        if (uierr) {
                            console.log(uierr);

                            res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": uierr
                            })
                        } else {
                            // console.log(uiresult, '--------');
                            if (req.body.item.role_id == 2 || req.body.item.role_id == 19) {

                                var substitutions = {
                                    "from": "IBGroup <grim@ibgroup.co.in>",
                                    "to": result[0].user_email,
                                    "subject": `Indent ${result[0].order_id} is modified by ${req.body.item.first_name}`,
                                    "template": "indentModifiedTemp",
                                    "view": {
                                        "first_name": result[0].user_name,
                                        "indent_id": result[0].order_id,
                                        "modified_by_name": req.body.item.first_name,
                                        "link": process.env.link
                                    }

                                }
                                axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                    .then(function (response) {
                                        // console.log(response);
                                    }).catch(function (error) {
                                        // handle error
                                        console.log(error);
                                    })
                                setTimeout(function () {

                                    res.status(200).json({
                                        "success": true,
                                        "message": "Indent Edited Successfully"
                                    })
                                }, 10);

                            } else {
                                setTimeout(function () {

                                    res.status(200).json({
                                        "success": true,
                                        "message": "Indent Edited Successfully"
                                    })
                                }, 100);
                            }


                        }
                    });
                }
            });
        }
    });
}

module.exports = new edit_indent()