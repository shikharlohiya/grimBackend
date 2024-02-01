const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database
var request = require('request');
const axios = require('axios');
require('dotenv/config')

const create_order = function () {}


create_order.prototype.create_order_func = function (req, res, callback) {
  mysqlPool.getConnection(function (err, con) {
    console.log('--------');
if (false) {
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

        if (order.urgent_flag == true) {
          var urgent_flag = '1';
        } else {
          var urgent_flag = '0';

        }

        if (order.WBS_NO == undefined) {
          order.WBS_NO = "WBS_GENERAL";
        }

        if (order.role_id == 5) {
          var type = 'STO';
          var message = 'STO Created Successfully'
        } else {
          var type = 'indent';
          var message = 'Indent Created Successfully'

        }
        con.query(`INSERT INTO user_orders (user_id, plant_id, total,status, address, WBS_NO, md_approval, created_at, created_by, type, urgent_flag) VALUES (${order.user_id},${order.plant.id}, ${order.total},1 , ${order.address}, '${order.WBS_NO}', '${md_approval}', now(),${order.user_id}, '${type}', '${urgent_flag}')`, function (o_err, o_result) {
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
              if (order.role_id == 5) {
                var indent_type = 'STO';
              } else {
                var indent_type = 'normal';
              }

              if (item.bag == "undefined") {
                con.query(`SELECT IFNULL(sum(remaining_qty),0)-(SELECT IFNULL(sum(pr_qty),0) FROM PR_items where material_id =  ${item.product_id} and pr_raised = '0' and status = '1' and plant_id= '${order.plant.plant_id}' and store_id = '${order.plant.storage_loc}' ) as bag FROM user_indents as b where product_id =  ${item.product_id} and (select plant_id FROM user_orders where id = b.order_id) = '${order.plant.id}'`, function (b_err, b_result) {
                  if (b_err) {
                    console.log(b_err);
                    item.bag = 0
                  } else {
                    // console.log(b_result,'------------------');
                    item.bag = b_result[0].bag
                    // console.log(item.bag);
                  }
                })
              }

              item.price = item.price.toFixed(2);
              item.total_price = item.total_price.toFixed(2);
              con.query(`INSERT INTO user_indents ( product_id, user_id, order_id, quantity, remaining_qty, intial_qty, price, total_price, delivery_priority, tracking_no, section, reason, where_used, priority_days, status, created_at, created_by, s_no, type, delivery_date) VALUES (${item.product_id}, ${order.user_id}, ${o_result.insertId},${item.quantity},${item.quantity},${item.quantity},${item.price},${item.total_price},'${item.delivery_priority}','${item.tracking_no}', '${item.section}', '${item.reason}', '${item.where_used}', '${item.priority_days}', ${status} , now(),${order.user_id}, ${index+1}, '${indent_type}', '${item.delivery_date}')`, function (i_err, i_result) {
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
                  } else if (order.role_id == 5) {
                    var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at) VALUES (${i_result.insertId}, ${o_result.insertId},1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now())`;
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
                      if (order.role_id != 5) {
                        var get_content = `SELECT content FROM notification_meta WHERE event = 'pending' and role = 3; SELECT content FROM notification_meta WHERE event = 'pending' and role = 2; SELECT content FROM notification_meta WHERE event = 'pending' and role = 4;`

                        var store_content = `SELECT id FROM user_details WHERE JSON_CONTAINS(store_locations, '[${order.plant.id}]') and role_id = 5 LIMIT 1`

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

                            con.query(store_content, function (sierr, siresult) {
                              if (sierr) {
                                console.log(sierr);
                              } else {
                                if (siresult.length > 0) {
                                  var store_user_id = siresult[0].id
                                } else {
                                  var store_user_id = 1

                                }

                                var update_content = `INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},${order.user_id}, '${nresult[0][0].content.replace("<<order_id>>", o_result.insertId)}', ${o_result.insertId}, ${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id})); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},${m_id}, '${nresult[1][0].content.replace("<<order_id>>", o_result.insertId).replace("<<role>>", "Indent User").replace("<<userName>>", req.body.order.first_name)}',${o_result.insertId},${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id})); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${order.user_id},${store_user_id}, '${nresult[2][0].content.replace("<<order_id>>", o_result.insertId).replace("<<role>>", "Indent User").replace("<<userName>>", req.body.order.first_name)}',${o_result.insertId},${order.user_id}, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id}));`
                                con.query(update_content, function (unerr, unresult) {
                                  if (unerr) {
                                    console.log(unerr);
                                  } else {
                                    console.log("unlogs:----------", unresult);

                                  }
                                });

                              }
                            })
                          }
                        });
                      }
                      console.log((item.stock - item.bag) - item.quantity, '------------bag');

                      if ((item.stock - item.bag) - item.quantity < 0) {
                        // console.log('-------------------');
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
                            con.rollback(function () {
                              con.release();
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
                          con.query(`SELECT a.manager_id, (SELECT email FROM user_details WHERE id = a.manager_id group by id ) as manager_email, (SELECT email FROM user_details WHERE id = "${order.user_id}" ) as user_email, (SELECT first_name FROM user_details WHERE id = a.manager_id group by id ) as manager_name, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = ${order.address}) as delivery_location, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = ${order.plant.id}) as plant_location FROM user_details as a where id = "${order.user_id}"`, function (ms_err, ms_result) {
                            if (ms_err) {
                              console.log(ms_err);

                              con.release();
                              res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint"
                              })
                            } else {

                              ms_result[0].plant_location = JSON.parse(ms_result[0].plant_location)
                              ms_result[0].delivery_location = JSON.parse(ms_result[0].delivery_location)

                              var date = new Date();

                              if (order.role_id == 5) {
                                var dynamic_data = {
                                  "total": `${order.total}`,
                                  "items": req.body.order.items,
                                  "receipt": true,
                                  "first_name": `${order.first_name}`,
                                  "address": `${ms_result[0].delivery_location.plant_id} - ${ms_result[0].delivery_location.storage_location} - ${ms_result[0].delivery_location.plant_name}`,
                                  "plant_location": `${ms_result[0].plant_location.plant_id} - ${ms_result[0].plant_location.storage_location} - ${ms_result[0].plant_location.storage_location_desc}`,
                                  "indent_id": o_result.insertId,
                                  "date": date,
                                  "wbs_no": order.WBS_NO,
                                  "link": process.env.link
                                }
                              } else {
                                var dynamic_data = {
                                  "total": `${order.total.toFixed(2)}`,
                                  "items": req.body.order.items,
                                  "receipt": true,
                                  "first_name": `${order.first_name}`,
                                  "manager_name": `${ms_result[0].manager_name}`,
                                  "address": `${ms_result[0].delivery_location.plant_id} - ${ms_result[0].delivery_location.storage_location} - ${ms_result[0].delivery_location.plant_name}`,
                                  "plant_location": `${ms_result[0].plant_location.plant_id} - ${ms_result[0].plant_location.storage_location} - ${ms_result[0].plant_location.storage_location_desc}`,
                                  "indent_id": o_result.insertId,
                                  "date": date,
                                  "wbs_no": order.WBS_NO,
                                  "link": process.env.link
                                }
                              }

                              var substitutions = {
                                "from": "IBGroup <grim@ibgroup.co.in>",
                                "to": ms_result[0].user_email,
                                "subject": `New Indent ${o_result.insertId} Raised `,
                                "template": "newIndentRaisedtemp",
                                "view": dynamic_data
                              }

                              axios.post(`${process.env.host}/api/v3/sendmail`, substitutions)
                                .then(function (response) {
                                  // console.log(response);
                                }).catch(function (error) {
                                  // handle error
                                  console.log(error);
                                })

                              if (order.role_id == 3) {
                                var date = new Date();
                                var substitutions = {
                                  "from": "IBGroup <grim@ibgroup.co.in>",
                                  "to": ms_result[0].manager_email,
                                  "subject": `Indent For Approval`,
                                  "template": "indentApprovalTemp",
                                  "view": {
                                    "total": `${order.total.toFixed(2)}`,
                                    "items": req.body.order.items,
                                    "receipt": true,
                                    "first_name": `${order.first_name}`,
                                    "manager_name": `${ms_result[0].manager_name}`,
                                    "address": `${ms_result[0].delivery_location.plant_id} - ${ms_result[0].delivery_location.storage_location} - ${ms_result[0].delivery_location.plant_name}`,
                                    "plant_location": `${ms_result[0].plant_location.plant_id} - ${ms_result[0].plant_location.storage_location} - ${ms_result[0].plant_location.storage_location_desc}`,
                                    "indent_id": o_result.insertId,
                                    "date": date,
                                    "wbs_no": order.WBS_NO,
                                    "link": process.env.link
                                  }

                                }

                                axios.post(`${process.env.host}/api/v3/sendmail`, substitutions)
                                  .then(function (response) {
                                    // console.log(response);
                                  }).catch(function (error) {
                                    // handle error
                                    console.log(error);
                                  })
                                res.status(200).json({
                                  "success": true,
                                  "message": message,
                                  "data": data
                                })
                                // request.post({
                                //   url: 'https://api.sendgrid.com/v3/mail/send',
                                //   headers: {
                                //     'Authorization': 'Bearer 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',
                                //     'Content-Type': 'application/json'
                                //   },
                                //   body: {


                                //     "from": {
                                //       "email": "IBGroup <grim@ibgroup.co.in>"
                                //     },
                                //     "personalizations": [{
                                //       "to": [{
                                //         "email": `${ms_result[0].manager_email}`
                                //         // "email": 'sisindri.s@nexivo.co'

                                //       }],
                                //       "dynamic_template_data": {

                                //         "subject": "Indent For Approval",
                                //         "total": `${order.total}`,
                                //         "items": req.body.order.items,
                                //         "receipt": true,
                                //         "first_name": `${order.first_name}`,
                                //         "manager_name": `${ms_result[0].manager_name}`,
                                //         "address": `${ms_result[0].delivery_location}`,
                                //         "plant_location": `${ms_result[0].plant_location}`,
                                //         "indent_id": o_result.insertId,
                                //         "date": date,
                                //         "wbs_no": order.WBS_NO,
                                //         "link": process.env.link
                                //       }
                                //     }],
                                //     "template_id": "d-2a87046e72394b42a27ede922c84f330"
                                //   },
                                //   json: true
                                // }, function (error, response, body) {
                                //   console.log(error, '---------------');

                                //   con.release();
                                //   res.status(200).json({
                                //     "success": true,
                                //     "message": message,
                                //     "data": data
                                //   });
                                // });
                              } else {
                                con.release();
                                res.status(200).json({
                                  "success": true,
                                  "message": message,
                                  "data": data
                                })

                              }
                            }
                          })
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
  } else {
    res.status(500).json({
      "success": false,
      "message": "Error with endpoint"
    })
  }
  })
}

module.exports = new create_order()