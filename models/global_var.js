let da = new Date();
	let time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
	let dateTime = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2) + " " + ("0" + (da.getHours())).slice(-2) + ":" + ("0" + (da.getMinutes())).slice(-2) + ":" + ("0" + (da.getSeconds())).slice(-2);
	let date = da.getFullYear() + "-" + ("0" + (da.getMonth() + 1)).slice(-2) + "-" + ("0" + (da.getDate())).slice(-2);
	let nowDate = da.toISOString().slice(0, 19).replace('T', ' ');

	let global_var = {
		date : date,
		time : time,
		dateTime : dateTime,
		nowDate : nowDate
	}
	
	module.exports = global_var;