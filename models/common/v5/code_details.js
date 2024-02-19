const con = require("../../db1.js"),
    g_var = require("../../global_var.js")

const code_details = function () {}

code_details.prototype.code_details_func = function (req, res, callback) {
    con.query(`SELECT a.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'role_id', d.role_id, 'finish', d.finish, 'last_approval', d.last_approval, 'role_name', (Select role from user_roles where id = d.role_id))) FROM Indent_approvals as d WHERE indent_id = a.id) as 'indent_approvals', (SELECT JSON_OBJECT('id', b.id, 'user_id', b.user_id, 'name', b.name, 'vendor_name', b.vendor_name , 'mobile_no', b.mobile_no , 'address', b.address , 'remarks', b.remarks , 'is_verified', b.is_verified , 'manager_remarks', b.manager_remarks, 'created_at', b.created_at, 'status', b.status)) AS 'vendor_details', (SELECT JSON_OBJECT('id', c.id, 'material_type_sap_id', c.material_type_sap_id, 'material_type_sap_description', c.material_type_sap_description)) AS 'material_type' , (SELECT JSON_OBJECT('id', d.id, 'material_group_sap_id', d.material_group_sap_id, 'material_group_sap_description', d.material_group_sap_description)) AS 'material_group' ,(SELECT JSON_OBJECT('id', e.id, 'plant_id', e.plant_id, 'plant_name', e.plant_name, 'storage_loc', e.storage_location, 'storage_location_desc', e.storage_location_desc)) AS 'location', (SELECT description FROM order_status WHERE value = a.status ) as statuss, (SELECT color FROM order_status WHERE value = a.status ) as color, (SELECT first_name FROM user_details WHERE id = a.user_id ) as first_name  FROM new_product_request as a LEFT JOIN vendors as b ON a.vendor_id = b.id LEFT JOIN material_type_sync as c ON c.material_type_sap_id = a.product_type_id LEFT JOIN material_group_sync as d ON d.material_group_sap_id = a.product_group_id LEFT JOIN plant_details_sync as e ON e.id = a.location where a.id = ${req.query.code_id}`, function (serr, sresult, fields) {
        if (serr) {
            console.log(serr);
            res.status(500).json({
                "success": false,
                "message": "Something Went Wrong...!",
                "err": serr
            })
        } else if (sresult.length == 0) {
            res.status(200).json({
                "success": true,
                "message": "No Records Found",
                "codeDetails": []
            })
        } else {
            sresult[0].location = JSON.parse(sresult[0].location);
            sresult[0].material_group = JSON.parse(sresult[0].material_group);
            sresult[0].indent_approvals = JSON.parse(sresult[0].indent_approvals);

            if (sresult[0].code_store_detail == '1') {
                con.query(`SELECT a.*, (SELECT JSON_OBJECT('id', c.id, 'material_type_sap_id', c.material_type_sap_id, 'material_type_sap_description', c.material_type_sap_description)) AS 'material_type', (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name FROM code_store_details as a LEFT JOIN material_type_sync as c ON c.id = a.material_type  where a.code_id = ${sresult[0].id}`, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            "success": false,
                            "message": "Something Went Wrong...!",
                            "err": err
                        })
                    } else {
                        result[0].material_type = JSON.parse(result[0].material_type);
                        sresult[0].codeStoreDetail = result;
                        if (sresult[0].code_finance_detail == '1') {
                            con.query(`SELECT a.*, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name FROM code_finance_details as a where a.code_id = ${sresult[0].id}`, function (ferr, fresult, fields) {
                                if (ferr) {
                                    console.log(ferr);
                                    res.status(500).json({
                                        "success": false,
                                        "message": "Something Went Wrong...!",
                                        "err": ferr
                                    })
                                } else {
                                    sresult[0].codeFinanceDetail = fresult;
                                    if (sresult[0].code_taxation_detail == '1') {
                                        con.query(`SELECT a.*, (SELECT first_name FROM user_details WHERE id = a.created_by ) as first_name FROM code_taxation_details as a where a.code_id = ${sresult[0].id}`, function (terr, tresult, fields) {
                                            if (terr) {
                                                console.log(ferr);
                                                res.status(500).json({
                                                    "success": false,
                                                    "message": "Something Went Wrong...!",
                                                    "err": terr
                                                })
                                            } else {
                                                sresult[0].codeTaxationDetail = tresult;
                                                res.status(200).json({
                                                    "success": true,
                                                    "message": "Services Retraived Successfully",
                                                    "codeDetails": sresult
                                                })
                                            }
                                        })
                                    } else {
                                        sresult[0].codeTaxationDetail = [];

                                        res.status(200).json({
                                            "success": true,
                                            "message": "Services Retraived Successfully",
                                            "codeDetails": sresult
                                        })
                                    }
                                }
                            })
                        } else {
                            sresult[0].codeFinanceDetail = [];
                            sresult[0].codeTaxationDetail = [];

                            res.status(200).json({
                                "success": true,
                                "message": "Services Retraived Successfully",
                                "codeDetails": sresult
                            })
                        }
                    }
                })
            } else {
                sresult[0].codeStoreDetail = [];
                sresult[0].codeFinanceDetail = [];
                sresult[0].codeTaxationDetail = [];

                res.status(200).json({
                    "success": true,
                    "message": "Services Retraived Successfully",
                    "codeDetails": sresult
                })
            }
        }
    });
}


module.exports = new code_details()