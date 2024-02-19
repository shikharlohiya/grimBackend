const con = require("../../db1.js"),
  g_var = require("../../global_var.js")
const axios = require('axios');
require('dotenv/config')



const create_order = function () {}


create_order.prototype.create_order_func = function (req, res, callback) {
  con.getConnection(function (err, con) {
    con.beginTransaction(function (err) {
      if (err) {
        throw err;
      } else {
        // console.log(req.body);

        var order = req.body.order

        if (order.ticket_id == undefined) {
          var ticket_id = '';
        } else {
          var ticket_id = order.ticket_id;

        }

        if (true) {
          var md_approval = '0';
        } else {
          var md_approval = '1';

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

        if (order.special_indent == '1') {
          var service_id = 5;
          if (order.role_id == 3) {
            var actionsQuery = `SELECT * FROM service_actions WHERE service_id = 5 and amount <= ${order.total}`;
          } else {
            var actionsQuery = `SELECT child.* FROM service_actions as child, (SELECT id FROM service_actions WHERE role_id = ${order.role_id} and service_id = 5 and amount <= ${order.total}) as parent WHERE child.id >= parent.id and child.amount <= ${order.total} and child.service_id = 5 UNION SELECT * FROM service_actions WHERE service_id = 5 and role_id = ${order.role_id};`;
          }
        } else if (order.urgent_flag == true) {
          var service_id = 2;
          if (order.role_id == 3) {
            var actionsQuery = `SELECT * FROM service_actions WHERE service_id = 2 and urgent_flag = 1`;
          } else {
            var actionsQuery = `SELECT child.* FROM service_actions as child, (SELECT id FROM service_actions WHERE role_id = ${order.role_id} and service_id = 2 and urgent_flag = 1) as parent WHERE child.id >= parent.id and child.urgent_flag = 1 and child.service_id = 2 UNION SELECT * FROM service_actions WHERE service_id = 2 and role_id = ${order.role_id}`;
          }

        } else {
          var service_id = 1;
          if (order.role_id == 3) {
            var actionsQuery = `SELECT * FROM service_actions WHERE service_id = 1 and amount <= ${order.total}`;
          } else {
            var actionsQuery = `SELECT child.* FROM service_actions as child, (SELECT id FROM service_actions WHERE role_id = ${order.role_id} and service_id = 1 and amount <= ${order.total}) as parent WHERE child.id >= parent.id and child.amount <= ${order.total} and child.service_id = 1 UNION SELECT * FROM service_actions WHERE service_id = 1 and role_id = ${order.role_id};`;
          }
        }
        con.query(actionsQuery, function (oa_err, oa_result) {
          if (oa_err) {
            console.log(oa_err);
            con.rollback(function () {
              res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": oa_err
              })
            });
          } else {
            console.log(oa_result, '-----------');
            if (order.ref == "MYIB") {
              oa_result = [];
            }
            if (oa_result.length == 0) {
              if (order.role_id != 5) {

                var approver_details = {
                  "role_id": order.role_id,
                  "service_id": service_id,
                  "TAT": 1
                }
                oa_result.push(approver_details);
              }
            }

            console.log(oa_result);
            if (oa_result.length > 0) {
              oa_result.forEach(function (element, indx) {
                var approverQuery;
                switch (element.role_id) {
                  case 2:
                    if (order.role_id == 3) {

                      approverQuery = `Select id, email FROM user_details where id = (Select manager_id from user_details where id = ${order.user_id}) LIMIT 1`;
                    } else {

                      approverQuery = `Select id, email FROM user_details where id = ${order.user_id} LIMIT 1`;
                    }
                    break;
                  case 7:
                    if (order.role_id == 7) {
                      approverQuery = `Select id, email FROM user_details where id = ${order.user_id} LIMIT 1`;
                    } else {
                      approverQuery = `Select id, email FROM user_details where id = (Select hod from user_details where id = ${order.user_id}) LIMIT 1`;
                    }
                    break;
                  case 9:
                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 9 and department = (SELECT department FROM user_details where id = ${order.user_id})) LIMIT 1`;
                    break;
                  case 8:
                    approverQuery = `Select id, email FROM user_details where id = (Select id from user_details where role_id = 8) LIMIT 1`;
                    break;
                  case 3:
                    approverQuery = `Select id, email FROM user_details where id = ${order.user_id} LIMIT 1`;
                    break;
                  case 19:
                    if (order.role_id == 19) {
                      approverQuery = `Select id, email FROM user_details where id = ${order.user_id} LIMIT 1`;

                    } else {
                      approverQuery = `Select id, email FROM user_details where id = (Select manager2 from user_details where id = ${order.user_id}) LIMIT 1`;
                    }
                }

                // console.log(approverQuery);

                con.query(approverQuery, function (aq_err, aq_result) {
                  if (aq_err) {
                    console.log(aq_err);
                    con.rollback(function () {
                      res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": aq_err
                      })
                    });
                  } else {
                    // console.log(aq_result);
                    if (aq_result.length == 0) {
                      res.status(500).json({
                        "success": false,
                        "message": "User DOA not Mapped"
                      })
                      return;
                    } else {
                      oa_result[indx].approver_id = aq_result[0].id;
                      element.approver_id = aq_result[0].id;
                      oa_result[indx].approver_email = aq_result[0].email;
                    }
                  }
                })
                if (indx == oa_result.length - 1) {
                  element.last_approval = '1';
                  if (order.user_id == element.approver_id) {
                    element.finish = '1';

                  } else {
                    element.finish = '0';

                  }
                } else {
                  element.last_approval = '0';
                  if (order.user_id == element.approver_id) {
                    element.finish = '1';

                  } else {
                    element.finish = '0';

                  }
                }

                if (order.role_id != 3) {
                  if (indx == 0) {
                    element.finish = '1';
                  }
                }
              });
            }
            // console.log(oa_result, '----------');

            setTimeout(function () {

              console.log(oa_result);

              function getUniqueListBy(arr, key) {
                return [...new Map(arr.map(item => [item[key], item])).values()]
              }
              oa_result = getUniqueListBy(oa_result, 'approver_id');
              con.query(`INSERT INTO user_orders (user_id, plant_id, total,status, address, WBS_NO, md_approval, created_at, created_by, type, urgent_flag, delivery_type, ticket_id) VALUES (${order.user_id},${order.plant.id}, ${order.total},1 , ${order.address}, '${order.WBS_NO}', '${md_approval}', now(),${order.user_id}, '${type}', ${order.urgent_flag}, '${order.delivery_type}', '${ticket_id}')`, function (o_err, o_result) {
                if (o_err) {
                  console.log(o_err);
                  con.rollback(function () {
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

                    if (order.role_id == 2 || order.role_id == 19 || order.role_id == 7 || order.role_id == 8 || order.role_id == 9) {
                      var status = 2;
                    } else {
                      if (order.ref == "MYIB") {

                        var status = 2;
                      } else {
                        var status = 1;
                      }
                    }
                    if (order.role_id == 5) {
                      var indent_type = 'STO';
                    } else {
                      var indent_type = 'normal';
                    }

                    item.price = item.price.toFixed(2);
                    item.total_price = item.total_price.toFixed(2);

                    if (oa_result.slice(-1)[0] == undefined) {
                      var approval_finish = '1'
                    } else {
                      if (oa_result.slice(-1)[0].finish == '1') {
                        var approval_finish = '1'

                      } else {
                        var approval_finish = '0'

                      }
                    }
                    if (item.valution_type == undefined) {
                      var valution_type = '0';

                    } else {
                      var valution_type = item.valution_type;
                    }

                    con.query(`INSERT INTO user_indents ( product_id, user_id, order_id, quantity, remaining_qty, intial_qty, price, total_price, delivery_priority, tracking_no, section, reason, where_used, priority_days, status, created_at, created_by, s_no, type, delivery_date, approval_finish, quality_check_by, valution_type) VALUES (${item.product_id}, ${order.user_id}, ${o_result.insertId},${item.quantity},${item.quantity},${item.quantity},${item.price},${item.total_price},'${item.delivery_priority}','${item.tracking_no}', '${item.section}', '${item.reason}', '${item.where_used}', '${item.priority_days}', ${status} , now(),${order.user_id}, ${index + 1}, '${indent_type}', '${item.delivery_date}', '${approval_finish}', '${item.quality_check_by}', '${valution_type}')`, function (i_err, i_result) {
                      if (i_err) {
                        console.log(i_err);
                        con.rollback(function () {
                          res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                          })
                        });
                      } else {
                        // console.log('oa_result',oa_result);
                        con.query('INSERT INTO Indent_approvals (service_id, role_id, indent_id, order_id, TAT, created_by, finish, last_approval, approver_id, approver_email) VALUES ?',
                          [oa_result.map(action => [action.service_id, action.role_id, i_result.insertId, o_result.insertId, action.TAT, order.user_id, action.finish, action.last_approval, action.approver_id, action.approver_email])],
                          function (ia_err, ia_result) {
                            if (ia_err) {
                              console.log(ia_err);
                              // con.rollback(function () {
                              //   res.status(500).json({
                              //     "success": false,
                              //     "message": "Error with endpoint",
                              //     "err": ia_err
                              //   })
                              // });
                            }
                          });

                        if (order.role_id == 2 || order.role_id == 19 || order.role_id == 7 || order.role_id == 8 || order.role_id == 9) {

                          var statusQuery = `INSERT INTO order_status_logs (indent_id, order_id, status,remarks, qty, created_by, created_at, role_id) VALUES (${i_result.insertId}, ${o_result.insertId}, 1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now(), ${order.user_id}); INSERT INTO order_status_logs (indent_id, order_id, status,remarks, qty, created_by, created_at, role_id) VALUES (${i_result.insertId}, ${o_result.insertId}, 2, '${item.remarks}', ${item.quantity}, ${order.user_id} , now(), ${order.user_id})`;
                          if (oa_result.length > 0) {
                            var pr_status = '1';
                          } else {
                            var pr_status = '0';

                          }
                        } else if (order.role_id == 5) {
                          var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at, role_id) VALUES (${i_result.insertId}, ${o_result.insertId},1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now(), ${order.role_id})`;
                          var pr_status = '1';

                          con.query(`SELECT IFNULL(sum(a.qty),0) as bag, (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id} LIMIT 1) as material_sap_id, (SELECT quantity FROM material_stock WHERE plant_id = '${order.plant.plant_id}' AND storage_loc = '${order.plant.storage_loc}' AND material_id = (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id} LIMIT 1) AND valution_type = '${valution_type}') as stock FROM stock_reserve as a where a.material_id = (SELECT material_sap_id FROM material_items WHERE id = ${item.product_id} LIMIT 1) and a.plant_id = ${order.plant.id}`, function (b_err, b_result) {
                            if (b_err) {
                              console.log(b_err);
                              con.rollback(function () {
                                res.status(500).json({
                                  "success": false,
                                  "message": "Error with endpoint",
                                  "err": b_err
                                })
                              });
                            } else {

                              if ((b_result[0].stock - b_result[0].bag) - item.quantity < 0) {
                                if ((b_result[0].stock - b_result[0].bag) < 0) {
                                  var availableQty = 0;
                                } else {
                                  var availableQty = b_result[0].stock - b_result[0].bag;
                                }

                                con.query(`INSERT INTO PR_items ( indent_id, material_id, plant_id,store_id, wbs, requested_qty, pr_qty, status, created_by) VALUES (${i_result.insertId}, ${item.product_id}, '${order.plant.plant_id}','${order.plant.storage_loc}', '${order.WBS_NO}', ${item.quantity},${item.quantity - availableQty}, '1', ${order.user_id} )`, function (pr_err, pr_result) {
                                  if (pr_err) {
                                    console.log(pr_err);
                                    con.rollback(function () {
                                      res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint"
                                      })
                                    });
                                  } else {

                                    con.query(`INSERT INTO stock_reserve (indent_id, order_id, material_id, qty, plant_id, created_by) VALUES (${i_result.insertId},${o_result.insertId}, '${b_result[0].material_sap_id}', ${availableQty}, '${order.plant.id}', ${order.user_id})`, function (ri_err, ri_result) {
                                      if (ri_err) {
                                        console.log(ri_err);
                                        con.rollback(function () {

                                          res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": ri_err
                                          })
                                        });
                                      }
                                    })

                                  }
                                })
                              } else {
                                con.query(`INSERT INTO stock_reserve (indent_id, order_id, material_id, qty, plant_id, created_by) VALUES (${i_result.insertId},${o_result.insertId}, '${b_result[0].material_sap_id}', ${item.quantity}, '${order.plant.id}', ${order.user_id})`, function (ri_err, ri_result) {
                                  if (ri_err) {
                                    console.log(ri_err);
                                    con.rollback(function () {

                                      res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": ri_err
                                      })
                                    });
                                  }
                                })

                              }
                            }
                          })

                        } else {
                          var statusQuery = `INSERT INTO order_status_logs ( indent_id, order_id, status,remarks, qty, created_by, created_at, role_id) VALUES (${i_result.insertId}, ${o_result.insertId},1, '${item.remarks}', ${item.quantity}, ${order.user_id} , now(), ${order.role_id})`;
                          var pr_status = '0';

                        }

                        con.query(statusQuery, function (os_err, os_result) {
                          if (os_err) {
                            console.log(os_err);
                            con.rollback(function () {
                              res.status(500).json({
                                "success": false,
                                "message": "Error with endpoint",
                                "err": os_err
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
                                          // console.log("unlogs:----------", unresult);

                                        }
                                      });

                                    }
                                  })
                                }
                              });
                            }

                            if (index == order.items.length - 1) {

                              con.commit(function (err) {
                                if (err) {
                                  con.rollback(function () {

                                    throw err;
                                  });
                                }
                                var data = req.body.order;
                                data.id = o_result.insertId;
                                data.created_at = new Date();
                                con.query(`SELECT a.manager_id, (SELECT email FROM user_details WHERE id = a.manager_id group by id ) as manager_email, (SELECT email FROM user_details WHERE id = a.manager2 group by id ) as manager2_email, (SELECT email FROM user_details WHERE id = "${order.user_id}" ) as user_email, (SELECT first_name FROM user_details WHERE id = a.manager_id group by id ) as manager_name,   (SELECT first_name FROM user_details WHERE id = a.manager2 group by id ) as manager2_name,(SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = ${order.address}) as delivery_location, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = ${order.plant.id}) as plant_location FROM user_details as a where id = "${order.user_id}"`, function (ms_err, ms_result) {
                                  if (ms_err) {
                                    console.log(ms_err);
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

                                    axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
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

                                      axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
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
                                    } else if (order.role_id == 2) {
                                      var date = new Date();
                                      var substitutions = {
                                        "from": "IBGroup <grim@ibgroup.co.in>",
                                        "to": ms_result[0].manager2_email,
                                        "subject": `Indent For Approval`,
                                        "template": "indentApprovalTemp",
                                        "view": {
                                          "total": `${order.total.toFixed(2)}`,
                                          "items": req.body.order.items,
                                          "receipt": true,
                                          "first_name": `${order.first_name}`,
                                          "manager_name": `${ms_result[0].manager2_name}`,
                                          "address": `${ms_result[0].delivery_location.plant_id} - ${ms_result[0].delivery_location.storage_location} - ${ms_result[0].delivery_location.plant_name}`,
                                          "plant_location": `${ms_result[0].plant_location.plant_id} - ${ms_result[0].plant_location.storage_location} - ${ms_result[0].plant_location.storage_location_desc}`,
                                          "indent_id": o_result.insertId,
                                          "date": date,
                                          "wbs_no": order.WBS_NO,
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
                                      res.status(200).json({
                                        "success": true,
                                        "message": message,
                                        "data": data
                                      })
                                    } else {

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
            }, 15);
          }
        })
      }
    })
  })
}

module.exports = new create_order()