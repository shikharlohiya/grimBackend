// const con = require("../../db1.js"),
//     g_var = require("../../global_var.js")

// const movement_type = function () {}

// var da = new Date();

// movement_type.prototype.MovementApiFunc = function (req, res, callback) {
//     con.query(`SELECT * FROM movement_type`, function (err, result, fields) {
//         if (err) {
//             console.log(err);

//             res.status(500).json({
//                 "success": false,
//                 "message": "Error with endpoint",
//                 "err": err
//             });
//         } else if (result.length > 0) {
//             res.status(200).json({
//                 "success": true,
//                 "movement_types": result
//             });
//         } else {
//             res.status(200).json({
//                 "success": true,
//                 "movement_types": []
//             });
//         }
//     });
// }

// module.exports = new movement_type();


const con = require("../../db1.js");
const g_var = require("../../global_var.js");

const movement_type = function () {};

movement_type.prototype.MovementApiFunc = function (req, res, callback) {
    const typeFilter = req.query.type; // Get the 'type' parameter from the query string
      console.log(typeFilter, '-----------------------');
    const query = `SELECT * FROM movement_type`;

    if (typeFilter) {
        // If 'type' parameter is provided, add a WHERE clause to the query
        const filteredQuery = `${query} WHERE type = '${typeFilter}'`;
        executeQuery(res, filteredQuery);
    } else {
        // If 'type' parameter is not provided, fetch all data
        executeQuery(res, query);
    }
};


// movement_type.prototype.MovementApiFunc = function (req, res, callback) {
//     // const whereParam = req.query._where;
//     const whereParam = req.query._where || req.query.where; // Check for both _where and where parameters
//    console.log(whereParam , "whereParam");
//     if (whereParam) {
//         // If '_where' parameter is provided, parse it and add a WHERE clause to the query
//         const conditions = parseWhereParam(whereParam);
//         if (conditions) {
//             const query = `SELECT * FROM movement_type WHERE ${conditions}`;
//             executeQuery(res, query);
//         } else {
//             res.status(400).send('Invalid _where parameter');
//         }
//     } else {
//         // If '_where' parameter is not provided, fetch all data
//         const query = `SELECT * FROM movement_type`;
//         executeQuery(res, query);
//     }
// };


// Helper function to parse the _where parameter

// Helper function to parse the _where parameter
// function parseWhereParam(whereParam) {
//     // Check for the presence of '=' and handle cases with or without parentheses
//     const match = whereParam.match(/([^=]+)(?:\(([^,]+),([^,]+),([^)]+)\))?/);

//     if (match && match[1]) {
//         const field = match[1];
//         if (match[2] && match[3] && match[4]) {
//             const operator = match[2];
//             const value = match[3];
//             // You might want to perform additional validation here
//             return `${field} ${operator} '${value}'`;
//         } else {
//             // If no parentheses, treat the whole value as the field
//             return `${field}`;
//         }
//     }
    
//     return null;
// }





function executeQuery(res, query) {
    con.query(query, function (err, result, fields) {
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": err
            });
        } else if (result.length > 0) {
            res.status(200).json({
                "success": true,
                "movement_types": result
            });
        } else {
            res.status(200).json({
                "success": true,
                "movement_types": []
            });
        }
    });
}

module.exports = new movement_type();

