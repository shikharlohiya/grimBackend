const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

var request = require('request');


const edit_indent = function () {}


edit_indent.prototype.edit_indent_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        con.query(`SELECT order_id, (SELECT first_name FROM user_details where id = ${req.body.item.indentUser_id} ) as user_name, (SELECT email FROM user_details where id = ${req.body.item.indentUser_id} ) as user_email,  total_price, quantity, price FROM user_indents where id = ${req.body.item.id} and status = 1`, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else if (result.length == 0) {
                res.status(500).json({
                    "success": false,
                    "message": "Something went wrong...!"
                })
            } else if (result.length > 0) {
                console.log(result, '-----------');

                if (result[0].total_price > req.body.item.total_price) {
                    var total_query = `UPDATE user_orders set total = total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ),  md_approval = Case
                            When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) > 200000 Then '1' 
                            When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) < 200000 Then '0'
                            End WHERE id = ${result[0].order_id}`
                } else {
                    var total_query = `UPDATE user_orders set total = total+(${req.body.item.total_price} - ${result[0].quantity * result[0].price} ),  md_approval = Case
                            When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) > 200000 Then '1' 
                            When total-(  ${result[0].quantity * result[0].price} - ${req.body.item.total_price} ) < 200000 Then '0'
                            End WHERE id = ${result[0].order_id}`
                }

                console.log(total_query, '------------------------');

                con.query(total_query, function (derr, dresult, fields) {
                    if (derr) {
                        console.log(derr);
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        console.log(dresult, '-----------');
                        var indent_query = `UPDATE user_indents set total_price = ${req.body.item.total_price}, quantity = ${req.body.item.quantity}, delivery_priority = '${req.body.item.delivery_priority}', updated_at = now() WHERE id = ${req.body.item.id}`
                        console.log(indent_query, '000000000000000000');

                        con.query(indent_query, function (uierr, uiresult, fields) {
                            if (uierr) {
                                console.log(uierr);
                                res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                })
                            } else {
                                console.log(uiresult, '--------');
                                if (req.body.item.role_id == 2) {

                                    request.post({
                                        url: 'https://api.sendgrid.com/v3/mail/send',
                                        headers: {
                                            'Authorization': 'Bearer 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',
                                            'Content-Type': 'application/json'
                                        },
                                        body: {


                                            "from": {
                                                "email": "IBGroup <grim@ibgroup.co.in>"
                                            },
                                            "personalizations": [{
                                                "to": [{
                                                    "email": result[0].user_email
                                                    // "email": 'sisindri.s@nexivo.co'

                                                }],
                                                "dynamic_template_data": {
                                                    "first_name": result[0].user_name,
                                                    "indent_id": result[0].order_id,
                                                    "modified_by_name": req.body.item.first_name,
                                                    "subject": `Indent ${ result[0].order_id} is modified by ${ req.body.item.first_name}`,
                                                    "link":'https://grim.co.in'
                                                    // "date": ndate,
                                                    // "remarks": req.body.remarks,
                                                    // "material": `${req.body.product_id} - ${mt_result[0].name}`
                                                }
                                            }],
                                            "template_id": "d-32f41dff732e4d4b99e7b2e28c8c3115"
                                        },
                                        json: true
                                    }, function (error, response, body) {
                                        console.log(error, '---------------');
                                        setTimeout(function () {
                                            res.status(200).json({
                                                "success": true,
                                                "message": "Indent Edited Successfully"
                                            })
                                        }, 100);
                                    });


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

    })
}

module.exports = new edit_indent()