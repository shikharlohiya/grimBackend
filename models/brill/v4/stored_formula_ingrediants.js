const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
require('dotenv/config')
const axios = require('axios');


// var cron = require('node-cron');
// cron.schedule('*/2 * * * *', () => {

//     axios.post(`${process.env.host}/api/v4/brill/stored_formula_ingrediants`)
//         .then(function (response) {
//             console.log(`Data Sent`);
//         })
//         .catch(function (error) {
//             console.log(`Error While Send The Data`);
//         })
// })


const stored_formula_ingrediants = function () { }


stored_formula_ingrediants.prototype.stored_formula_ingrediants_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');
        var emails;

        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`SELECT FormulaID as DOC_NO, DATE_FORMAT(StoreDate,'%Y%m%d') as REP_GEN_DT, PlantCode as PLANT_CODE, FormulaCode as FORMULA_CODE, Description as FORMULA_NAME, Version as VERSION_NO, BatchWeight as BATCH_WEIGHT FROM brill_stored_formulas WHERE IsItStoredInSAP = '0' LIMIT 1`, function (i_err, i_result) {
                    if (i_err) {
                        console.log(i_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": i_err
                        })
                    } else {
                        if (i_result.length > 0) {
                            i_result.forEach(function (formula, index) {
                                console.log(formula.DOC_NO);
                                con.query(`SELECT Description,FormulaID as DOC_NO, SNo as LINE_ITEM_NO, Code as BRILL_MAT_CODE, Percentage as PERCENT, Weight as MATERIAL_QTY, BinNumber as BIN_LOCATION FROM brill_stored_formula_ingrediants WHERE FormulaID = '${formula.DOC_NO}' and Code NOT IN ('50','59', '50.1', '60', '63', '67', '307', '600', '601', '602', 'FISH-4MM', 'FISH-3MM', 'FISH-SP', 'FISH-1MM', 'FISH-2MM', 'FISH-1.5', '159')`, function (in_err, in_result) {
                                    if (in_err) {
                                        console.log(in_err);
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": in_err
                                        })
                                    } else {
                                        i_result[index].ITEM = in_result;

                                        con.query(`UPDATE brill_stored_formulas set IsItStoredInSAP = '1' WHERE FormulaID = '${formula.DOC_NO}'`, function (inu_err, inu_result) {
                                            if (inu_err) {
                                                console.log(inu_err);
                                                con.rollback(function () {
                                                    con.release();
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint",
                                                        "err": inu_err
                                                    })
                                                })
                                            } else {
                                                


                                                if (index == i_result.length - 1) {
                                                    console.log('done');
                                                    var reqData = {
                                                        "REQ": i_result
                                                    }

                                                    // console.log(reqData);
                                                    // 'Authorization': `Basic SUJHQlJJTEw6QWJpc0AyMDIx`;  //PROD
                                                    // 'Authorization': `Basic SUJHUkZDUzRUUFRIOmluaXRpYWwkMQ==` // DEV
                                                     // 'Authorization': `Basic SUJHQlJJTEw6UmVzZXRAMTIz`; //QAS
                                                    var config = {
                                                        method: 'post',
                                                        // url: `http://172.16.0.156:8001/sap/bc/rest/ppbrillbomdata?sap-client=444`, //UIT
                                                        // 'Authorization': `Basic SUJHUkZDUzRUUFRIOmluaXRpYWwkMQ==`
                                                        // url: `http://172.16.0.157:8001/sap/bc/rest/ppbrillbomdata?sap-client=786`, //QAS
                                                         url: `http://172.16.0.147:8001/sap/bc/rest/ppbrillbomdata?sap-client=786`, //PRD
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Basic SUJHQlJJTEw6QWJpc0AyMDIx`
                                                        },
                                                        data: reqData
                                                    };

                                                    axios(config).then(function (response) {
                                                        // console.log(response.data, '--------------res-----------');
                                                        con.query(`SELECT * FROM brill_email_address WHERE PlantId = '${formula.PLANT_CODE}'`, function (enu_err, enu_result) {
                                                            if (enu_err) {
                                                                console.log(enu_err);
                                                                 emails = [{"to": "y.phanindra@ibgroup.co.in"}, {"cc": "phanindrareddy491@gmail.com"}]
                                                            } else {
                                                                 emails = enu_result
                                                            }
                                                        })
                                                        con.commit(function (err) {
                                                            if (err) {
                                                                con.rollback(function () {
                                                                    throw err;
                                                                });
                                                            }
                                                            var dynamic_data = {
                                                                "items": in_result,
                                                                "receipt": true,
                                                                "first_name": `Sir/Madam`,
                                                                "formula": `${formula.FORMULA_CODE}-${formula.FORMULA_NAME}`,
                                                                "formula_code": `${formula.FORMULA_CODE}`,
                                                                "formula_name": `${formula.FORMULA_NAME}`,
                                                                "date": formula.REP_GEN_DT,
                                                                "version": formula.VERSION_NO,
                                                                "batch_weight": formula.BATCH_WEIGHT,
                                                                "plant": formula.PLANT_CODE,
                                                                "link": process.env.fat_link
                                                            }
            
                                                            var substitutions = {
                                                                "from": "IBGroup <grim@ibgroup.co.in>",
                                                                "to": process.env.fat_email,
                                                                "subject": `New Formula ${formula.FORMULA_CODE}-${formula.FORMULA_NAME} Created`,
                                                                "template": "newFormulaRaisedTemp",
                                                                "view": dynamic_data
                                                            }
                                                            //"to": emails[0].to
                                                            var maillist = ['razi@ibgroup.co.in', 'dr_anilsharma@ibgroup.co.in', 'premix@ibgroup.co.in', 'sandeep_dhalla@ibgroup.co.in', 'sandeep.gajpal@ibgroup.co.in', 'digvijaya.swain@ibgroup.co.in', 'y.phanindra@ibgroup.co.in'];
                                                            maillist.toString();
                                                            var esubstitutions = {
                                                                "from": "IBGroup <grim@ibgroup.co.in>",
                                                                "to": emails[0].to,
                                                                "subject": `New Formula ${formula.FORMULA_CODE}-${formula.FORMULA_NAME} Created`,
                                                                "template": "newFormulaCreatedTemp",
                                                                "view": dynamic_data
                                                            }
            
                                                              axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                                               .then(function (response) {
                                                            // console.log(response);
                                                                }).catch(function (error) {
                                                            // handle error
                                                                 console.log(error);
                                                               })
                                                               axios.post(`${process.env.host}/api/v4/sendmail`, esubstitutions)
                                                               .then(function (response) {
                                                            // console.log(response);
                                                                }).catch(function (error) {
                                                            // handle error
                                                                 console.log(error);
                                                               })
                                                            con.release();
                                                            res.status(200).json({
                                                                "success": true,
                                                                "message": "Stored Formulas are Saved",
                                                                "data": reqData
                                                            })
                                                        })
                                                    }).catch(function (error) {
                                                        console.log(error, 'error---')
                                                        con.rollback(function () {
                                                            con.release();
                                                            res.status(500).json({
                                                                "success": false,
                                                                "message": "Error with endpoint",
                                                                "err": error
                                                            })
                                                        });
                                                    })


                                                }
                                            }
                                        })
                                    }
                                });
                            })


                        } else {
                            res.status(200).json({
                                "success": true,
                                "message": "No Records Found to Send"
                            })
                        }
                    }
                });
            }
        })
    })
}


stored_formula_ingrediants.prototype.stored_formula_ingrediants_get_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');
        var numPerPage = req.query.npp || 10;
        var page = (req.query.page || 1) - 1;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;
        console.log(req.query);
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {

                if (req.query.search == 'undefined' || req.query.search == "") {
                    var searchQuery = `SELECT SQL_CALC_FOUND_ROWS * FROM brill_stored_formulas WHERE (date(StoreDate) >= '${req.query.from_date}' AND date(StoreDate) <= '${req.query.to_date}') ORDER BY id desc Limit ${limit} ; SELECT FOUND_ROWS() as totalCount;`
                } else {
                    var searchQuery = `SELECT SQL_CALC_FOUND_ROWS *, MATCH (FormulaCode, Description, Version, PlantCode) AGAINST ('*${req.query.search}*' IN BOOLEAN MODE) AS relevance FROM brill_stored_formulas WHERE MATCH (FormulaCode, Description, Version, PlantCode) AGAINST ('*${req.query.search}*' IN BOOLEAN MODE) AND (date(StoreDate) >= '${req.query.from_date}' AND date(StoreDate) <= '${req.query.to_date}') ORDER BY relevance desc Limit ${limit}  ; SELECT FOUND_ROWS() as totalCount;`
                }

                console.log(searchQuery);
                con.query(searchQuery, function (i_err, i_result) {
                    if (i_err) {
                        console.log(i_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": i_err
                        })
                    } else {
                        if (i_result[0].length > 0) {
                            i_result[0].forEach(function (formula, index) {
                                console.log(formula.DOC_NO);
                                con.query(`SELECT a.*, (a.Weight * a.Cost) as total_cost FROM brill_stored_formula_ingrediants as a WHERE a.FormulaID = '${formula.FormulaID}'`, function (in_err, in_result) {
                                    if (in_err) {
                                        console.log(in_err);
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": in_err
                                        })
                                    } else {
                                        i_result[0][index].ITEM = in_result;
                                        function get_total_price(in_result) {
                                            var totalsum = 0;
                                            for (var i = 0; i < in_result.length; i++) {
                                                totalsum += in_result[i].total_cost;
                                            }
                                            // console.log(totalsum);
                                            return totalsum

                                        }
                                        i_result[0][index].total_cost = get_total_price(in_result);
                                        if (index == i_result[0].length - 1) {
                                            console.log('done');
                                            numRows = i_result[1][0].totalCount;
                                            numPages = Math.ceil(numRows / numPerPage);

                                            var responsePayload = {
                                                result: i_result[0]
                                            };
                                            if (page < numPages) {
                                                responsePayload.pagination = {
                                                    current: page,
                                                    perPage: numPerPage,
                                                    previous: page > 1 ? page - 1 : undefined,
                                                    next: page < numPages - 1 ? page + 1 : undefined,
                                                    total: numPages
                                                }
                                            } else responsePayload.pagination = {
                                                err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                                            }

                                            con.commit(function (err) {
                                                if (err) {
                                                    con.rollback(function () {
                                                        throw err;
                                                    });
                                                }
                                                con.release();
                                                res.status(200).json({
                                                    "success": true,
                                                    "message": "Stored Formulas are Fetched",
                                                    "stored_formulas": responsePayload
                                                })
                                            })


                                        }
                                    }
                                });
                            })


                        } else {
                            res.status(200).json({
                                "success": true,
                                "message": "No Records Found",
                                "stored_formulas": {
                                    "result": [],
                                    "pagination": {
                                        "current": 0,
                                        "perPage": numPerPage,
                                        "total": 0
                                    }
                                }
                            })
                        }
                    }
                });
            }
        })
    })
}

module.exports = new stored_formula_ingrediants()