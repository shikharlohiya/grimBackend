const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const company_codes = function () {}


company_codes.prototype.company_codes_func = function (req, res, callback) {

    con.query(`SELECT DISTINCT company_code  FROM assets ORDER BY company_code`, function (err, result, fields) {
        if (err) {
            console.log(err);
            
            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {
            // console.log(result.length);

            result = result.map(({
                company_code
            }) => company_code);
            
            res.status(200).json({
                "success": true,
                "company_codes": result
            })
        }
    });
}


module.exports = new company_codes()