const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database
const nodemailer = require("nodemailer");
const Mustache = require("mustache");
require('dotenv/config')




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

const sendmail = function () {}

sendmail.prototype.sendmail_func = function (req, res, callback) {
    mysqlPool.getConnection(function (err, con) {
        // console.log(req.body);

        const {
            template
        } = require(`../../emailTemplates/${req.body.template}.js`);

        var view = req.body.view;
           
          var output = Mustache.render(template, view);
        //   console.log(output);
        let message = {
            // Comma separated list of recipients
            to: req.body.to,

            // Subject of the message
            subject: req.body.subject,

            // HTML body
            html: output,
        };

        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log('Error occurred');
                // console.log(error.message);
                con.release();
                // res.status(500).json({
                //     "success": false,
                //     "message": "Something Went Wrong...!"
                // })
            }

            console.log('Message sent successfully!');
            // console.log(nodemailer.getTestMessageUrl(info));
            transporter.close();
            res.status(200).json({
                "success": true,
                "message": "Email Sent Successfully...!"
            })
            // only needed when using pooled connections
        });
    })
}

module.exports = new sendmail()