var express = require('express'),
	path = '../../models/manager/v1/',
	router = express.Router(),
	orders = require(`${path}orders.js`),
	dashboard = require(`${path}dashboard.js`),
	vendors = require(`${path}vendors.js`),
	new_material_reqs = require(`${path}new_material_reqs.js`),
	return_items = require(`${path}return_items.js`),
	indent_count = require(`${path}indent_count.js`)





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
				'message': 'orders endpoint executed successfully'
			})
		}
	})
})

router.post('/dashboard', function (req, res) {
	dashboard.dashboard_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Dashboard.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Dashboard endpoint executed successfully'
			})
		}
	})
})

router.post('/vendors', function (req, res) {
	vendors.vendors_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Vendors.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Vendors endpoint executed successfully'
			})
		}
	})
})

router.post('/new_material_reqs', function (req, res) {
	new_material_reqs.new_material_reqs_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint new_material_reqs.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'new_material_reqs endpoint executed successfully'
			})
		}
	})
})

router.post('/return_items', function (req, res) {
	return_items.return_items_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint return_items.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'return_items endpoint executed successfully'
			})
		}
	})
})

router.post('/indent_count', function (req, res) {
	indent_count.indent_count_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint indent_count.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'indent_count endpoint executed successfully'
			})
		}
	})
})

module.exports = router