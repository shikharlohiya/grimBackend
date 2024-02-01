var express = require('express'),
	path = '../../models/storeUser/v2/',
	router = express.Router(),
	orders = require(`${path}orders.js`),
	unstock_materials = require(`${path}unstock_materials.js`),
	purchase_request = require(`${path}purchase_request.js`),
	purchase_requests = require(`${path}purchase_requests.js`),
	items_received = require(`${path}items_received.js`),
	new_material_reqs = require(`${path}new_material_reqs.js`),
	auto_pr_items = require(`${path}auto_pr_materials.js`),
	return_items = require(`${path}return_items.js`),
	indent_count = require(`${path}indent_count.js`),
	get_users = require(`${path}get_users.js`),
	dashboard = require(`${path}dashboard.js`)








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

router.get('/unstock_materials', function (req, res) {
	unstock_materials.unstock_materials_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint unstock_materials.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Unstock_materials endpoint executed successfully'
			})
		}
	})
})

router.post('/purchase_request', function (req, res) {
	purchase_request.purchase_request_latest_func(req, res, function (err, data) {
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

router.get('/purchase_requests', function (req, res) {
	purchase_requests.get_purchase_requests_latest_func(req, res, function (err, data) {
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

router.post('/items_received', function (req, res) {
	items_received.items_received_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint items_received.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'items_received endpoint executed successfully'
			})
		}
	})
})

router.get('/new_material_reqs', function (req, res) {
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

router.get('/auto_pr_materials', function (req, res) {
	auto_pr_items.auto_pr_items_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint auto_pr_items.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'auto_pr_items endpoint executed successfully'
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


router.get('/get_users', function (req, res) {
	get_users.get_users_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint get_users.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'get_users endpoint executed successfully'
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
module.exports = router