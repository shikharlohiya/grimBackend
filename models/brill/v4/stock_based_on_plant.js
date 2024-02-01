const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
require('dotenv/config')
const axios = require('axios');


const stock_based_on_plant = function () { }


stock_based_on_plant.prototype.stock_based_on_plant_post_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`SELECT id, name, description FROM brill_compounds where status = '1' order by name`, function (c_err, c_result) {
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
                                                        con.query(`SELECT id, Stock, PendingPOQty, SAPMaterialId, PendingContractQty, SAPMaterialName as name,  (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LMC, (SELECT ROUND(sum(a.ConsuptionQty/1000), 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.SAPPlant = '${plant.plant}' and YEAR(b.POCreatedDate) = YEAR(CURRENT_DATE()) AND MONTH(b.POCreatedDate) = MONTH(CURRENT_DATE())) as MTD, (SELECT ROUND(sum(a.ConsuptionQty/1000)/2, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 2 MONTH, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as L2MA, (SELECT ROUND(sum(a.ConsuptionQty/1000)/12, 2) FROM brill_po_ingrediants as a left JOIN brill_po_details as b ON a.POID = b.POID WHERE a.SAPMaterialId = c.SAPMaterialId and b.SAPPlant = '${plant.plant}' and b.POCreatedDate BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 YEAR, '%Y-%m-01') AND DATE_FORMAT(NOW() ,'%Y-%m-00')) as LYMA FROM brill_material_stock as c WHERE SAPPlantCode = '${plant.plant}' order by Stock desc`, function (m_err, m_result) {
                                                            if (m_err) {
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

                                                                p_result[pindex].children = m_result;

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
                                                                if (pindex == p_result.length - 1) {
                                                                    p_result.sort(function (a, b) {
                                                                        return b.Stock - a.Stock;
                                                                    });
                                                                    pt_result[ptindex].children = p_result;
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

                                                                    if (ptindex == pt_result.length - 1) {

                                                                        pt_result.sort(function (a, b) {
                                                                            return b.Stock - a.Stock;
                                                                        });
                                                                        c_result[cindex].children = pt_result;
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
                                                                        if (cindex == c_result.length - 1) {
                                                                            c_result.sort(function (a, b) {
                                                                                return b.Stock - a.Stock;
                                                                            });
                                                                            console.log('done');
                                                                            con.commit(function (err) {
                                                                                if (err) {
                                                                                    con.rollback(function () {
                                                                                        throw err;
                                                                                    });
                                                                                }
                                                                                res.status(200).json({
                                                                                    "success": true,
                                                                                    "message": "Stock Based on Plants Fetched",
                                                                                    "result": c_result
                                                                                })
                                                                            })
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
            }
        })
    })
}

module.exports = new stock_based_on_plant()