const mysql = require("../../db.js"),
    g_var = require("../../global_var.js"),
    mysqlPool = mysql.createPool() // connects to Database

 var emaillogs = function(){};

 emaillogs.prototype.emaillogs_func = function(req, res, callback){
 mysqlPool.getConnection(function(err, connection) {
   res.setHeader('Content-Type', 'application/json');
   var da = new Date();
	var dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
// var emaillength = req.body.length;
console.log(req.body);


for(i=0; i<emaillength; i++){

var sql = "INSERT INTO email_logs (sg_event_id, sg_message_id, event, receiveremail, ip, response, createdat) VALUES ('" +  req.body[i].sg_event_id + "','" +  req.body[i].sg_message_id + "','" +  req.body[i].event + "','" +  req.body[i].email + "','" +  req.body[i].ip + "','" +  req.body[i].response + "', '" +  dateTime + "')";
  connection.query(sql, function (err, result) {
    if (err) throw err;
console.log("1 row inserted");
  });
}

  
}); 
}

module.exports = new emaillogs();