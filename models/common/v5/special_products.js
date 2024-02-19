const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const special_products = function () { }



special_products.prototype.special_products_filter_func = function (req, res, callback) {
    // console.log(req.body);
    var numRows;

    var numPerPage = req.body.npp;
    var page = (req.body.page) - 1;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    // var sort_query;
    if (req.body.sort_by == "alphabetically") {
        var sort_query = 'a.name';
    } else if (req.body.sort_by == "pricelowtohigh") {
        var sort_query = 'b.price';

    } else if (req.body.sort_by == "pricehightolow") {
        var sort_query = 'b.price DESC';
    } else {
        var sort_query = 'b.name';

    }

    ``
    if (req.body.search == "" || req.body.search == undefined) {
        if (req.body.material_group_id != undefined && req.body.material_group_id != "" && req.body.material_group_id.length > 0) {
            if (req.body.material_type_id != undefined && req.body.material_type_id != "" && req.body.material_type_id.length > 0) {

                var query = `SELECT   a.id, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, a.valution_flag, a.batch_flag, a.serial_no_flag, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group   FROM (SELECT * FROM material_items Limit ${limit} ) as a where a.status  = 1 and a.special_indent = '1' AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) ORDER BY ${sort_query}`;

                var count_query = `SELECT count(1) as count FROM material_items as a where a.status  = 1 and a.special_indent = '1' AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()})`

            } else {

                var query = `SELECT   a.id, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, a.valution_flag, a.batch_flag, a.serial_no_flag, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items Limit ${limit} ) as a where a.status  = 1 and a.special_indent = '1' AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) ORDER BY ${sort_query}`;

                var count_query = `SELECT count(1) as count FROM material_items as a where a.status  = 1 and a.special_indent = '1' AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()})`
            }

        } else {

            if (req.body.material_type_id != undefined && req.body.material_type_id != "" && req.body.material_type_id.length > 0) {

                var query = `SELECT   a.id, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, a.valution_flag, a.batch_flag, a.serial_no_flag, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items Limit ${limit} ) as a where a.status  = 1 and a.special_indent = '1' AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()}) ORDER BY ${sort_query}`;

                var count_query = `SELECT count(1) as count FROM material_items as a  where a.status  = 1 and a.special_indent = '1' AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()})`

            } else {

                var query = `SELECT   a.id, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, a.valution_flag, a.batch_flag, a.serial_no_flag, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items  ) as a  where a.status  = 1 and a.special_indent = '1'  ORDER BY ${sort_query} Limit ${limit}`;

                var count_query = `SELECT count(1) as count FROM material_items as a  where a.status  = 1 and a.special_indent = '1'`

                // console.log(query, '----------');
            }
        }
    } else {
        var query = `SELECT   a.id, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec, a.created_at, a.updated_at, a.valution_flag, a.batch_flag, a.serial_no_flag, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group , MATCH (material_sap_id,name) AGAINST ('${req.body.search}*' IN BOOLEAN MODE) AS relevance FROM material_items as a  WHERE MATCH (material_sap_id,name) AGAINST ('${req.body.search}*' IN BOOLEAN MODE) and a.status  = 1 and a.special_indent = '1' ORDER BY relevance DESC Limit ${limit}`;

        var count_query = `SELECT count(1) as count FROM material_items as a  WHERE MATCH (material_sap_id,name) AGAINST ('${req.body.search}*' IN BOOLEAN MODE) and a.status  = 1 and a.special_indent = '1'`

    }
    //  console.log('query:', query);

    con.query(query, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            // console.log(result.length, '-----------');

            con.query(count_query, function (errs, results, fields) {
                if (errs) {
                    console.log(errs);

                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint",
                        "err": errs
                    })
                } else {
                    // console.log(results[0].count);
                    numRows = results[0].count;
                    numPages = Math.ceil(numRows / numPerPage);

                    var responsePayload = {
                        result: result
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

                    res.status(200).json({
                        "success": true,
                        "products": responsePayload
                    })
                }
            });
        }
    });
}

special_products.prototype.add_special_products_filter_func = function (req, res, callback) {
    console.log(req.body.special_materials);
    if (req.body.special_materials.length > 0) {
        con.query(`UPDATE material_items set special_indent = '1' WHERE material_sap_id in (${req.body.special_materials.map(d => `'${d}'`).join()})`, function (derr, dresult, fields) {
            if (derr) {
                console.log(derr);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint",
                    "err": derr
                })
            } else {
                console.log(dresult);
                res.status(200).json({
                    "success": true,
                    "message": "Special Material Created Successfully"
                })
            }
        });
    } else {
        res.status(500).json({
            "success": false,
            "message": "Please type Special Materials"
        })
    }

}

module.exports = new special_products()