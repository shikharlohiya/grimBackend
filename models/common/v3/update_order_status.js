const mysql = require("../../db.js"),
  g_var = require("../../global_var.js"),
  mysqlPool = mysql.createPool() // connects to Database
const axios = require('axios');
var request = require('request');
require('dotenv/config')



const SENDGRID_API_KEY = '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';
const mailer = require('sendgrid-mailer').config(SENDGRID_API_KEY);


const update_order_status = function () {}


update_order_status.prototype.update_order_status_func = function (req, res, callback) {
  mysqlPool.getConnection(function (err, con) {
    con.beginTransaction(function (err) {
      if (err) {
        throw err;
      } else {
        console.log(req.body);

        var da = new Date();
        var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
        var date = da.getFullYear() + ("0" + (da.getMonth() + 1)).slice(-2) + ("0" + (da.getDate())).slice(-2);
        var ndate =
          da.getFullYear() +
          "-" +
          ("0" + (da.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + da.getDate()).slice(-2) +
          " " +
          ("0" + da.getHours()).slice(-2) +
          ":" +
          ("0" + da.getMinutes()).slice(-2) +
          ":" +
          ("0" + da.getSeconds()).slice(-2);

        req.body.remarks = req.body.remarks || null;
        req.body.movetype = req.body.movetype || null;
        if (req.body.manager_id == null) {
          var manager_id = req.body.user_id;

        } else {
          var manager_id = req.body.manager_id;

        }

        con.query(`SELECT * FROM user_indents WHERE id = ${req.body.indent_id}`, function (inerr, inresult, fields) {
          if (inerr) {
            console.log(inerr);
            con.rollback(function () {
              con.release();
              res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
              })
            });
          } else {

            if (req.body.role_id == 2 && req.body.status == 12) {
              var query = `UPDATE user_indents set status = ${req.body.status}, quantity = ${req.body.return_quantity} WHERE id = ${req.body.indent_id}`
              var role = 'Indent Manager';
            } else if (req.body.role_id == 2 && req.body.status == 3) {
              var query = `UPDATE user_indents set status = ${req.body.status}, remaining_qty = 0, closed = 1 WHERE id = ${req.body.indent_id}`
              var role = 'Indent Manager';
            } else if (req.body.role_id == 2 && req.body.status != 12) {
              var query = `UPDATE user_indents set status = ${req.body.status} WHERE id = ${req.body.indent_id}`
              var role = 'Indent Manager';
            } else if (req.body.role_id == 5 && req.body.status == 3) {
              var query = `UPDATE user_indents set status = ${req.body.status}, remaining_qty = 0, closed = 1 WHERE id = ${req.body.indent_id}`
              var role = 'Store User';

            } else if (req.body.role_id == 5 && req.body.status == 21) {
              var query = `UPDATE user_indents set status = ${req.body.status} WHERE id = ${req.body.indent_id}`
              var role = 'Store User';

            } else if (req.body.role_id == 5 && req.body.status != 14) {
              if (req.body.closed == 1) {

                var query = `UPDATE user_indents set status = ${req.body.status}, movement_type = '${req.body.movetype}',  quantity = ${req.body.issue_qty}, remaining_qty = 0, closed = ${req.body.closed}  WHERE id = ${req.body.indent_id}`
                var role = 'Store User';
              } else {
                var query = `UPDATE user_indents set status = ${req.body.status}, movement_type = '${req.body.movetype}',  quantity = ${req.body.issue_qty}, remaining_qty = remaining_qty - ${req.body.issue_qty}, closed = ${req.body.closed}  WHERE id = ${req.body.indent_id}`
                var role = 'Store User';
              }

            } else if (req.body.role_id == 5 && req.body.status == 14) {
              var query = `UPDATE user_indents set status = ${req.body.status}, quantity = ${req.body.quantity} WHERE id = ${req.body.indent_id}`
              var role = 'Store User';

            } else if (req.body.role_id == 3 && req.body.status == 12) {
              var query = `UPDATE user_indents set status = ${req.body.status}, quantity = ${req.body.return_quantity} WHERE id = ${req.body.indent_id}`
              var role = 'Indent User';

            } else if (req.body.role_id == 3 && req.body.status != 12) {
              var query = `UPDATE user_indents set status = ${req.body.status} WHERE id = ${req.body.indent_id}`
              var role = 'Indent User';

            }
            con.query(query, function (err, result, fields) {
              if (err) {
                console.log(err);
                con.rollback(function () {
                  con.release();
                  res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                  })
                });
              } else {
                if (req.body.status == 5 || req.body.status == 20) {
                  var isuue_status_qty = req.body.issue_qty;
                  var orderstatusLogs = `INSERT INTO order_status_logs ( indent_id, order_id, status, remarks, qty, company_code, asset_number, asset_description, asset_subnumber, cost_center, created_by, created_at, movement_type) VALUES (${req.body.indent_id}, ${req.body.order_id},${req.body.status}, '${req.body.remarks}', ${isuue_status_qty}, '${req.body.company_code}', '${req.body.asset_number}', '${req.body.asset_description}', '${req.body.asset_subnumber}', '${req.body.cost_center}',  ${req.body.user_id}, now(), '${req.body.movetype}')`


                  if ((req.body.WBS_NO != undefined) && (req.body.WBS_NO != "") && (req.body.WBS_NO != "WBS_GENERAL")) {
                    con.query(`UPDATE user_orders set WBS_NO = '${req.body.WBS_NO}'  where id = ${req.body.order_id}`, function (pr_err, pr_result, fields) {
                      if (pr_err) {
                        console.log(pr_err);
                      }
                    })

                    con.query(`UPDATE PR_items set wbs = '${req.body.WBS_NO}'  where indent_id in (SELECT id FROM user_indents WHERE order_id = ${req.body.order_id})`, function (wbs_err, pr_result, fields) {
                      if (wbs_err) {
                        console.log(wbs_err);
                      }
                    })

                  }
                } else {

                  if (req.body.status == 12) {
                    var isuue_status_qty = req.body.return_quantity;

                  } else if (req.body.status == 11 || req.body.status == 21) {
                    var isuue_status_qty = req.body.issued_qty;

                  } else if (req.body.status == 3) {
                    var isuue_status_qty = inresult[0].remaining_qty;

                  } else {
                    var isuue_status_qty = req.body.quantity;

                  }
                  var orderstatusLogs = `INSERT INTO order_status_logs ( indent_id, order_id, status, remarks, qty, created_by, created_at, movement_type) VALUES (${req.body.indent_id}, ${req.body.order_id},${req.body.status}, '${req.body.remarks}', ${isuue_status_qty}, ${req.body.user_id}, now(), '${req.body.movetype}')`

                }
                con.query(orderstatusLogs, function (os_err, i_result) {
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
                    var get_content = `SELECT content FROM notification_meta WHERE event = (SELECT description FROM order_status WHERE value = ${req.body.status}) and role = 3; SELECT content FROM notification_meta WHERE event = (SELECT description FROM order_status WHERE value = ${req.body.status}) and role = 2; SELECT content FROM notification_meta WHERE event = (SELECT description FROM order_status WHERE value = ${req.body.status}) and role = 4;`
                    con.query(get_content, function (nerr, nresult) {
                      if (nerr) {
                        console.log(nerr);
                      } else if (nresult[0].length > 0) {
                        // console.log(nresult, '---------');

                        console.log(nresult[0][0].content);

                        var contentArray = [nresult[0][0].content, nresult[1][0].content, nresult[2][0].content];
                        contentArray.forEach(function (element, index) {
                          if (element.includes("<<order_id>>")) {
                            contentArray[index] = contentArray[index].replace("<<order_id>>", req.body.order_id);

                          }
                          if (element.includes("<<role>>")) {
                            contentArray[index] = contentArray[index].replace("<<role>>", role);

                          }
                          if (element.includes("<<userName>>")) {
                            contentArray[index] = contentArray[index].replace("<<userName>>", req.body.first_name);

                          }

                          if (index == contentArray.length - 1) {
                            con.query(`SELECT plant_id FROM user_orders where id = ${req.body.order_id}`, function (perr, presult) {
                              if (perr) {
                                console.log(perr);
                              } else {
                                con.query(`SELECT id FROM user_details WHERE JSON_CONTAINS(store_locations, '[${presult[0].plant_id}]') and role_id = 5 LIMIT 1`, function (sierr, siresult) {
                                  if (sierr) {
                                    console.log(sierr);
                                  } else {
                                    if (siresult.length > 0) {
                                      var store_user_id = siresult[0].id
                                    } else {
                                      var store_user_id = 1

                                    }
                                    var update_content = `INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${req.body.user_id},${req.body.indentUser_id}, '${contentArray[0]}', ${req.body.order_id}, ${req.body.user_id}, ${req.body.product_id}); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${req.body.user_id},${manager_id}, '${contentArray[1]}',${req.body.order_id},${req.body.user_id}, ${req.body.product_id}); INSERT INTO notification_user_logs (sender_id, receiver_id, message,order_id, created_by, product_id) VALUES (${req.body.user_id},${store_user_id}, '${contentArray[2]}',${req.body.order_id},${req.body.user_id}, ${req.body.product_id});`
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
                            })
                          }
                        });


                      }
                    });

                    if (req.body.status == 3) {
                      con.query(`UPDATE PR_items set status = '0'  where indent_id = ${req.body.indent_id}`, function (pr_err, pr_result, fields) {
                        if (pr_err) {
                          console.log(pr_err);
                        }
                      })
                    }
                    if (req.body.status == 2) {
                      con.query(`UPDATE PR_items set status = '1' , pr_qty = (pr_qty - (requested_qty - ${req.body.quantity})) where indent_id = ${req.body.indent_id}`, function (err, pr_result, fields) {
                        if (err) {
                          console.log(err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });

                        } else {
                          console.log(pr_result);

                          con.query(`SELECT id, created_at, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id, 'email',email, 'first_name', first_name)  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location, storage_location_desc FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                            if (ad_err) {
                              console.log(ad_err);
                              con.rollback(function () {
                                con.release();
                                res.status(500).json({
                                  "success": false,
                                  "message": "Error with endpoint"
                                })
                              });
                            } else {
                              ad_result[0].user = JSON.parse(ad_result[0].user)


                              con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                                if (mn_err) {
                                  console.log(mn_err);

                                } else {
                                  console.log(mn_result);

                                  ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                  ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                  ad_result[0].wbs = JSON.parse(ad_result[0].wbs)

                                  var substitutions = {
                                    "from": "IBGroup <grim@ibgroup.co.in>",
                                    "to": ad_result[0].user.email,
                                    "subject": `Indent ${req.body.order_id} is Approved by ${ mn_result[0].first_name} and sent to Store `,
                                    "template": "indentApprovedTemp",
                                    "view": {
                                      "first_name": ad_result[0].user.first_name,
                                      "indent_id": req.body.order_id,
                                      "raised_by": ad_result[0].user.first_name,
                                      "indent_date": req.body.created_at,
                                      "item_name": ad_result[0].material_details.name,
                                      "item_quantity": req.body.quantity,
                                      "base_unit": req.body.base_unit || 'EA',
                                      "priority": req.body.delivery_priority,
                                      "item_price": req.body.price,
                                      "wbs_no": ad_result[0].wbs.wbs_number,
                                      "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location} - ${ad_result[0].storage_location_desc}`,
                                      "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].receiving_plant.storage_location} - ${ad_result[0].receiving_plant.plant_name}`,
                                      "approved_by": mn_result[0].first_name,
                                      "approved_on": ndate,
                                      "approval_remark": req.body.remarks,
                                      "link": process.env.link
                                    }

                                  }
                                  axios.post(`${process.env.host}/api/v3/sendmail`, substitutions)
                                    .then(function (response) {
                                      console.log(response);
                                    }).catch(function (error) {
                                      // handle error
                                      console.log(error);
                                    })

                                  setTimeout(function () {
                                    con.commit(function (err) {
                                      if (err) {
                                        con.rollback(function () {
                                          throw err;
                                        });
                                      }
                                      con.release();
                                      res.status(200).json({
                                        "success": true,
                                        "message": "Updated Successfully"
                                      })
                                    })
                                  }, 300);

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
                                  //         "email": ad_result[0].user.email
                                  //         // "email": 'sisindri.s@nexivo.co'

                                  //       }],
                                  //       "dynamic_template_data": {
                                  //         "subject": `Indent ${req.body.order_id} is Approved by ${ mn_result[0].first_name} and sent to Store `,
                                  //         "first_name": ad_result[0].user.first_name,
                                  //         "indent_id": req.body.order_id,
                                  //         "raised_by": ad_result[0].user.first_name,
                                  //         "indent_date": req.body.created_at,
                                  //         "item_name": ad_result[0].material_details.name,
                                  //         "item_quantity": req.body.quantity,
                                  //         "priority": req.body.delivery_priority,
                                  //         "item_price": req.body.price,
                                  //         "wbs_no": ad_result[0].wbs.wbs_number,
                                  //         "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location_desc}`,
                                  //         "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].receiving_plant.storage_location_desc}`,
                                  //         "approved_by": mn_result[0].first_name,
                                  //         "approved_on": ndate,
                                  //         "approval_remark": req.body.remarks,
                                  //         "link": process.env.link
                                  //       }
                                  //     }],
                                  //     "template_id": "d-cc07664ecc8647d3b9acad48fdb3da3a"
                                  //   },
                                  //   json: true
                                  // }, function (error, response, body) {
                                  //   console.log(error, '---------------');

                                  //   setTimeout(function () {
                                  //     con.commit(function (err) {
                                  //       if (err) {
                                  //         con.rollback(function () {
                                  //           throw err;
                                  //         });
                                  //       }
                                  //       con.release();
                                  //       res.status(200).json({
                                  //         "success": true,
                                  //         "message": "Updated Successfully"
                                  //       })
                                  //     })
                                  //   }, 300);
                                  // });

                                }
                              });
                            }
                          });

                        }
                      })
                    } else if (req.body.status == 5 || req.body.status == 20) {
                      con.query(`SELECT id,(SELECT  JSON_OBJECT('created_at', created_at, 'remarks', remarks) FROM order_status_logs where indent_id = ${req.body.indent_id} and status = 2 limit 1) as approval,  created_at, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id, 'email',email, 'first_name', first_name)  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('where_used', where_used)  FROM user_indents WHERE id =  '${req.body.indent_id}') as indent_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc, 'plant_name', plant_name)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location, storage_location_desc FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                        if (ad_err) {
                          console.log(ad_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {
                          if (req.body.closed == 1) {
                            con.query(`UPDATE PR_items set status = '0'  where indent_id = ${req.body.indent_id}`, function (pr_err, pr_result, fields) {
                              if (pr_err) {
                                console.log(pr_err);
                              }
                            })

                          }
                          ad_result[0].user = JSON.parse(ad_result[0].user)


                          con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                            if (mn_err) {
                              console.log(mn_err);

                            } else {
                              console.log(mn_result);

                              ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                              ad_result[0].indent_details = JSON.parse(ad_result[0].indent_details)

                              ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                              ad_result[0].wbs = JSON.parse(ad_result[0].wbs)
                              ad_result[0].approval = JSON.parse(ad_result[0].approval)


                              if (ad_result[0].wbs.wbs_number == 'WBS_GENERAL') {
                                var wbs_no = "";
                                var wbs_desc = "";

                              } else {
                                var wbs_no = ad_result[0].wbs.wbs_number
                                var wbs_desc = ad_result[0].wbs.wbs_desc

                              }

                              if (req.body.cost_center == null) {
                                var cost_center = "";
                              } else {
                                var cost_center = req.body.cost_center.toString();
                              }
                              if (req.body.company_code == null) {
                                var company_code = "";
                              } else {
                                var company_code = req.body.company_code.toString();

                              }
                              if (req.body.asset_number == null) {
                                var asset_number = "";
                              } else {
                                var asset_number = req.body.asset_number.toString();
                              }
                              if (req.body.asset_subnumber == null) {
                                var asset_subnumber = "";
                              } else {
                                var asset_subnumber = req.body.asset_subnumber.toString();
                              }
                              if (req.body.asset_description == null) {
                                var asset_description = "";
                              } else {
                                var asset_description = req.body.asset_description.toString();
                              }

                              if (req.body.movetype == 201 || req.body.movetype == 101) {
                                var receiving_plant = "";
                                var receiving_storage = "";
                              } else {
                                var receiving_plant = ad_result[0].receiving_plant.plant_id;
                                var receiving_storage = ad_result[0].receiving_plant.storage_location;
                              }
                              if (req.body.status == 20) {
                                var check_manager_id = "";
                                var check_manager_name = "";
                              } else {
                                var check_manager_id = ad_result[0].user.manager_id.toString();
                                var check_manager_name = mn_result[0].first_name.toUpperCase();
                              }
                              var data = {
                                indent_data: {
                                  GDOCN: i_result.insertId.toString(),
                                  INDNO: req.body.order_id.toString(),
                                  ITEMN: req.body.s_no.toString(),
                                  INDDT: req.body.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, ''),
                                  WERKS: ad_result[0].plant_id,
                                  LGORT: ad_result[0].storage_location,
                                  MATNR: req.body.product_id,
                                  MAKTX: ad_result[0].material_details.name,
                                  MENGE: req.body.issue_qty,
                                  MEINS: ad_result[0].material_details.base_unit,
                                  UMWRK: receiving_plant,
                                  UMLGO: receiving_storage,
                                  POSID: wbs_no,
                                  POST1: wbs_desc,
                                  KOSTL: cost_center,
                                  BWART: req.body.movetype.toString(),
                                  IDOCG: '',
                                  RDOCG: '',
                                  GUSRID: ad_result[0].user.id.toString(),
                                  DEPTID: ad_result[0].user.department.toString(),
                                  APPRID: check_manager_id,
                                  APPRNM: check_manager_name,
                                  BUKRS: company_code,
                                  ANLN1: asset_number,
                                  ANLN2: asset_subnumber,
                                  TXT50: asset_description,
                                  BUDAT: date.toString(),
                                  WHERE_USED: ad_result[0].indent_details.where_used.toString(),
                                  REMARK: req.body.remarks.toString()
                                }
                              }
                              console.log(data, '-----888888888');

                              axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/indent_data`, data)
                                .then(function (response) {
                                  // handle success
                                  console.log(response.data, '----------------------');

                                  console.log(`UPDATE material_stock set quantity = quantity - ${req.body.issue_qty}  WHERE id = ${req.body.product_id} AND plant_id = '${ad_result[0].plant_id}' AND storage_loc = '${ad_result[0].storage_location}'`, '-----------------');

                                  con.query(`UPDATE material_stock set quantity = quantity - ${req.body.issue_qty}  WHERE material_id = ${req.body.product_id} AND plant_id = '${ad_result[0].plant_id}' AND storage_loc = '${ad_result[0].storage_location}'`, function (su_err, su_result) {
                                    if (su_err) {
                                      console.log(su_err);
                                      con.rollback(function () {
                                        con.release();
                                        res.status(500).json({
                                          "success": false,
                                          "message": "Error with endpoint"
                                        })
                                      });
                                    } else {

                                      if (req.body.status == 20) {
                                        setTimeout(function () {
                                          con.commit(function (err) {
                                            if (err) {
                                              con.rollback(function () {
                                                throw err;
                                              });
                                            }
                                            con.release();
                                            res.status(200).json({
                                              "success": true,
                                              "message": "Updated Successfully"
                                            })
                                          })
                                        }, 300);
                                      } else {

                                        var substitutions = {
                                          "from": "IBGroup <grim@ibgroup.co.in>",
                                          "to": ad_result[0].user.email,
                                          "subject": `Indent ${req.body.order_id} is issued in Store. Please come and collect the material.`,
                                          "template": "indentIssuedTemp",
                                          "view": {
                                            "first_name": ad_result[0].user.first_name,
                                            "indent_id": req.body.order_id,
                                            "raised_by": ad_result[0].user.first_name,
                                            "indent_date": req.body.created_at,
                                            "issue_date": ndate,
                                            "item_name": ad_result[0].material_details.name,
                                            "item_quantity": req.body.quantity,
                                            "base_unit": req.body.base_unit || 'EA',
                                            "issued_quantity": req.body.issue_qty,
                                            "priority": req.body.delivery_priority,
                                            "item_price": req.body.price,
                                            "wbs_no": ad_result[0].wbs.wbs_number,
                                            "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location} - ${ad_result[0].storage_location_desc}`,
                                            "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].storage_location} - ${ad_result[0].receiving_plant.plant_name}`,
                                            "approved_by": mn_result[0].first_name,
                                            "approved_on": ad_result[0].approval.created_at,
                                            "approval_remark": ad_result[0].approval.remarks,
                                            "issue_remark": req.body.remarks,
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

                                        setTimeout(function () {
                                          con.commit(function (err) {
                                            if (err) {
                                              con.rollback(function () {
                                                throw err;
                                              });
                                            }
                                            con.release();
                                            res.status(200).json({
                                              "success": true,
                                              "message": "Updated Successfully"
                                            })
                                          })
                                        }, 300);

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
                                        //         "email": ad_result[0].user.email
                                        //         // "email": 'sisindri.s@nexivo.co'

                                        //       }],
                                        //       "dynamic_template_data": {
                                        //         "subject": `Indent ${req.body.order_id} is issued in Store. Please come and collect the material.`,
                                        //         "first_name": ad_result[0].user.first_name,
                                        //         "indent_id": req.body.order_id,
                                        //         "raised_by": ad_result[0].user.first_name,
                                        //         "indent_date": req.body.created_at,
                                        //         "issue_date": ndate,
                                        //         "item_name": ad_result[0].material_details.name,
                                        //         "item_quantity": req.body.quantity,
                                        //         "issued_quantity": req.body.issue_qty,
                                        //         "priority": req.body.delivery_priority,
                                        //         "item_price": req.body.price,
                                        //         "wbs_no": ad_result[0].wbs.wbs_number,
                                        //         "store_location": `${ad_result[0].plant_id} - ${ad_result[0].storage_location_desc}`,
                                        //         "delivery_location": `${ad_result[0].receiving_plant.plant_id} - ${ad_result[0].receiving_plant.storage_location_desc}`,
                                        //         "approved_by": mn_result[0].first_name,
                                        //         "approved_on": ad_result[0].approval.created_at,
                                        //         "approval_remark": ad_result[0].approval.remarks,
                                        //         "issue_remark": req.body.remarks,
                                        //         "link": process.env.link
                                        //       }
                                        //     }],
                                        //     "template_id": "d-86a200d299454cd5a51ea3e61f11c3a5"
                                        //   },
                                        //   json: true
                                        // }, function (error, response, body) {
                                        //   console.log(error, '---------------');
                                        //   setTimeout(function () {
                                        //     con.commit(function (err) {
                                        //       if (err) {
                                        //         con.rollback(function () {
                                        //           throw err;
                                        //         });
                                        //       }
                                        //       con.release();
                                        //       res.status(200).json({
                                        //         "success": true,
                                        //         "message": "Updated Successfully"
                                        //       })
                                        //     })
                                        //   }, 300);
                                        // });
                                      }

                                    }
                                  });
                                }).catch(function (error) {
                                  // handle error
                                  console.log(error);
                                  con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                      "success": false,
                                      "message": "Error with endpoint"
                                    })
                                  });
                                })

                            }
                          });
                        }
                      });
                    } else if (req.body.status == 11 || req.body.status == 21) {
                      con.query(`SELECT id, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id )  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                        if (ad_err) {
                          console.log(ad_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {
                          ad_result[0].user = JSON.parse(ad_result[0].user)

                          con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                            if (mn_err) {
                              console.log(mn_err);

                            } else {
                              console.log(mn_result);
                              if (req.body.status == 11) {
                                var osrQuery = `SELECT * FROM order_status_logs where indent_id =${req.body.indent_id} and status = 5 and received_or_not = '0' and (sto IS NOT NULL or document IS NOT NULL)`;
                                var mid = ad_result[0].user.manager_id.toString();
                                var mname = mn_result[0].first_name.toUpperCase();
                              } else if (req.body.status == 21) {
                                var osrQuery = `SELECT * FROM order_status_logs where indent_id =${req.body.indent_id} and status = 20 and received_or_not = '0' and (sto IS NOT NULL or document IS NOT NULL)`;
                                var mid = "";
                                var mname = "";


                              }
                              con.query(osrQuery, function (d_err, d_result) {
                                if (d_err) {
                                  console.log(d_err);

                                } else {

                                  ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                  ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                  ad_result[0].wbs = JSON.parse(ad_result[0].wbs)

                                  var data = {
                                    receiving_data: []
                                  }
                                  d_result.forEach(function (disrow, index) {
                                    if (disrow.sto == null) {
                                      disrow.movement_type = ""
                                      disrow.sto = "";
                                    } else {
                                      disrow.movement_type = req.body.movetype.toString();
                                      disrow.sto = disrow.sto.toString();
                                    }
                                    var edata = {
                                      INDNO: req.body.order_id.toString(),
                                      ITEMN: req.body.s_no.toString(),
                                      BUDAT: date.toString(),
                                      GDOCN: disrow.id.toString(),
                                      BLART: 'GR',
                                      WERKS: ad_result[0].receiving_plant.plant_id,
                                      LGORT: ad_result[0].receiving_plant.storage_location,
                                      MATNR: req.body.product_id.toString(),
                                      MAKTX: ad_result[0].material_details.name,
                                      MENGE: disrow.qty,
                                      MEINS: ad_result[0].material_details.base_unit,
                                      UMWRK: ad_result[0].plant_id,
                                      UMLGO: ad_result[0].storage_location,
                                      GUSRID: ad_result[0].user.id.toString(),
                                      DEPTID: ad_result[0].user.department.toString(),
                                      APPRID: mid,
                                      APPRNM: mname,
                                      BWART: disrow.movement_type,
                                      STONO: disrow.sto,
                                      MBLNR: disrow.document,
                                      MJAHR: disrow.document_year,
                                      REMARK: req.body.remarks.toString()
                                    }
                                    data.receiving_data.push(edata);
                                    if (index == d_result.length - 1) {
                                      con.query(`UPDATE order_status_logs set received_or_not = '1'  where indent_id = ${req.body.indent_id}`, function (pr_err, pr_result, fields) {
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
                                          axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/receive_data`, data)
                                            .then(function (response) {
                                              // handle success
                                              console.log(response.data, '----------------------');
                                              if (req.body.status == 21) {
                                                con.query(`UPDATE material_stock set quantity = quantity + ${req.body.issued_qty}  WHERE material_id = ${req.body.product_id} AND plant_id = '${ad_result[0].receiving_plant.plant_id}' AND storage_loc = '${ad_result[0].receiving_plant.storage_location}'`, function (su_err, su_result) {
                                                  if (su_err) {
                                                    console.log(su_err);
                                                    con.rollback(function () {
                                                      con.release();
                                                      res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint"
                                                      })
                                                    });
                                                  } else {
                                                    setTimeout(function () {

                                                      con.commit(function (err) {
                                                        if (err) {
                                                          con.rollback(function () {
                                                            throw err;
                                                          });
                                                        }
                                                        con.release();
                                                        res.status(200).json({
                                                          "success": true,
                                                          "message": "Updated Successfully"
                                                        })
                                                      })
                                                    }, 300);
                                                  }
                                                })
                                              } else if (req.body.status == 11) {
                                                setTimeout(function () {

                                                  con.commit(function (err) {
                                                    if (err) {
                                                      con.rollback(function () {
                                                        throw err;
                                                      });
                                                    }
                                                    con.release();
                                                    res.status(200).json({
                                                      "success": true,
                                                      "message": "Updated Successfully"
                                                    })
                                                  })
                                                }, 300);
                                              }
                                            })
                                            .catch(function (error) {
                                              // handle error
                                              console.log(error);
                                              con.rollback(function () {
                                                con.release();
                                                res.status(500).json({
                                                  "success": false,
                                                  "message": "Error with endpoint"
                                                })
                                              });
                                            })
                                        }
                                      })
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    } else if (req.body.status == 12) {
                      console.log('-----------------');

                      con.query(`SELECT id, plant_id, storage_location FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                        if (ad_err) {
                          console.log(ad_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {
                          con.query(`INSERT INTO return_items (indent_id, order_id, product_id, quantity, plant_id, storage_location, status, created_by, ref_id, movement_type) VALUES (${req.body.indent_id},${req.body.order_id}, '${req.body.product_id}', ${req.body.return_quantity}, '${ad_result[0].plant_id}', '${ad_result[0].storage_location}',${req.body.status},  ${req.body.user_id}, ${req.body.ref_id}, '${req.body.movetype}')`, function (ri_err, ri_result) {
                            if (ri_err) {
                              console.log(ri_err);
                              con.rollback(function () {
                                con.release();
                                res.status(500).json({
                                  "success": false,
                                  "message": "Error with endpoint"
                                })
                              });
                            } else {

                              con.query(`UPDATE order_status_logs set returned_or_not = '1'  where id = ${req.body.ref_id}`, function (ri_err, ri_result) {
                                if (ri_err) {
                                  console.log(ri_err);
                                  con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                      "success": false,
                                      "message": "Error with endpoint"
                                    })
                                  });
                                } else {
                                  setTimeout(function () {
                                    con.commit(function (err) {
                                      if (err) {
                                        con.rollback(function () {
                                          throw err;
                                        });
                                      }
                                      con.release();
                                      res.status(200).json({
                                        "success": true,
                                        "message": "Updated Successfully"
                                      })
                                    })
                                  }, 300);
                                }
                              })


                            }
                          });
                        }
                      });
                    } else if (req.body.status == 13) {
                      console.log('-----------tets13------');
                      con.query(`UPDATE return_items set status = ${req.body.status}, updated_by = ${req.body.user_id}, approval_id = ${i_result.insertId}  WHERE id = ${req.body.id}`, function (ri_err, ri_result) {
                        if (ri_err) {
                          console.log(ri_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {
                          if (req.body.movetype == "351") {

                            con.query(`SELECT id, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id )  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                              if (ad_err) {
                                console.log(ad_err);
                                con.rollback(function () {
                                  con.release();
                                  res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                  })
                                });
                              } else {

                                ad_result[0].user = JSON.parse(ad_result[0].user)

                                con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                                  if (mn_err) {
                                    console.log(mn_err);

                                  } else {
                                    console.log(mn_result);



                                    con.query(`SELECT * FROM order_status_logs where id =${req.body.ref_id} `, function (d_err, d_result) {
                                      if (d_err) {
                                        console.log(d_err);

                                      } else {
                                        ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                        ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                        ad_result[0].wbs = JSON.parse(ad_result[0].wbs)
                                        if (d_result[0].sto == null) {
                                          d_result[0].sto = "";
                                          d_result[0].movement_type = ""
                                          d_result[0].document = ""
                                          d_result[0].document_year = ""

                                        } else {
                                          d_result[0].sto = "";
                                          d_result[0].movement_type = d_result[0].movement_type.toString();

                                        }
                                        if (d_result[0].document == null) {

                                          d_result[0].document = "";
                                          d_result[0].document_year = "";
                                        } else {

                                          d_result[0].document = d_result[0].document.toString();
                                          d_result[0].document_year = d_result[0].document_year.toString();
                                        }

                                        var data = {
                                          receiving_data: {
                                            INDNO: req.body.order_id.toString(),
                                            ITEMN: req.body.s_no.toString(),
                                            BUDAT: date.toString(),
                                            GDOCN: i_result.insertId.toString(),
                                            BLART: 'RE',
                                            WERKS: ad_result[0].receiving_plant.plant_id,
                                            LGORT: ad_result[0].receiving_plant.storage_location,
                                            MATNR: req.body.product_id.toString(),
                                            MAKTX: ad_result[0].material_details.name,
                                            MENGE: req.body.quantity,
                                            MEINS: ad_result[0].material_details.base_unit,
                                            UMWRK: ad_result[0].plant_id,
                                            UMLGO: ad_result[0].storage_location,
                                            GUSRID: ad_result[0].user.id.toString(),
                                            DEPTID: ad_result[0].user.department.toString(),
                                            APPRID: ad_result[0].user.manager_id.toString(),
                                            APPRNM: mn_result[0].first_name.toUpperCase(),
                                            BWART: d_result[0].movement_type,
                                            STONO: d_result[0].sto,
                                            MBLNR: d_result[0].document,
                                            MJAHR: d_result[0].document_year
                                          }
                                        }
                                        axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/receive_data`, data)
                                          .then(function (response) {
                                            // handle success
                                            console.log(response.data, '----------------------');

                                            setTimeout(function () {
                                              con.commit(function (err) {
                                                if (err) {
                                                  connection.rollback(function () {
                                                    throw err;
                                                  });
                                                }
                                                con.release();
                                                res.status(200).json({
                                                  "success": true,
                                                  "message": "Updated Successfully"
                                                })
                                              })
                                            }, 300);

                                          })
                                          .catch(function (error) {
                                            // handle error
                                            console.log(error);
                                            con.rollback(function () {
                                              con.release();
                                              res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                              })
                                            });
                                          })
                                      }
                                    });
                                  }
                                });
                              }
                            });

                          } else {
                            setTimeout(function () {
                              con.commit(function (err) {
                                if (err) {
                                  connection.rollback(function () {
                                    throw err;
                                  });
                                }
                                con.release();
                                res.status(200).json({
                                  "success": true,
                                  "message": "Updated Successfully"
                                })
                              })
                            }, 300);
                          }
                        }
                      });
                    } else if (req.body.status == 14) {
                      console.log('-----------tets14------');
                      con.query(`UPDATE return_items set status = ${req.body.status}, updated_by = ${req.body.user_id}  WHERE id = ${req.body.id}`, function (ri_err, ri_result) {
                        if (ri_err) {
                          console.log(ri_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {
                          if (req.body.movement_type != "351") {

                            con.query(`SELECT id, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id )  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                              if (ad_err) {
                                console.log(ad_err);
                                con.rollback(function () {
                                  con.release();
                                  res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                  })
                                });
                              } else {

                                ad_result[0].user = JSON.parse(ad_result[0].user)

                                con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                                  if (mn_err) {
                                    console.log(mn_err);

                                  } else {
                                    // console.log(mn_result);

                                    con.query(`SELECT * FROM order_status_logs where id =${req.body.ref_id} `, function (d_err, d_result) {
                                      if (d_err) {
                                        console.log(d_err);

                                      } else {
                                        ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                        ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                        ad_result[0].wbs = JSON.parse(ad_result[0].wbs)

                                        d_result[0].sto = "";
                                        if (d_result[0].document == null) {

                                          d_result[0].document = "";
                                          d_result[0].document_year = "";
                                        } else {

                                          d_result[0].document = d_result[0].document.toString();
                                          d_result[0].document_year = d_result[0].document_year.toString();
                                        }

                                        var data = {
                                          receiving_data: {
                                            INDNO: req.body.order_id.toString(),
                                            ITEMN: req.body.s_no.toString(),
                                            BUDAT: date.toString(),
                                            GDOCN: i_result.insertId.toString(),
                                            BLART: 'RE',
                                            WERKS: ad_result[0].plant_id,
                                            LGORT: ad_result[0].storage_location,
                                            MATNR: req.body.product_id.toString(),
                                            MAKTX: ad_result[0].material_details.name,
                                            MENGE: req.body.quantity,
                                            MEINS: ad_result[0].material_details.base_unit,
                                            UMWRK: ad_result[0].receiving_plant.plant_id,
                                            UMLGO: ad_result[0].receiving_plant.storage_location,
                                            GUSRID: ad_result[0].user.id.toString(),
                                            DEPTID: ad_result[0].user.department.toString(),
                                            APPRID: ad_result[0].user.manager_id.toString(),
                                            APPRNM: mn_result[0].first_name.toUpperCase(),
                                            BWART: req.body.movetype.toString(),
                                            STONO: d_result[0].sto,
                                            MBLNR: d_result[0].document,
                                            MJAHR: d_result[0].document_year,
                                            REMARK: req.body.remarks.toString()
                                          }
                                        }
                                        axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/receive_data`, data)
                                          .then(function (response) {
                                            // handle success
                                            console.log(response.data, '----------------------');
                                            con.query(`UPDATE material_stock set quantity = quantity + ${req.body.quantity}  WHERE material_id = ${req.body.product_id} AND plant_id = '${req.body.plant_id}' AND storage_loc = '${req.body.storage_location}'`, function (su_err, su_result) {
                                              if (su_err) {
                                                console.log(su_err);
                                                con.rollback(function () {
                                                  con.release();
                                                  res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint"
                                                  })
                                                });
                                              } else {
                                                setTimeout(function () {
                                                  con.commit(function (err) {
                                                    if (err) {
                                                      connection.rollback(function () {
                                                        throw err;
                                                      });
                                                    }
                                                    con.release();
                                                    res.status(200).json({
                                                      "success": true,
                                                      "message": "Updated Successfully"
                                                    })
                                                  })
                                                }, 300);
                                              }
                                            });

                                          })
                                          .catch(function (error) {
                                            // handle error
                                            console.log(error);
                                            con.rollback(function () {
                                              con.release();
                                              res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                              })
                                            });
                                          })
                                      }
                                    });
                                  }
                                });
                              }
                            });

                          } else if (req.body.movement_type == "351") {


                            con.query(`SELECT id,(SELECT  JSON_OBJECT('created_at', created_at, 'remarks', remarks) FROM order_status_logs where indent_id = ${req.body.indent_id} and status = 2 limit 1) as approval, (SELECT  sto FROM order_status_logs where id = (SELECT  approval_id FROM return_items where id = ${req.body.id})) as sto, (SELECT JSON_OBJECT('where_used', where_used)  FROM user_indents WHERE id =  '${req.body.indent_id}') as indent_details, created_at, (SELECT JSON_OBJECT('id', id, 'department', department, 'manager_id', manager_id, 'email',email, 'first_name', first_name)  FROM user_details where id = (SELECT user_id FROM user_orders where id = ${req.body.order_id})) as user , (SELECT JSON_OBJECT('name', name, 'base_unit',base_unit )  FROM material_items WHERE material_sap_id =  '${req.body.product_id}' limit 1) as material_details, (SELECT JSON_OBJECT('id', id, 'plant_id', plant_id, 'storage_location', storage_location, 'storage_location_desc', storage_location_desc)  FROM plant_details_sync WHERE id = (SELECT address FROM user_orders where id =  ${req.body.order_id})) as receiving_plant, (SELECT JSON_OBJECT('wbs_number', wbs_number, 'wbs_desc', wbs_desc)  FROM wbs_numbers WHERE wbs_number = (SELECT WBS_NO FROM user_orders where id = ${req.body.order_id})) as wbs, plant_id, storage_location, storage_location_desc FROM plant_details_sync WHERE id = (SELECT plant_id FROM user_orders where id = ${req.body.order_id})`, function (ad_err, ad_result) {
                              if (ad_err) {
                                console.log(ad_err);
                                con.rollback(function () {
                                  con.release();
                                  res.status(500).json({
                                    "success": false,
                                    "message": "Error with endpoint"
                                  })
                                });
                              } else {
                                ad_result[0].user = JSON.parse(ad_result[0].user)


                                con.query(`SELECT first_name FROM user_details where id =${ad_result[0].user.manager_id}`, function (mn_err, mn_result) {
                                  if (mn_err) {
                                    console.log(mn_err);

                                  } else {
                                    // console.log(mn_result);

                                    ad_result[0].material_details = JSON.parse(ad_result[0].material_details)
                                    ad_result[0].indent_details = JSON.parse(ad_result[0].indent_details)
                                    ad_result[0].receiving_plant = JSON.parse(ad_result[0].receiving_plant)
                                    ad_result[0].wbs = JSON.parse(ad_result[0].wbs)
                                    ad_result[0].approval = JSON.parse(ad_result[0].approval)
                                    console.log(ad_result[0]);


                                    if (ad_result[0].wbs.wbs_number == 'WBS_GENERAL') {
                                      var wbs_no = "";
                                      var wbs_desc = "";

                                    } else {
                                      var wbs_no = ad_result[0].wbs.wbs_number.toString()
                                      var wbs_desc = ad_result[0].wbs.wbs_desc.toString()

                                    }

                                    var data = {
                                      indent_data: {
                                        GDOCN: i_result.insertId.toString(),
                                        INDNO: req.body.order_id.toString(),
                                        ITEMN: req.body.s_no.toString(),
                                        INDDT: req.body.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, ''),
                                        WERKS: ad_result[0].plant_id,
                                        LGORT: ad_result[0].storage_location,
                                        MATNR: req.body.product_id.toString(),
                                        MAKTX: ad_result[0].material_details.name,
                                        MENGE: req.body.quantity,
                                        MEINS: ad_result[0].material_details.base_unit,
                                        UMWRK: ad_result[0].receiving_plant.plant_id,
                                        UMLGO: ad_result[0].receiving_plant.storage_location,
                                        POSID: wbs_no,
                                        POST1: wbs_desc,
                                        KOSTL: "",
                                        BWART: req.body.movetype.toString(),
                                        IDOCG: '',
                                        RDOCG: '',
                                        GUSRID: ad_result[0].user.id.toString(),
                                        DEPTID: ad_result[0].user.department.toString(),
                                        APPRID: ad_result[0].user.manager_id.toString(),
                                        APPRNM: mn_result[0].first_name.toUpperCase().toString(),
                                        BUKRS: "",
                                        ANLN1: "",
                                        ANLN2: "",
                                        TXT50: "",
                                        BUDAT: date.toString(),
                                        STONO: ad_result[0].sto.toString(),
                                        WHERE_USED: ad_result[0].indent_details.where_used.toString(),
                                        REMARK: req.body.remarks.toString()
                                      }
                                    }
                                    axios.post(`${process.env.host}/api/${process.env.sap_version}/sync/indent_data`, data)
                                      .then(function (response) {
                                        // handle success
                                        console.log(response.data, '----------------------');

                                        con.query(`UPDATE material_stock set quantity = quantity + ${req.body.quantity}  WHERE material_id = ${req.body.product_id} AND plant_id = '${ad_result[0].plant_id}' AND storage_loc = '${ad_result[0].storage_location}'`, function (su_err, su_result) {
                                          if (su_err) {
                                            console.log(su_err);
                                            con.rollback(function () {
                                              con.release();
                                              res.status(500).json({
                                                "success": false,
                                                "message": "Error with endpoint"
                                              })
                                            });
                                          } else {
                                            setTimeout(function () {
                                              con.commit(function (err) {
                                                if (err) {
                                                  connection.rollback(function () {
                                                    throw err;
                                                  });
                                                }
                                                con.release();
                                                res.status(200).json({
                                                  "success": true,
                                                  "message": "Updated Successfully"
                                                })
                                              })
                                            }, 300);
                                          }
                                        });
                                      })
                                      .catch(function (error) {
                                        // handle error
                                        console.log(error);
                                        con.rollback(function () {
                                          con.release();
                                          res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint"
                                          })
                                        });
                                      })

                                  }
                                });
                              }
                            });

                          }
                        }
                      });
                    } else if (req.body.status == 3) {
                      console.log('-----------tets3------');

                      con.query(`SELECT name,(SELECT first_name  FROM user_details WHERE id =  '${req.body.indentUser_id}') as first_name, (SELECT email  FROM user_details WHERE id =  '${req.body.indentUser_id}') as user_mail FROM material_items WHERE material_sap_id =  '${req.body.product_id}'`, function (mt_err, mt_result) {
                        if (mt_err) {
                          console.log(mt_err);
                          con.rollback(function () {
                            con.release();
                            res.status(500).json({
                              "success": false,
                              "message": "Error with endpoint"
                            })
                          });
                        } else {

                          var substitutions = {
                            "from": "IBGroup <grim@ibgroup.co.in>",
                            "to": mt_result[0].user_mail,
                            "subject": `Indent ${req.body.order_id} is rejected by ${req.body.first_name}`,
                            "template": "indentRejectedTemp",
                            "view": {
                              "first_name": mt_result[0].first_name,
                              "indent_id": req.body.order_id,
                              "rejected_by_name": req.body.first_name,
                              "date": ndate,
                              "remarks": req.body.remarks,
                              "material": `${req.body.product_id} - ${mt_result[0].name}`,
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
                          setTimeout(function () {
                            con.commit(function (err) {
                              if (err) {
                                connection.rollback(function () {
                                  throw err;
                                });
                              }
                              con.release();
                              res.status(200).json({
                                "success": true,
                                "message": "Updated Successfully"
                              })
                            })
                          }, 300);
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
                          //         "email": mt_result[0].user_mail
                          //         // "email": 'sisindri.s@nexivo.co'

                          //       }],
                          //       "dynamic_template_data": {
                          //         "first_name": mt_result[0].first_name,
                          //         "indent_id": req.body.order_id,
                          //         "rejected_by_name": req.body.first_name,
                          //         "date": ndate,
                          //         "remarks": req.body.remarks,
                          //         "material": `${req.body.product_id} - ${mt_result[0].name}`,
                          //         "subject": `Indent ${req.body.order_id} is rejected by ${req.body.first_name}`,
                          //         "link": process.env.link
                          //       }
                          //     }],
                          //     "template_id": "d-8eef06f2ece241fcabbd2caa2d74af8b"
                          //   },
                          //   json: true
                          // }, function (error, response, body) {
                          //   console.log(error, '---------------');
                          //   setTimeout(function () {
                          //     con.commit(function (err) {
                          //       if (err) {
                          //         connection.rollback(function () {
                          //           throw err;
                          //         });
                          //       }
                          //       con.release();
                          //       res.status(200).json({
                          //         "success": true,
                          //         "message": "Updated Successfully"
                          //       })
                          //     })
                          //   }, 300);
                          // });
                        }
                      })

                      //   const email1 = {
                      //     to: 'phanindrareddy491@gmail.com',
                      //     from: 'IBGroup <grim@ibgroup.co.in>',
                      //     subject: `Indent ${req.body.order_id} is rejected by ${req.body.first_name}`,
                      //     templateId: 'fa503c1c-7d0d-49b0-bdf5-163cd01d334e',
                      //     substitutions: {
                      //       '%|first_name|%': 'phanindra',
                      //         '%|indent_no|%': req.body.order_id,
                      //         '%|RejectedbyName|%': req.body.first_name,
                      //         '%|date|%': date,
                      //         '%|remarks|%': req.body.remarks
                      //     }
                      // };

                      // const email = [email1];
                      // mailer.send(email1).then(() => {
                      //     console.log(email,'----------------');
                      //   setTimeout(function () {
                      //     res.status(200).json({
                      //       "success": true,
                      //       "message": "Updated Successfully"
                      //     })
                      //   }, 300);
                      // }).catch((error) => {
                      //     console.log('error', error, email,'---------error');
                      //     console.log(error.response.body.errors)
                      //     res.status(500).json({
                      //       "success": false,
                      //       "message": "Something went wrong"
                      //     })
                      // });
                    } else {
                      setTimeout(function () {
                        con.commit(function (err) {
                          if (err) {
                            connection.rollback(function () {
                              throw err;
                            });
                          }
                          con.release();
                          res.status(200).json({
                            "success": true,
                            "message": "Updated Successfully"
                          })
                        })
                      }, 300);

                    }

                  }
                });
              }
            });
          }
        });
      }
    })
  })
}

module.exports = new update_order_status()