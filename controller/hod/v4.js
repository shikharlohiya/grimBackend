var express = require('express'),
	path = '../../models/hod/v4/',
	router = express.Router(),
	orders = require(`${path}orders.js`),
	dashboard = require(`${path}dashboard.js`),
	vendors = require(`${path}vendors.js`),
	new_material_reqs = require(`${path}new_material_reqs.js`),
	return_items = require(`${path}return_items.js`),
	indent_count = require(`${path}indent_count.js`),
	indent_report = require(`${path}indent_report.js`),
	material_report = require(`${path}material_report.js`),
	user_report = require(`${path}user_report.js`),
	pr_report = require(`${path}pr_report.js`),
	cost_report = require(`${path}cost_report.js`),
	service_requests = require(`${path}service_requests.js`)



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


router.post('/indent_report', function (req, res) {
	indent_report.indent_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint indent_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'indent_report endpoint executed successfully'
			})
		}
	})
})

router.post('/material_report', function (req, res) {
	material_report.material_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint material_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'material_report endpoint executed successfully'
			})
		}
	})
})

router.post('/user_report', function (req, res) {
	user_report.user_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'user_report endpoint executed successfully'
			})
		}
	})
})

router.post('/pr_report', function (req, res) {
	pr_report.pr_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint pr_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'pr_report endpoint executed successfully'
			})
		}
	})
})

router.post('/cost_report', function (req, res) {
	cost_report.cost_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cost_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cost_report endpoint executed successfully'
			})
		}
	})
})

router.post('/service_requests', function (req, res) {
	service_requests.service_requests_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_requests.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_requests endpoint executed successfully'
			})
		}
	})
})
module.exports = router