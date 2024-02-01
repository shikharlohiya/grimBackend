var express = require('express'),
	path = '../../models/admin/v2/',
	router = express.Router(),
	users = require(`${path}users.js`)
	// user_roles = require(`${path}user_roles.js`)




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

router.post('/get_users', function (req, res) {
	users.users_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Users.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Users endpoint executed successfully'
			})
		}
	})
})

router.delete('/users', function (req, res) {
	users.users_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Users.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Users endpoint executed successfully'
			})
		}
	})
})


router.put('/users', function (req, res) {
	users.users_update_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Users.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Users endpoint executed successfully'
			})
		}
	})
})

// router.get('/user_roles', function (req, res) {
// 	user_roles.get_user_roles_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint Users.. !'
// 			})
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'User roles endpoint executed successfully'
// 			})
// 		}
// 	})
// })

// router.delete('/user_roles', function (req, res) {
// 	user_roles.delete_user_roles_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint Users.. !'
// 			})
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'User roles endpoint executed successfully'
// 			})
// 		}
// 	})
// })


// router.put('/user_roles', function (req, res) {
// 	user_roles.user_roles_update_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint Users.. !'
// 			})
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'User roles endpoint executed successfully'
// 			})
// 		}
// 	})
// })

module.exports = router