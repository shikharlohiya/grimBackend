const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database
var request = require('request');
require('dotenv/config')

const create_order = function () {}


create_order.prototype.create_order_func = function (req, res, callback) {
  mysqlPool.getConnection(function (err, con) {
    console.log('--------');

    con.beginTransaction(function (err) {
      if (err) {
        throw err;
      } else {
        console.log(req.body);

        var order = req.body.order

        if (true) {
          var md_approval = '0';
        } else {
          var md_approval = '1';

        }

        if (order.WBS_NO == undefined) {
          order.WBS_NO = "WBS_GENERAL";
        }
        con.query(`INSERT INTO user_orders (user_id, plant_id, total,status, address, WBS_NO, md_approval, created_at, created_by) VALUES (${order.user_id},${order.plant.id}, ${order.total},1 , ${order.address}, '${order.WBS_NO}', '${md_approval}', now(),${order.user_id})`, function (o_err, o_result) {
          if (o_err) {
            console.log(o_err);
            con.rollback(function () {

              con.release();
              res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
              })
            });
          } else {

            order.items.forEach((item, index) => {
              if (item.reason == undefined) {
                item.reason = "";
              }
              if (item.where_used == undefined) {
                item.where_used = "";
              }

              if (order.role_id == 2) {
                var status = 2;
              } else {
                var status = 1;
              }

              con.query(`INSERT INTO user_indents ( product_id, user_id, order_id, quantity, remaining_qty, intial_qty, price, total_price, delivery_priority, tracking_no, section, reason, where_used, priority_days, status, created_at, created_by, s_no) VALUES (${item.product_id}, ${order.user_id}, ${o_result.insertId},${item.quantity},${item.quantity},${item.quantity},${item.price},${item.total_price},'${item.delivery_priority}','${item.tracking_no}', '${item.section}', '${item.reason}', '${item.where_used}', '${item.priority_days}', ${status} , now(),${order.user_id}, ${index+1})`, function (i_err, i_result) {
                if (i_err) {
                  console.log(i_err);

                  con.rollback(function () {

                    con.release();
                    res.status(500).json({
                      "success": false,
                      "message": "Error with endpoint"
                    })
                  });
                } else {
                  if (order.role_id == 2) {

                    var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at) VALUES (${i_result.insertId}, ${o_result.insertId},1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now()); INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at) VALUES (${i_result.insertId}, ${o_result.insertId},2, '${item.remarks}', ${item.quantity}, ${order.user_id} , now())`;
                    var pr_status = '1';
                  } else {
                    var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at) VALUES (${i_result.insertId}, ${o_result.insertId},1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now())`;
                    var pr_status = '0';

                  }

                  con.query(statusQuery, function (os_err, os_result) {
                    if (os_err) {
                      console.log(os_err);
                      con.rollback(function () {

                        con.release();
                        res.status(500).json({
                          "success": false,
                          "message": "Error with endpoint"
                        })
                      });
                    } else {

                      var get_content = `SELECT content FROM notification_meta WHERE event = 'pending' and role = 3; SELECT content FROM notification_meta WHERE event = 'pending' and role = 2; SELECT content FROM notification_meta WHERE event = 'pending' and role = 4;`
                      con.query(get_content, function (nerr, nresult) {
                        if (nerr) {
                          console.log(nerr);
                        } else {
                          // console.log(nresult[0][0].content);

                          //   nresult[0].content.replace("<<order_id>>", o_result.insertId);
                          //   nresult[1].content.replace("<<order_id>>", o_result.insertId).replace("role", "Indent User").replace("<<userName>>", req.body.first_name)
                          //   nresult[1].content.replace("<<order_id>>", o_result.insertId).replace("role", "Indent User").replace("<<userName>>", req.body.first_name)
                          //   console.log("nlogs:----------",nresult);
                          if (order.role_id == 3) {
                            var m_id = `(SELECT manager_id FROM user_details WHERE id = ${order.user_id})`;

                          } else {
                            var m_id = `${order.user_id}`;

                          }

                          var update_content = `INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},${order.user_id}, '${nresult[0][0].content.replace("<<order_id>>", o_result.insertId)}', ${o_result.insertId}, ${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id})); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},${m_id}, '${nresult[1][0].content.replace("<<order_id>>", o_result.insertId).replace("<<role>>", "Indent User").replace("<<userName>>", req.body.order.first_name)}',${o_result.insertId},${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id})); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},4, '${nresult[2][0].content.replace("<<order_id>>", o_result.insertId).replace("<<role>>", "Indent User").replace("<<userName>>", req.body.order.first_name)}',${o_result.insertId},${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id}));`
                          con.query(update_content, function (unerr, unresult) {
                            if (unerr) {
                              console.log(unerr);
                            } else {
                              console.log("unlogs:----------", unresult);

                            }
                          });
                        }
                      });
                      console.log((item.stock - item.bag) - item.quantity, '------------bag');

                      if ((item.stock - item.bag) - item.quantity < 0) {
                        console.log('-------------------');
                        if ((item.stock - item.bag) < 0) {
                          var bagcount = 0;

                        } else {
                          var bagcount = item.stock - item.bag;

                        }
                        con.query(`INSERT INTO PR_items ( indent_id, material_id, plant_id,store_id, wbs, requested_qty, pr_qty, status, created_by) VALUES (${i_result.insertId}, ${item.product_id}, '${order.plant.plant_id}','${order.plant.storage_loc}', '${order.WBS_NO}', ${item.quantity},${item.quantity - bagcount}, '${pr_status}', ${order.user_id} )`, function (pr_err, pr_result) {
                          if (pr_err) {
                            console.log(pr_err);
                            con.rollback(function () {

                              con.release();
                              res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                              })
                            });
                          } else {
                            console.log('Pr_items inserted');

                          }
                        })
                      }
                      if (index == order.items.length - 1) {

                        con.commit(function (err) {
                          if (err) {
                            connection.rollback(function () {
                              throw err;
                            });
                          }
                          var data = req.body.order;
                          data.id = o_result.insertId;
                          data.created_at = new Date();
                          //   request.post({
                          //     url: 'http://182.74.225.39:3002/api/v2/notification_post',
                          //     headers: {
                          //       'Content-Type': 'application/json'
                          //     },
                          //     body: {
                          //       title: `Your order is placed with order id ${o_result.insertId}`,
                          //       content: {
                          //         'order_id': o_result.insertId
                          //       },
                          //       user_id: order.user_id
                          //     },
                          //     json: true
                          //   }, function (error, nresponse, body) {
                          //     console.log(error);
                          //     // console.log(nresponse);
                          //     // console.log(body);

                          //   });

                          // if (order.role_id == 3) {
                          con.query(`SELECT a.manager_id, (SELECT email FROM user_details WHERE id = a.manager_id group by id ) as manager_email, (SELECT email FROM user_details WHERE id = "${order.user_id}" ) as user_email, (SELECT first_name FROM user_details WHERE id = a.manager_id group by id ) as manager_name, (SELECT storage_location_desc FROM plant_details_sync WHERE id = ${order.address}) as delivery_location, (SELECT storage_location_desc FROM plant_details_sync WHERE id = ${order.plant.id}) as plant_location FROM user_details as a where id = "${order.user_id}"`, function (ms_err, ms_result) {
                            if (ms_err) {
                              console.log(ms_err);

                              con.release();
                              res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                              })
                            } else {
                              var date = new Date();
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
                                      "email": `${ms_result[0].user_email}`
                                    }],
                                    "dynamic_template_data": {

                                      "subject": `New Indent ${o_result.insertId} Raised `,
                                      "total": `${order.total}`,
                                      "items": req.body.order.items,
                                      "receipt": true,
                                      "first_name": `${order.first_name}`,
                                      "manager_name": `${ms_result[0].manager_name}`,
                                      "address": `${ms_result[0].delivery_location}`,
                                      "plant_location": `${ms_result[0].plant_location}`,
                                      "indent_id": o_result.insertId,
                                      "date": date,
                                      "wbs_no": order.WBS_NO,
                                      "link": process.env.link
                                    }
                                  }],
                                  "template_id": "d-bba865b627c14d45958664edf398e39c"
                                },
                                json: true
                              }, function (error, response, body) {
                                console.log(error, '---------------');
                                if (order.role_id == 3) {
                                  var date = new Date();
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
                                          "email": `${ms_result[0].manager_email}`
                                          // "email": 'sisindri.s@nexivo.co'

                                        }],
                                        "dynamic_template_data": {

                                          "subject": "Indent For Approval",
                                          "total": `${order.total}`,
                                          "items": req.body.order.items,
                                          "receipt": true,
                                          "first_name": `${order.first_name}`,
                                          "manager_name": `${ms_result[0].manager_name}`,
                                          "address": `${ms_result[0].delivery_location}`,
                                          "plant_location": `${ms_result[0].plant_location}`,
                                          "indent_id": o_result.insertId,
                                          "date": date,
                                          "wbs_no": order.WBS_NO,
                                          "link": process.env.link
                                        }
                                      }],
                                      "template_id": "d-2a87046e72394b42a27ede922c84f330"
                                    },
                                    json: true
                                  }, function (error, response, body) {
                                    console.log(error, '---------------');

                                    con.release();
                                    res.status(200).json({
                                      "success": true,
                                      "message": "Indent Created Successfully",
                                      "data": data
                                    });
                                  });
                                } else {

                                  con.release();
                                  res.status(200).json({
                                    "success": true,
                                    "message": "Indent Created Successfully",
                                    "data": data
                                  })
                                }
                              });
                            }
                          })
                          // } else {
                          //   res.status(200).json({
                          //     "success": true,
                          //     "message": "Indent Created Successfully",
                          //     "data": data
                          //   })
                          // }
                        })
                      }
                    }
                  });
                }
              });
            })
          }
        });
      }
    })
  })
}

module.exports = new create_order()