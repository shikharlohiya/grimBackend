const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
var request = require('request');
require('dotenv/config')

const stored_formulas = function () { }


stored_formulas.prototype.stored_formulas_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');

        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                console.log(req.body.StoredFormulas);
                if (req.body.StoredFormulas.length > 0) {
                    req.body.StoredFormulas.forEach((formula, index) => {
                        con.query(`INSERT INTO brill_stored_formulas (FormulaID, FormulaCode, PlantCode, Version, Description, BatchWeight, StoreDate, IsItStoredInSAP, CreatedBy) VALUES ('${formula.FormulaID}', '${formula.FormulaCode}', '${formula.PlantCode}',${formula.Version}, '${formula.Description}', ${formula.BatchWeight}, '${formula.LStoreDate}', '${formula.IsItStoredInSAP}', '${formula.LogUser}')`, function (i_err, i_result) {
                            if (i_err) {
                                console.log(i_err);
                                con.rollback(function () {
                                    con.release();
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Error with endpoint",
                                        "err": i_err
                                    })
                                });
                            } else {
                                con.query('INSERT INTO brill_stored_formula_ingrediants (FormulaID, Code, Description, Weight, InStock, SNo, Percentage, BinNumber, Cost) VALUES  ?',
                                    [formula.Ingrediants.map(ingrediant => [formula.FormulaID, ingrediant.Code, ingrediant.Description, ingrediant.Amount, ingrediant.InStock, ingrediant.SNo, ingrediant.Percentage, ingrediant.BinNumber, ingrediant.Cost])], function (in_err, in_result) {
                                        if (in_err) {
                                            console.log(in_err);
                                            con.rollback(function () {
                                                con.release();
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Error with endpoint",
                                                    "err": in_err
                                                })
                                            });
                                        } else {
                                            if (index == req.body.StoredFormulas.length - 1) {
                                                con.commit(function (err) {
                                                    if (err) {
                                                        con.rollback(function () {
                                                            throw err;
                                                        });
                                                    }
                                                    con.release();
                                                    res.status(200).json({
                                                        "success": true,
                                                        "message": "Stored Formulas are Saved"
                                                    })
                                                })
                                            }
                                        }
                                    }
                                );
                            }
                        });
                    });
                } else {
                    con.release();
                    res.status(200).json({
                        "success": true,
                        "message": "No Records Found To Insert"
                    })
                }
            }
        })
    })
}
module.exports = new stored_formulas()