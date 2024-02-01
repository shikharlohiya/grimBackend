const con = require("../../db1.js"),
    g_var = require("../../global_var.js")
var CryptoJS = require("crypto-js");
require('dotenv/config')

const {
    forgotPasswordTemp
} = require('../../emailTemplates/template.js');
const nodemailer = require("nodemailer");


const forgot_password = function () {}


forgot_password.prototype.forgot_password_func = function (req, res, callback) {



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

            res.status(500).json({
                "success": false,
                "message": "Error with endpoint",
                "err": c_err
            })
        } else {
            if (c_result.length == 0) {

                res.status(400).json({
                    "success": true,
                    "message": "This Email Doesn't Exist with GRIM...!"
                })
            } else {
                var token = CryptoJS.AES.encrypt(JSON.stringify(c_result), 'reset_password');
                // console.log('token:', token);
                var query = `UPDATE user_details set resetPasswordToken = '${token}', resetPasswordExpires = '${dateTime}' WHERE id = ${c_result[0].id}`
                // console.log(query);

                con.query(query, function (re_err, re_result, fields) {
                    if (err) {
                        console.log(re_err);
                    } else {
                        // console.log(re_result);

                        // console.log('updated successfully');

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

                                res.status(500).json({
                                    "success": false,
                                    "message": "Something Went Wrong...!",
                                    "err": error.message
                                })
                            }

                            // console.log('Message sent successfully!');
                            // console.log(nodemailer.getTestMessageUrl(info));
                            transporter.close();

                            res.status(200).json({
                                "success": true,
                                "message": "Email Sent Successfully...!"
                            })
                            // only needed when using pooled connections
                        });
                    }
                });

            }
        }
    })
}

module.exports = new forgot_password()