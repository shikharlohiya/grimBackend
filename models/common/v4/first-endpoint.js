const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database


var cron = require('node-cron');
const axios = require('axios');

// const { exec } = require('child_process');
// const restartCommand = "pm2 restart app";
// const listCommand = "pm2 list";

// console.log("Starting App Restarter");

// const restartApp = function () {
//   exec(restartCommand, (err, stdout, stderr) => {
//     if (!err && !stderr) {
//       console.log(new Date(), `App restarted!!!`);
//       listApps();
//     }
//     else if (err || stderr) {
//       console.log(new Date(), `Error in executing ${restartCommand}`, err || stderr);
//     }
//   });
// }

// function listApps() {
//   exec(listCommand, (err, stdout, stderr) => {
//     // handle err if you like!
//     console.log(`pm2 list`);
//     console.log(`${stdout}`);
//   });
// }

// cron.schedule('*/2 * * * *', () => {
//     console.log('----------------------------');
//   console.log('restarting the GRIM App');
//   restartApp();
// });

// cron.schedule('*/5 * * * *', () => {
//     console.log('----------------------------');

    

//     // Make a request for a user with a given ID
//     axios.get(`https://grim.co.in:3002/api/v3/demo`)
//         .then(function (response) {
//             console.log(`working fine`);
//             // res.status(200).json({
//             //     status: 200,
//             //     result: response.data
//             // });
//         })
//         .catch(function (error) {
//             console.log(error);
//             var substitutions = {
//                 "from": "IBGroup <grim@ibgroup.co.in>",
//                 "to": "phanindrareddy491@gmail.com, sandeep.gajpal@ibgroup.co.in, digvijaya.swain@ibgroup.co.in",
//                 "subject": `GRIM Stuck Issue`,
//                 "template": "GRIMStuckIssueTemp",
//                 "view": {
//                     'link': process.env.link
//                 }

//               }

//               axios.get(`http://api.smscountry.com/SMSCWebservice_MultiMessages.asp?user=abislaziz&passwd=Stream01&mno_msg=919533043029^GRIM PRD is down.~919303705096^GRIM PRD is down.~919109902467^GRIM PRD is down.&DR=Y&mtype=N`)
//                 .then(function (response) {
//                 //   console.log(response);
//                 }).catch(function (error) {
//                   // handle error
//                   console.log(error);
//                 })

//               axios.post(`${process.env.host}/api/v3/sendmail`, substitutions)
//                 .then(function (response) {
//                 //   console.log(response);
//                 }).catch(function (error) {
//                   // handle error
//                   console.log(error);
//                 })
//         })
// });
const first_endpoint = function () { }


first_endpoint.prototype.firstendpoint = function (req, res, callback) {
    mysqlPool.getConnection(function (err, connection) {
        if (err) {
            connection.release()
            callback(true, null)
        } else {
            res.json(req.body)


        }
    })
}

module.exports = new first_endpoint()