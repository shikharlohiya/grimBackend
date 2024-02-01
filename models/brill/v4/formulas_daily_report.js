const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
require('dotenv/config')
const axios = require('axios');

var cron = require('node-cron');

var moment = require('moment');
var yesterday = moment().subtract(1, 'days').format('LL');


cron.schedule('0 8 *   *   *', () => {

    axios.post(`${process.env.host}/api/v4/brill/formulas_daily_report`)
        .then(function (response) {
            console.log(`Data Sent`);
        })
        .catch(function (error) {
            console.log(`Error While Send The Data`);
        })
})


const formulas_daily_report = function () {}


formulas_daily_report.prototype.formulas_daily_report_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log('--------');
        var emails;
        var mailliststr = `razi@ibgroup.co.in, dr_anilsharma@ibgroup.co.in, premix@ibgroup.co.in, sandeep_dhalla@ibgroup.co.in, sandeep.gajpal@ibgroup.co.in`

        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            } else {
                con.query(`SET @count:=0; SET @maillist:='${mailliststr}'; SELECT *, (@count:=@count+1) AS serial_number, @maillist as MailReceivedPersons, DATE_FORMAT(CreatedAt,'%y-%m-%d %H:%i:%s') as CreatedAt, DATE_FORMAT(StoreDate,'%y-%m-%d %H:%i:%s') as UpdatedAt  FROM brill_stored_formulas WHERE DATE(CreatedAt) = DATE(NOW() - INTERVAL 1 DAY);`, function (i_err, i_result) {
                    if (i_err) {
                        console.log(i_err);
                        con.release();
                        res.status(500).json({
                            "success": false,
                            "message": "Error with endpoint",
                            "err": i_err
                        })
                    } else {
                        console.log(i_result[2]);
                        if (i_result[2].length > 0) {

                            var dynamic_data = {
                                "items": i_result[2],
                                "receipt": true,
                                "first_name": `Sir/Madam`,
                                "total_formulas": i_result[2].length,
                                "date": `${yesterday}`,
                                "link": process.env.fat_link
                            }

                            var maillist = ['razi@ibgroup.co.in', 'dr_anilsharma@ibgroup.co.in', 'premix@ibgroup.co.in', 'sandeep_dhalla@ibgroup.co.in', 'sandeep.gajpal@ibgroup.co.in'];
                            // var maillist = [ 'sandeep.gajpal@ibgroup.co.in', 'y.phanindra@ibgroup.co.in'];
                            maillist.toString();
                            // var esubstitutions = {
                            //     "from": "IBGroup <grim@ibgroup.co.in>",
                            //     "to": emails[0].to,
                            //     "cc": maillist,
                            //     "subject": `BRILL Daily Report Card 19-07-2022`,
                            //     "template": "FormulasTemp",
                            //     "view": dynamic_data
                            // }

                            

                            var substitutions = {
                                "from": "IBGroup <grim@ibgroup.co.in>",
                                "to": maillist,
                                "subject": `BRILL Daily Report Card ${yesterday}`,
                                "template": "FormulasTemp",
                                "view": dynamic_data
                            }

                            axios.post(`${process.env.host}/api/v4/sendmail`, substitutions)
                                .then(function (response) {
                                    con.release();
                                    res.status(200).json({
                                        "success": true,
                                        "message": "Daily Report Sent"
                                    })
                                    // console.log(response);
                                }).catch(function (error) {
                                    // handle error
                                    console.log(error);
                                })
                            // axios.post(`${process.env.host}/api/v4/sendmail`, esubstitutions)
                            //     .then(function (response) {
                            //         // console.log(response);
                            //     }).catch(function (error) {
                            //         // handle error
                            //         console.log(error);
                            //     })
                        } else {
                            res.status(200).json({
                                "success": true,
                                "message": "No Records Found to Send"
                            })
                        }
                    }
                });
            }
        })
    })
}

module.exports = new formulas_daily_report()