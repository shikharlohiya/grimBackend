const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const axios = require('axios');
require('dotenv/config')

const PODetails = function () { }


PODetails.prototype.PODetails_get_func = function (req, res, callback) {
    con.getConnection(function (err, con) {
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log(req.body);

                var FormulaPOMultiple = req.body.FormulaPO;
                if (FormulaPOMultiple.length > 0) {
                    FormulaPOMultiple.forEach(function (FormulaPO, i) {
                        console.log(FormulaPO);
                        if (FormulaPO.POID == undefined || FormulaPO.POID == "" || FormulaPO.FormulaCode == undefined || FormulaPO.FormulaCode == "" || FormulaPO.Version == undefined || FormulaPO.Version == "" || FormulaPO.PlantCode == undefined || FormulaPO.PlantCode == "" || FormulaPO.Items == undefined || FormulaPO.Items == "") {
                            res.status(500).json({
                                "success": false,
                                "message": "Required parameters are missing"
                            })
                        } else {

                            con.query(`Select id FROM brill_po_details where POID = '${FormulaPO.POID}'`, function (oa_err, oa_result) {
                                if (oa_err) {
                                    console.log(oa_err);
                                    con.rollback(function () {
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Error with endpoint",
                                            "err": oa_err
                                        })
                                    });
                                } else if (oa_result.length > 0) {
                                    // res.status(500).json({
                                    //     "success": false,
                                    //     "message": "Purchase Order Already Existed."
                                    // })
                                } else {
                                    FormulaPO.Version = parseInt(FormulaPO.Version);
                                    con.query(`Select * FROM brill_stored_formulas WHERE FormulaCode = '${FormulaPO.FormulaCode}' AND PlantCode = '${FormulaPO.PlantCode}' AND Version = ${FormulaPO.Version}`, function (aq_err, aq_result) {
                                        if (aq_err) {
                                            console.log(aq_err);
                                            con.rollback(function () {
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint",
                                                    "err": aq_err
                                                })
                                            });
                                        } else if (aq_result.length == 0) {

                                            con.rollback(function () {
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": `No Formula Created with this '${FormulaPO.FormulaCode}'.`
                                                })
                                            });

                                        } else {
                                            con.query(`INSERT INTO brill_po_details (POID, POCreatedDate, ProductID,ProductName, FormulaID, PlantCode, FormulaCode, Version, Description, BatchWeight, POTotalQuantity, POTotalCost, POLP, POCreatedBy, BOM_NO, SAPPlant, SAPPlantName) VALUES ('${FormulaPO.POID}','${FormulaPO.POCreatedDate}', '${FormulaPO.ProductID}','${FormulaPO.ProductName}', '${aq_result[0].FormulaID}', '${FormulaPO.PlantCode}', '${FormulaPO.FormulaCode}', '${FormulaPO.Version}', '${aq_result[0].Description}', ${aq_result[0].BatchWeight},${FormulaPO.POTotalQuantity}, ${FormulaPO.POTotalCost}, ${FormulaPO.POLP}, '${FormulaPO.POCreatedBy}', '${FormulaPO.BOM_nO}', '${FormulaPO.SAPPlant}', '${FormulaPO.SAPPlantName}')`, function (u_err, u_result) {
                                                if (u_err) {
                                                    console.log(u_err);
                                                    con.rollback(function () {
                                                        res.status(500).json({
                                                            "success": false,
                                                            "message": "Error with endpoint",
                                                            "err": u_err
                                                        })
                                                    });
                                                } else {
                                                    console.log(u_result);
                                                    if (FormulaPO.Items.length > 0) {
                                                        FormulaPO.Items.forEach(function (material, index) {
                                                            con.query(`INSERT INTO brill_po_ingrediants (POID, FormulaID, SAPMaterialId,SAPMaterialName, ConsuptionQty, AMP, LPP, Code) VALUES ('${FormulaPO.POID}','${aq_result[0].FormulaID}', '${material.SAPMaterialId * 1}','${material.SAPMaterialName}', ${material.ConsuptionQty},${material.AMP}, ${material.LPP}, '${material.BrillMaterialCode}')`, function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    con.rollback(function () {
                                                                        res.status(500).json({
                                                                            "success": false,
                                                                            "message": "Error with endpoint",
                                                                            "err": err
                                                                        })
                                                                    });
                                                                } else {
                                                                    if ((i == FormulaPOMultiple.length - 1) && (index == FormulaPO.Items.length - 1)) {
                                                                        console.log('done');
                                                                        con.commit(function (err) {
                                                                            if (err) {
                                                                                con.rollback(function () {
                                                                                    throw err;
                                                                                });
                                                                            }
                                                                            con.release();
                                                                            res.status(200).json({
                                                                                "success": true,
                                                                                "message": "Purchase Order Updated Successfully"
                                                                            })
                                                                        })


                                                                    }
                                                                }
                                                            })
                                                        })
                                                    }

                                                }
                                            })

                                        }
                                    })
                                }
                            })
                        }
                    })

                }
            }
        })
    })
}

PODetails.prototype.PODetails_list_func = function (req, res, callback) {
    con.getConnection(function (err, con) {

        console.log('--------');
        var numPerPage = req.body.npp || 10;
        var page = (req.body.page || 1) - 1;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;
        console.log(req.body);
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {

                if (req.body.search == undefined || req.body.search == "") {
                    var searchQuery = `SELECT SQL_CALC_FOUND_ROWS * FROM brill_po_details WHERE (date(POCreatedDate) >= '${req.body.from_date}' AND date(POCreatedDate) <= '${req.body.to_date}') ORDER BY id desc Limit ${limit} ; SELECT FOUND_ROWS() as totalCount;`
                } else {
                    var searchQuery = `SELECT SQL_CALC_FOUND_ROWS *, MATCH (FormulaCode, Description, Version, PlantCode, POID, ProductName) AGAINST ('*${req.body.search}*' IN BOOLEAN MODE) AS relevance FROM brill_po_details WHERE MATCH (FormulaCode, Description, Version, PlantCode, POID, ProductName) AGAINST ('*${req.body.search}*' IN BOOLEAN MODE) AND (date(POCreatedDate) >= '${req.body.from_date}' AND date(POCreatedDate) <= '${req.body.to_date}') ORDER BY relevance desc Limit ${limit}  ; SELECT FOUND_ROWS() as totalCount;`
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
                                con.query(`SELECT a.*, a.Weight as BrillWeight, (a.Weight * a.Cost) as BrillTotalCost, b.SAPMaterialId, b.SAPMaterialName, b.ConsuptionQty, b.AMP, b.LPP, (b.ConsuptionQty * b.AMP) as total_cost FROM brill_stored_formula_ingrediants as a LEFT JOIN brill_po_ingrediants as b ON a.Code = b.Code WHERE a.FormulaID = '${formula.FormulaID}' AND b.POID = '${formula.POID}' Order By a.Weight Desc`, function (in_err, in_result) {
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
                                        function get_brill_total_price(in_result) {
                                            var totalsum = 0;
                                            for (var i = 0; i < in_result.length; i++) {
                                                totalsum += in_result[i].BrillTotalCost;
                                            }
                                            // console.log(totalsum);
                                            return totalsum

                                        }
                                        i_result[0][index].brill_total_cost = get_brill_total_price(in_result);
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
                                                    "message": "PO Details are Fetched",
                                                    "PODetails": responsePayload
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
                                "PODetails": {
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

module.exports = new PODetails()