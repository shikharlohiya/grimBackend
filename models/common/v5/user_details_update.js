const axios = require('axios');
const user_details_update = function () {}

user_details_update.prototype.user_details_update_func = function (req, res, callback) {
    console.log(req.body);

    if (req.body.recordId == undefined || req.body.recordId == "") {
        res.status(500).json({
            "success": false,
            "message": "recordId field is missing...!"
        })
    } else {
        if (req.body.data == undefined || req.body.data == "") {
            res.status(500).json({
                "success": false,
                "message": "data field is missing...!"
            })
        } else {
            if (req.body.data.EmployeeID == undefined || req.body.data.EmployeeID == "") {
                res.status(500).json({
                    "success": false,
                    "message": "EmployeeID field is missing...!"
                })
            } else {
                // var data = JSON.stringify(req.body.data);
                axios.post(`https://people.zoho.com/people/api/forms/json/employee/updateRecord?authtoken=9222a6a81bc8232db1c71aa229a6ed09&recordId=${req.body.recordId}&inputData=${data}`)
                    .then(function (response) {
                        console.log(response.data, '----------------------');
                        if (response.data.response.status == 0) {
                            res.status(200).json({
                                "success": true,
                                "data": response.data
                            })
                        } else {
                            res.status(200).json({
                                "success": false,
                                "data": response.data
                            })
                        }

                    })
                    .catch(function (error) {
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "error": error
                        })
                    })
            }
        }
    }
}

module.exports = new user_details_update()