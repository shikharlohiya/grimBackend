const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
require('dotenv/config')
const axios = require('axios');


const stock_based_on_rm = function () { }


stock_based_on_rm.prototype.stock_based_on_rm_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');
        var numPerPage = req.query.npp || 150;
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
                con.query(`SELECT SQL_CALC_FOUND_ROWS SAPMaterialId, sum(Stock) as Stock, SAPMaterialName as name,  (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LMC, (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and YEAR(b.POCreatedDate) = YEAR(CURRENT_DATE()) AND MONTH(b.POCreatedDate) = MONTH(CURRENT_DATE())) as MTD, (SELECT ROUND(sum(a.ConsuptionQty/1000)/2, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 2 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as L2MA, (SELECT ROUND(sum(a.ConsuptionQty/1000)/12, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 YEAR, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LYMA, JSON_ARRAYAGG(SAPPlantCode) AS plants FROM brill_material_stock as c group by SAPMaterialId, SAPMaterialName order by Stock desc Limit ${limit} ; SELECT FOUND_ROWS() as totalCount;`, function (mm_err, mm_result) {
                    if (mm_err) {
                        console.log(mm_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": mm_err
                        })
                    } else {
                        mm_result[0].forEach(function (material, mmindex) {
                            material.plants = JSON.parse(material.plants);
                            console.log(mmindex, '------------');
                            con.query(`SELECT distinct a.id, a.name, a.description FROM brill_compounds as a JOIN brill_cptp_groupings as b ON a.id=b.compound where a.status = '1' and b.plant in ("${material.plants.join('","')}") order by a.name`, function (c_err, c_result) {
                                if (c_err) {
                                    console.log(c_err);
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": c_err
                                    })
                                } else {
                                    if (c_result.length > 0) {
                                        c_result.forEach(function (compound, cindex) {
                                            var compoundMaterials = [];
                                            con.query(`SELECT distinct b.id,  b.name, b.description FROM brill_cptp_groupings as a JOIN brill_plant_types as b ON a.plant_type=b.id WHERE a.compound = '${compound.id}' and b.status = '1' `, function (pt_err, pt_result) {
                                                if (pt_err) {
                                                    console.log(pt_err);
                                                    con.release();
                                                    res.status(500).json({
                                                        "success": false,
                                                        "message": "Error with endpoint",
                                                        "err": pt_err
                                                    })
                                                } else {
                                                    console.log(pt_result[0]);
                                                    pt_result.forEach(function (plant_type, ptindex) {

                                                        var plantTypeMaterials = [];
                                                        con.query(`SELECT a.id, a.plant, CONCAT(a.plant, "-", (select SAPPlantName FROM brill_material_stock where SAPPlantCode = a.plant limit 1 )) as name FROM brill_cptp_groupings as a WHERE a.compound = '${compound.id}' and a.plant_type = '${plant_type.id}'`, function (p_err, p_result) {
                                                            if (p_err) {
                                                                console.log(p_err);
                                                                con.release();
                                                                res.status(500).json({
                                                                    "success": false,
                                                                    "message": "Error with endpoint",
                                                                    "err": p_err
                                                                })
                                                            } else {
                                                                p_result.forEach(function (plant, pindex) {
                                                                    var plantMaterials = [];
                                                                    con.query(`SELECT id, Stock, PendingPOQty, SAPMaterialId, PendingContractQty, SAPMaterialName as name, (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = '${material.SAPMaterialId}' and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LMC, (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = '${material.SAPMaterialId}' and b.SAPPlant = '${plant.plant}' and YEAR(b.POCreatedDate) = YEAR(CURRENT_DATE()) AND MONTH(b.POCreatedDate) = MONTH(CURRENT_DATE())) as MTD, (SELECT ROUND(sum(a.ConsuptionQty/1000)/2, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = '${material.SAPMaterialId}' and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 2 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as L2MA, (SELECT ROUND(sum(a.ConsuptionQty/1000)/12, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = '${material.SAPMaterialId}' and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 YEAR, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LYMA FROM brill_material_stock WHERE SAPPlantCode = '${plant.plant}' and SAPMaterialId = '${material.SAPMaterialId}' order by Stock desc`, function (m_err, m_result) {
                                                                        if (p_err) {
                                                                            console.log(m_err);
                                                                            con.release();
                                                                            res.status(500).json({
                                                                                "success": false,
                                                                                "message": "Error with endpoint",
                                                                                "err": m_err
                                                                            })
                                                                        } else {
                                                                            plantMaterials = plantMaterials.concat(m_result);
                                                                            plantTypeMaterials = plantTypeMaterials.concat(m_result);
                                                                            compoundMaterials = compoundMaterials.concat(m_result);

                                                                            // p_result[pindex].children = m_result;

                                                                            if (plantMaterials.length != 0) {

                                                                                p_result[pindex].Stock = plantMaterials.reduce(function (prev, cur) {
                                                                                    return prev + cur.Stock;
                                                                                }, 0);
                                                                                p_result[pindex].LYMA = plantMaterials.reduce((total, next) => total + next.LYMA, 0);
                                                                                p_result[pindex].L2MA = plantMaterials.reduce((total, next) => total + next.L2MA, 0);
                                                                                p_result[pindex].LMC = plantMaterials.reduce(function (prev, cur) {
                                                                                    return prev + cur.LMC;
                                                                                }, 0);
                                                                                p_result[pindex].MTD = plantMaterials.reduce(function (prev, cur) {
                                                                                    return prev + cur.MTD;
                                                                                }, 0);
                                                                            } else {
                                                                                p_result[pindex].Stock = 0;
                                                                                p_result[pindex].LYMA = 0;
                                                                                p_result[pindex].L2MA = 0;
                                                                                p_result[pindex].LMC = 0;
                                                                                p_result[pindex].MTD = 0;
                                                                            }

                                                                            if (pindex == p_result.length - 1) {
                                                                                p_result.sort(function (a, b) {
                                                                                    return b.Stock - a.Stock;
                                                                                });
                                                                                pt_result[ptindex].children = p_result;
                                                                                if (plantTypeMaterials.length != 0) {

                                                                                    pt_result[ptindex].Stock = plantTypeMaterials.reduce(function (prev, cur) {
                                                                                        return prev + cur.Stock;
                                                                                    }, 0);
                                                                                    pt_result[ptindex].LYMA = plantTypeMaterials.reduce((total, next) => total + next.LYMA, 0);
                                                                                    pt_result[ptindex].L2MA = plantTypeMaterials.reduce((total, next) => total + next.L2MA, 0);
                                                                                    pt_result[ptindex].LMC = plantTypeMaterials.reduce(function (prev, cur) {
                                                                                        return prev + cur.LMC;
                                                                                    }, 0);
                                                                                    pt_result[ptindex].MTD = plantTypeMaterials.reduce(function (prev, cur) {
                                                                                        return prev + cur.MTD;
                                                                                    }, 0);
                                                                                } else {

                                                                                    pt_result[ptindex].Stock = 0
                                                                                    pt_result[ptindex].LYMA = 0;
                                                                                    pt_result[ptindex].L2MA = 0;
                                                                                    pt_result[ptindex].LMC = 0;
                                                                                    pt_result[ptindex].MTD = 0;
                                                                                }
                                                                                if (ptindex == pt_result.length - 1) {
                                                                                    pt_result.sort(function (a, b) {
                                                                                        return b.Stock - a.Stock;
                                                                                    });
                                                                                    c_result[cindex].children = pt_result;
                                                                                    if (compoundMaterials.length != 0) {

                                                                                        c_result[cindex].Stock = compoundMaterials.reduce(function (prev, cur) {
                                                                                            return prev + cur.Stock;
                                                                                        }, 0);
                                                                                        c_result[cindex].LYMA = compoundMaterials.reduce((total, next) => total + next.LYMA, 0);
                                                                                        c_result[cindex].L2MA = compoundMaterials.reduce((total, next) => total + next.L2MA, 0);
                                                                                        c_result[cindex].LMC = compoundMaterials.reduce(function (prev, cur) {
                                                                                            return prev + cur.LMC;
                                                                                        }, 0);
                                                                                        c_result[cindex].MTD = compoundMaterials.reduce(function (prev, cur) {
                                                                                            return prev + cur.MTD;
                                                                                        }, 0);
                                                                                    } else {

                                                                                        c_result[cindex].Stock = 0
                                                                                        c_result[cindex].LYMA = 0;
                                                                                        c_result[cindex].L2MA = 0;
                                                                                        c_result[cindex].LMC = 0;
                                                                                        c_result[cindex].MTD = 0;
                                                                                    }
                                                                                    if (cindex == c_result.length - 1) {
                                                                                        c_result.sort(function (a, b) {
                                                                                            return b.Stock - a.Stock;
                                                                                        });
                                                                                        mm_result[0][mmindex].children = c_result;
                                                                                        if (mmindex == mm_result[0].length - 1) {
                                                                                            console.log('done'); numRows = mm_result[1][0].totalCount;
                                                                                            numPages = Math.ceil(numRows / numPerPage);

                                                                                            var responsePayload = {
                                                                                                result: mm_result[0]
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
                                                                                                res.status(200).json({
                                                                                                    "success": true,
                                                                                                    "message": "Stock Based on Plants Fetched",
                                                                                                    "result": responsePayload
                                                                                                })
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }

                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        })

                                                    });
                                                }
                                            });
                                        })


                                    } else {
                                        res.status(200).json({
                                            "success": true,
                                            "message": "No Records Found",
                                            "result": []
                                        })
                                    }
                                }
                            });
                        });
                    }
                });
            }
        })
    })
}

module.exports = new stock_based_on_rm()