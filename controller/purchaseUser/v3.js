var express = require('express'),
	path = '../../models/purchaseUser/v3/',
	router = express.Router(),
    purchase_requests = require(`${path}purchase_requests.js`),
    purchase_orders = require(`${path}purchase_orders.js`),
	items_issued = require(`${path}items_issued.js`)


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


router.get('/purchase_requests', function (req, res) {
	purchase_requests.purchase_requests_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint purchase_request.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Purchase_request endpoint executed successfully'
			})
		}
	})
})

router.post('/purchase_orders', function (req, res) {
	purchase_orders.purchase_orders_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint purchase_orders.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'purchase_orders endpoint executed successfully'
			})
		}
	})
})

router.get('/purchase_orders', function (req, res) {
	purchase_orders.get_purchase_orders_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint purchase_orders.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'purchase_orders endpoint executed successfully'
			})
		}
	})
})

router.post('/items_issued', function (req, res) {
	items_issued.items_issued_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint items_issued.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'items_issued endpoint executed successfully'
			})
		}
	})
})

router.get('/items_issued', function (req, res) {
	items_issued.get_items_issued_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint items_issued.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'items_issued endpoint executed successfully'
			})
		}
	})
})

module.exports = router