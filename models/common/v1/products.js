const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

const products = function () {}


products.prototype.products_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.query);
        var numRows;

        var numPerPage = req.query.npp;
        var page = (req.query.page) - 1;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        // var sort_query;
        if (req.query.sort_by == "alphabetically") {
            var sort_query = 'a.name';
        } else if (req.query.sort_by == "pricelowtohigh") {
            var sort_query = 'b.price';

        } else if (req.query.sort_by == "pricehightolow") {
            var sort_query = 'b.price DESC';
        } else {
            var sort_query = 'a.name';

        }
        if (req.query.search == "" || req.query.search == undefined) {
            var query = `SELECT   * FROM material_items where status  = 1  ORDER BY ${sort_query} Limit ${limit}`;
            var count_query = `SELECT count(*) as count FROM material_items where status  = 1`
        } else {
            var query = `SELECT *, MATCH (name) AGAINST ('${req.query.search}' IN BOOLEAN MODE) AS relevance FROM material_items WHERE MATCH (name) AGAINST ('${req.query.search}' IN BOOLEAN MODE) ORDER BY relevance DESC Limit ${limit}`;
            var count_query = `SELECT count(*) as count FROM material_items WHERE MATCH (name) AGAINST ('${req.query.search}' IN BOOLEAN MODE) `

        }
        console.log('query:', query);

        con.query(query, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                con.query(count_query, function (errs, results, fields) {
                    if (errs) {
                        console.log(errs);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        console.log(results[0].count);
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
    })
}

products.prototype.products_filter_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
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
        if (req.body.search == "" || req.body.search == undefined) {
            if (req.body.material_group_id != undefined && req.body.material_group_id != "" && req.body.material_group_id.length > 0) {
                if (req.body.material_type_id != undefined && req.body.material_type_id != "" && req.body.material_type_id.length > 0) {

                    var query = `SELECT   a.id, (SELECT IFNULL(sum(quantity),0)  FROM user_indents where status in (1,2) and product_id = a.id) as bag, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, b.quantity as stock, b.price, b.storage_loc, b.plant_id, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group   FROM (SELECT * FROM material_items Limit ${limit} ) as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id where a.status  = 1 AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'  ORDER BY ${sort_query}`;

                    var count_query = `SELECT count(1) as count FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id  where a.status  = 1 AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'`

                } else {

                    var query = `SELECT   a.id,(SELECT IFNULL(sum(quantity),0)  FROM user_indents where status in (1,2) and product_id = a.id) as bag, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, b.quantity as stock, b.price, b.storage_loc, b.plant_id, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items Limit ${limit} ) as a INNER JOIN material_stock as b
                    ON a.material_sap_id = b.material_id where a.status  = 1 AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'  ORDER BY ${sort_query}`;

                    var count_query = `SELECT count(1) as count FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id where a.status  = 1 AND a.material_group_sap_id IN (${req.body.material_group_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'`
                }

            } else {

                if (req.body.material_type_id != undefined && req.body.material_type_id != "" && req.body.material_type_id.length > 0) {

                    var query = `SELECT   a.id,(SELECT IFNULL(sum(quantity),0)  FROM user_indents where status in (1,2) and product_id = a.id) as bag, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, b.quantity as stock, b.price, b.storage_loc, b.plant_id, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items Limit ${limit} ) as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id where a.status  = 1 AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'  ORDER BY ${sort_query}`;

                    var count_query = `SELECT count(1) as count FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id  where a.status  = 1 AND a.material_type_sap_id IN (${req.body.material_type_id.map(d => `'${d}'`).join()}) and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'`

                } else {

                    var query = `SELECT   a.id,(SELECT IFNULL(sum(quantity),0)  FROM user_indents where status in (1,2) and product_id = a.id) as bag, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec,a.created_at, a.updated_at, b.quantity as stock, b.price, b.storage_loc, b.plant_id, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group  FROM (SELECT * FROM material_items  ) as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id where a.status  = 1 and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}' ORDER BY ${sort_query} Limit ${limit}`;

                    var count_query = `SELECT count(1) as count FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id where a.status  = 1 and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'`

                    console.log(query, '----------');
                }
            }
        } else {
            var query = `SELECT   a.id,(SELECT IFNULL(sum(quantity),0)  FROM user_indents where status in (1,2) and product_id = a.id) as bag, a.material_sap_id, a.name, a.image_url, a.base_unit, a.tech_spec, a.created_at, a.updated_at,b.quantity as stock, b.price, b.storage_loc, b.plant_id, a.tech_spec, a.base_unit, (SELECT material_type_sap_description FROM material_type_sync WHERE material_type_sap_id = a.material_type_sap_id ) as material_type, (SELECT material_group_sap_description FROM material_group_sync WHERE material_group_sap_id = a.material_group_sap_id ) as material_group , MATCH (material_sap_id,name) AGAINST ('${req.body.search}' IN BOOLEAN MODE) AS relevance FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id WHERE MATCH (material_sap_id,name) AGAINST ('${req.body.search}' IN BOOLEAN MODE) and a.status  = 1 and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'  ORDER BY relevance DESC Limit ${limit}`;

            var count_query = `SELECT count(1) as count FROM material_items as a INNER JOIN material_stock as b ON a.material_sap_id = b.material_id WHERE MATCH (material_sap_id,name) AGAINST ('${req.body.search}' IN BOOLEAN MODE) and a.status  = 1 and b.plant_id = '${req.body.plant.plant_id}' and b.storage_loc = '${req.body.plant.storage_loc}'`

        }
        console.log('query:', query);

        con.query(query, function (err, result, fields) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    "success": false,
                    "message": "Error with endpoint"
                })
            } else {
                console.log(result.length, '-----------');

                con.query(count_query, function (errs, results, fields) {
                    if (errs) {
                        console.log(errs);

                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint"
                        })
                    } else {
                        console.log(results[0].count);
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
    })
}

module.exports = new products()