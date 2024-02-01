const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
var CryptoJS = require("crypto-js");
require('dotenv/config')

const {
    forgotPasswordTemp
} = require('../../emailTemplates/template.js');
// console.log(forgotPasswordTemp);


// const nodemailer = require('../lib/nodemailer');
const nodemailer = require("nodemailer");



// const SENDGRID_API_KEY = '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';
// const mailer = require('sendgrid-mailer').config(SENDGRID_API_KEY);


const forgot_password = function () {}


forgot_password.prototype.forgot_password_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        console.log(req.body);
        if (err) {
            console.log(err);

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint"
            })
        } else {



            let transporter = nodemailer.createTransport({
                host: process.env.smtp_host,
                port: process.env.smtp_port,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.smtp_user, // generated ethereal user
                    pass: process.env.smtp_pass // generated ethereal password
                },
                logger: true,
                debug: false // include SMTP traffic in the logs
            }, {
                // default message fields

                // sender info
                from: 'IBGroup <grim@ibgroup.co.in>'
            });


            var da = new Date();
            da.setHours(da.getHours() + 1);
            var dateTime =
                da.getFullYear() +
                "-" +
                ("0" + (da.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + da.getDate()).slice(-2) +
                " " +
                ("0" + da.getHours()).slice(-2) +
                ":" +
                ("0" + da.getMinutes()).slice(-2) +
                ":" +
                ("0" + da.getSeconds()).slice(-2);
            con.query(`SELECT id, email, first_name FROM user_details where email = "${req.body.email}"`, function (c_err, c_result) {
                if (c_err) {
                    console.log(c_err);
                    con.release();
                    res.status(500).json({
                        "success": false,
                        "message": "Error with endpoint"
                    })
                } else {
                    if (c_result.length == 0) {
                        con.release();
                        res.status(400).json({
                            "success": true,
                            "message": "This Email Doesn't Exist with GRIM...!"
                        })
                    } else {
                        var token = CryptoJS.AES.encrypt(JSON.stringify(c_result), 'reset_password');
                        console.log('token:', token);
                        var query = `UPDATE user_details set resetPasswordToken = '${token}', resetPasswordExpires = '${dateTime}' WHERE id = ${c_result[0].id}`
                        console.log(query);

                        con.query(query, function (re_err, re_result, fields) {
                            if (err) {
                                console.log(re_err);
                            } else {
                                console.log(re_result);

                                console.log('updated successfully');

                                var link = `${process.env.link}/reset/?token=${token}`;

                                var forgotPasswordTemplate = forgotPasswordTemp.replace("%|reset_password_link|%", link);

                                let message = {
                                    // Comma separated list of recipients
                                    to: req.body.email,

                                    // Subject of the message
                                    subject: 'Reset password',

                                    // HTML body
                                    html: forgotPasswordTemplate,
                                };

                                transporter.sendMail(message, (error, info) => {
                                    if (error) {
                                        console.log('Error occurred');
                                        console.log(error.message);
                                        con.release();
                                        res.status(500).json({
                                            "success": false,
                                            "message": "Something Went Wrong...!"
                                        })
                                    }

                                    console.log('Message sent successfully!');
                                    console.log(nodemailer.getTestMessageUrl(info));
                                    transporter.close();
                                    con.release();
                                    res.status(200).json({
                                        "success": true,
                                        "message": "Email Sent Successfully...!"
                                    })
                                    // only needed when using pooled connections
                                });
                            }
                        });

                        // const email1 = {
                        //     to: req.body.email,
                        //     from: 'IBGroup <grim@ibgroup.co.in>',
                        //     subject: 'Reset password',
                        //     templateId: 'daa902e7-3da4-4481-80f3-0feecd91f3e2',
                        //     substitutions: {
                        //         '%|reset_password_link|%': `${process.env.link}/reset/?token=${token}`

                        //     }
                        // };
                        // console.log(email1);


                        // const email = [email1];


                        // Message object


                        // mailer.send(email1).then((response) => {
                        //     console.log(response);
                        //     con.release();
                        //     res.status(200).json({
                        //         "success": true,
                        //         "message": "Email Sent Successfully...!",
                        //         "result": response
                        //     })
                        // }).catch((error) => {
                        //     con.release();
                        //     res.status(500).json({
                        //         "success": false,
                        //         "message": "Something Went Wrong...!"
                        //     })
                        //     console.log('error', error, email);
                        //     console.log(error.response.body.errors)
                        // });

                    }
                }
            })
        }
    })
}

module.exports = new forgot_password()