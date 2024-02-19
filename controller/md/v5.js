var express = require('express'),
	path = '../../models/md/v4/',
	router = express.Router(),
    orders = require(`${path}orders.js`),
	md_approval = require(`${path}md_approval.js`)
    



var jwt = require('jsonwebtoken')
var multer = require('multer')
var da = new Date()

function ensureToken(req, res, next) {
	const bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== 'undefined') {
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	} else {
		res.json({
			"success": false,
			"message": "Unauthorized"
		});
	}
}

var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2)
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '' + __dirname + '/temp/uploads')
	},
	filename: function (req, file, cb) {
		cb(null, "" + time + "")
	}
});

var upload = multer({
	storage: storage
})


router.post('/i_orders', function (req, res) {
	orders.orders_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint orders.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Orders endpoint executed successfully'
			})
		}
	})
})

router.post('/md_approval', function (req, res) {
	md_approval.md_approval_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint md_approval.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'md_approval endpoint executed successfully'
			})
		}
	})
})

module.exports = router