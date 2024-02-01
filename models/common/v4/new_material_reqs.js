const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const new_material_reqs = function () {}


new_material_reqs.prototype.new_material_reqs_func = function (req, res, callback) {
    // console.log(req.body);
    var numRows;

    var numPerPage = req.body.npp || 10;
    var page = (req.body.page) - 1 || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    if (req.body.role_id == 15) {
        var filter_query = `and a.rm_approval = '1'`
    } else if (req.body.role_id == 16) {
        var filter_query = `and a.finance_approval = '1'`
    } else if (req.body.role_id == 17) {
        var filter_query = `and a.taxation_approval = '1'`
    } else {
        var filter_query = ``

    }

    con.query(`SELECT SQL_CALC_FOUND_ROWS a.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'role_id', d.role_id, 'finish', d.finish, 'last_approval', d.last_approval, 'role_name', (Select role from user_roles where id = d.role_id))) FROM Indent_approvals as d WHERE indent_id = a.id) as 'indent_approvals',  (SELECT JSON_OBJECT('id', b.id, 'user_id', b.user_id, 'name', b.name, 'vendor_name', b.vendor_name , 'mobile_no', b.mobile_no , 'address', b.address , 'remarks', b.remarks , 'is_verified', b.is_verified , 'manager_remarks', b.manager_remarks, 'created_at', b.created_at, 'status', b.status)) AS 'vendor_details', (SELECT JSON_OBJECT('id', c.id, 'material_type_sap_id', c.material_type_sap_id, 'material_type_sap_description', c.material_type_sap_description)) AS 'material_type' , (SELECT JSON_OBJECT('id', d.id, 'material_group_sap_id', d.material_group_sap_id, 'material_group_sap_description', d.material_group_sap_description)) AS 'material_group' ,(SELECT JSON_OBJECT('id', e.id, 'plant_id', e.plant_id, 'plant_name', e.plant_name, 'storage_loc', e.storage_location, 'storage_location_desc', e.storage_location_desc)) AS 'location', (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name  FROM new_product_request as a LEFT JOIN vendors as b ON a.vendor_id = b.id LEFT JOIN material_type_sync as c ON c.material_type_sap_id = a.product_type_id LEFT JOIN material_group_sync as d ON d.material_group_sap_id = a.product_group_id LEFT JOIN plant_details_sync as e ON e.id = a.location where a.status = 2 ${filter_query}  ORDER BY a.id DESC; SELECT FOUND_ROWS() as totalCount;`, function (err, result, fields) {
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
                    result[0][index].vendor_details = JSON.parse(result[0][index].vendor_details);
                    result[0][index].material_type = JSON.parse(result[0][index].material_type);

                    result[0][index].material_group = JSON.parse(result[0][index].material_group);
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
                            "new_material_reqs": responsePayload
                        })
                    }
                })

            } else {

                res.status(200).json({
                    "success": true,
                    "new_material_reqs": result
                })
            }
        }
    });
}

module.exports = new new_material_reqs()