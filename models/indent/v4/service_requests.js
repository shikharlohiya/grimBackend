const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
const service_requests = function () {}


service_requests.prototype.service_requests_func = function (req, res, callback) {
    // console.log(req.body);
    var numRows;

    var numPerPage = req.body.npp || 10;
    var page = (req.body.page) - 1 || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;
    con.query(`SELECT SQL_CALC_FOUND_ROWS a.*, a.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'role_id', d.role_id, 'finish', d.finish, 'last_approval', d.last_approval, 'role_name', (Select role from user_roles where id = d.role_id))) FROM Indent_approvals as d WHERE indent_id = a.id and service_id = 3) as 'indent_approvals', (SELECT JSON_OBJECT('id', e.id, 'plant_id', e.plant_id, 'plant_name', e.plant_name, 'storage_loc', e.storage_location, 'storage_location_desc', e.storage_location_desc)) AS 'location', (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name  FROM new_service_request as a LEFT JOIN plant_details_sync as e ON e.id = a.plant_id where a.user_id = ${req.body.user_id} ORDER BY a.id DESC; SELECT FOUND_ROWS() as totalCount;`, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            })
        } else {
            if (result[0].length > 0) {
                numRows = result[1][0].totalCount;
                numPages = Math.ceil(numRows / numPerPage);
                result[0].forEach((item, index) => {
                    // result[0][index].vendor_details = JSON.parse(result[0][index].vendor_details);
                    result[0][index].location = JSON.parse(result[0][index].location);
                    result[0][index].indent_approvals = JSON.parse(result[0][index].indent_approvals);


                    if (index == result[0].length - 1) {
                        var responsePayload = {
                            result: result[0]
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
                            "service_requests": responsePayload
                        })
                    }
                })
            } else {

                res.status(200).json({
                    "success": true,
                    "service_requests": []
                })
            }

        }
    });
}

module.exports = new service_requests()