var express = require('express'),
	path = '../../models/common/v1/',
	router = express.Router(),
	login = require(`${path}login.js`),
	uploadImageToS3 = require(`${path}uploadImageToS3.js`),
	create_order = require(`${path}create_order.js`),
	update_order_status = require(`${path}update_order_status.js`),
	locations = require(`${path}locations.js`),
	products = require(`${path}products.js`),
	create_user = require(`${path}create_user.js`),
	reset_password = require(`${path}reset_password.js`),
	forgot_password = require(`${path}forgot_password.js`),
	emaillogs = require(`${path}emaillogs.js`),
	updatePasswordViaEmail = require(`${path}updatePasswordViaEmail.js`),
	privileges = require(`${path}privileges.js`),
	notification_post = require(`${path}notification_post.js`),
	uploadFileToS3 = require(`${path}uploadFileToS3.js`),
	user_details = require(`${path}user_details.js`),
	delete_indent = require(`${path}delete_indent.js`),
	edit_indent = require(`${path}edit_indent.js`),
	status_history = require(`${path}status_history.js`),
	item_group = require(`${path}item_group.js`),
	notification_logs = require(`${path}notification_logs.js`),
	order_details = require(`${path}order_details.js`),
	wbs_numbers = require(`${path}wbs_numbers.js`),
	update_po_grn = require(`${path}update_po_grn.js`),
	notification_logs_count = require(`${path}notification_logs_count.js`)


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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


router.post('/login', function (req, res) {
	login.login_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint topic_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Login endpoint executed successfully'
			})
		}
	})
})

router.post('/uploadImageToS3', multipartMiddleware, function (req, res) {
	uploadImageToS3.uploadImageToS3_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint topic_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'uploadImageToS3 endpoint executed successfully'
			})
		}
	})
})

router.post('/create_order', function (req, res) {
	create_order.create_order_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint topic_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Login endpoint executed successfully'
			})
		}
	})
})

router.put('/update_order_status', function (req, res) {
	update_order_status.update_order_status_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_order_status.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Update_order_status endpoint executed successfully'
			})
		}
	})
})

router.get('/locations', function (req, res) {
	locations.locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Locations.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Locations endpoint executed successfully'
			})
		}
	})
})

router.get('/delivery_locations', function (req, res) {
	locations.delivery_locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Locations.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Locations endpoint executed successfully'
			})
		}
	})
})

router.get('/store_locations', function (req, res) {
	locations.store_locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint Locations.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Locations endpoint executed successfully'
			})
		}
	})
})
router.get('/user_locations', function (req, res) {
	locations.user_locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_locations.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'user_locations endpoint executed successfully'
			})
		}
	})
})

router.get('/user_store_locations', function (req, res) {
	locations.user_store_locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_store_locations_func.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'user_store_locations_func endpoint executed successfully'
			})
		}
	})
})

router.get('/products', function (req, res) {
	products.products_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint products.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Products endpoint executed successfully'
			})
		}
	})
})

router.post('/products', function (req, res) {
	products.products_filter_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint products.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Products endpoint executed successfully'
			})
		}
	})
})

router.get('/products_search', function (req, res) {
	products.products_search_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint products.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'Products endpoint executed successfully'
			})
		}
	})
})

router.post('/create_user', function (req, res) {
	create_user.create_user_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint create_user.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'create_user endpoint executed successfully'
			})
		}
	})
})

router.put('/reset_password', function (req, res) {
	reset_password.reset_password_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint reset_password.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'reset_password endpoint executed successfully'
			})
		}
	})
})

router.post('/forgot_password', function (req, res) {
	forgot_password.forgot_password_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint forgot_password.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'forgot_password endpoint executed successfully'
			})
		}
	})
})

router.post('/emaillogs', function (req, res) {
	emaillogs.emaillogs_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint emaillogs.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'emaillogs endpoint executed successfully'
			})
		}
	})
})

router.post('/updatePasswordViaEmail', function (req, res) {
	updatePasswordViaEmail.updatePasswordViaEmail_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint updatePasswordViaEmail.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'updatePasswordViaEmail endpoint executed successfully'
			})
		}
	})
})

router.get('/privileges', function (req, res) {
	privileges.privileges_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint privileges.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'privileges endpoint executed successfully'
			})
		}
	})
})

router.get('/item_group', function (req, res) {
	item_group.item_group_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint item_group.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'item_group endpoint executed successfully'
			})
		}
	})
})

router.post('/notification_post', function (req, res) {
	notification_post.notification_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint notification_post.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'notification_post endpoint executed successfully'
			});
		}
	});
});

router.post('/uploadFileToS3', multipartMiddleware, function (req, res) {
	uploadFileToS3.uploadFileToS3_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error uploading file!'
			});
		} else {
			res.json({
				'success': true,
				'message': 'File uploaded successfully'
			});
		}
	});
});

router.post('/user_details', function (req, res) {
	user_details.user_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_details.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'user_details endpoint executed successfully'
			});
		}
	});
});

router.delete('/delete_indent', function (req, res) {
	delete_indent.delete_indent_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_details.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'delete_indent endpoint executed successfully'
			});
		}
	});
});

router.put('/edit_indent', function (req, res) {
	edit_indent.edit_indent_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint edit_indent.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'edit_indent endpoint executed successfully'
			});
		}
	});
});

router.post('/status_history', function (req, res) {
	status_history.status_history_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint status_history.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'status_history endpoint executed successfully'
			});
		}
	});
});

router.post('/notification_logs', function (req, res) {
	notification_logs.notification_logs_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint notification_logs.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'notification_logs endpoint executed successfully'
			});
		}
	});
});

router.post('/notification_logs_count', function (req, res) {
	notification_logs_count.notification_logs_count_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint notification_logs_count.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'notification_logs_count endpoint executed successfully'
			});
		}
	});
});

router.post('/order_details', function (req, res) {
	order_details.order_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint order_details.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'order_details endpoint executed successfully'
			});
		}
	});
});

router.get('/wbs_numbers', function (req, res) {
	wbs_numbers.wbs_numbers_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint wbs_numbers.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'wbs_numbers endpoint executed successfully'
			});
		}
	});
});

router.post('/update_pr_po_grn', function (req, res) {
	update_po_grn.update_po_grn_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_po_grn.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'update_po_grn endpoint executed successfully'
			});
		}
	});
});

module.exports = router