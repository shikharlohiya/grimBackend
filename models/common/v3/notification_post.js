const mysql = require("../../db.js"),

    mysqlPool = mysql.createPool(); // connects to Database

var _ = require("underscore");

var FCM = require('fcm-node');
var serverKey = 'AAAArImk890:APA91bH0jOGm3iMA6T2dB-emn5HpJ-Muuhr6pQWX4HiAZfCksqywWWoR73JHaq-gpAPrs0y9c6mbEaf7N9xdM3eBn4olgrRp4FdrWc9ihmJ2dJONftJUwgFYoXGH_AcYMYKadp_zJPgQ'; //put your server key here
var fcm = new FCM(serverKey);

var notification_post = function () {};

var da = new Date();
var unix_time = da.getTime();
var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
var day = ("0" + (da.getDate())).slice(-2);
var month = ("0" + (da.getMonth() + 1)).slice(-2);
var date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);

notification_post.prototype.notification_post_func = function (req, res, callback) {
    console.log(req.body);

    // var sql_query = '';
    // if (typeof req.body.type == "undefined" || req.body.type == ''){
    // 	res.json({"success":false, "message":"Network Error!"});
    // } else {
    // if( req.body.type == "all"){
    // 	sql_query= "SELECT userid,firebaseid,deviceid FROM userdetails WHERE accountstatus='active' AND firebaseid is not null";
    // } else if(req.body.type == "city"){
    // 	sql_query = "SELECT userid,firebaseid FROM userdetails WHERE accountstatus='active' AND firebaseid is not null AND city='"+req.body.city+"'";
    // } else if(req.body.type == "week" ){
    // 	sql_query = "SELECT a.userid,a.firebaseid FROM userdetails as a LEFT JOIN pregnantdetails as b WHERE a.accountstatus='active' AND a.firebaseid is not null AND TIMESTAMPDIFF(week , b.lastperioddate , '"+date+"') >= '"+req.body.from_week+"' AND TIMESTAMPDIFF(week , b.lastperioddate , '"+date+"') <= '"+req.body.to_week+"' ";
    // } else if(req.body.type == "user" ){
    // 	sql_query = "SELECT userid,firebaseid FROM userdetails WHERE accountstatus='active' AND firebaseid is not null AND userid in ("+ req.body.userid.join() +")";
    // } else {
    // 	res.json({"success":false, "message":"Network Error!"});
    // }
    // }
    mysqlPool.getConnection(function (err, connection) {
        connection.query(`SELECT id,fcm_token FROM user_details WHERE status=1 AND fcm_token is not null AND id =${ req.body.user_id}`, function (ferr, fresult, ffields) {
            if (ferr) {
                console.log(ferr);
                
                connection.release();
                callback(true, null);
            } else {
                var fid = [];
                for (var i = 0; i < fresult.length; i++) {
                    fid.push(fresult[i].fcm_token);
                }
                let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    registration_ids: fid,
                    notification: {
                        title: 'GRIM Order',
                        body: req.body.title
                    },

                    data: {
                        title: 'GRIM Order',
                        body: req.body.title,
                        content: req.body.content,
                        notification_type: 'order'
                    }

                };
                fcm.send(message, function (err, response) {

                    var rows_array = [];
                    var log = (err === null) ? JSON.parse(response) : JSON.parse(err);
                    console.log(err);
                    console.log(response);
                    console.log(log);
                    if (err) {
                        // res.json({
                        //     "success": false,
                        //     "message": 'Error with endpoint notification_post.. !'
                        // });
                        console.log(err);
                        
                    } else {
                        var insert_query = `INSERT INTO notification_logs (msg, time, user_id, notification_type, description,log,created_at) VALUES ('${req.body.title}','${unix_time}', ${req.body.user_id},"order" , '${req.body.content}', '${log.results[0].message_id}', now())`
                        connection.query(insert_query, [rows_array], function (ierr, iresult) {
                            if (ierr) {
                                console.log(ierr);
                            } else {
                                // res.json({
                                //     "success": true,
                                //     "message": "Notification sent successfully"
                                // });
                                console.log(iresult);
                                
                            }
                        }); 
                    }
                    
                });
            }
        });
        connection.release();
    });
}
module.exports = new notification_post();