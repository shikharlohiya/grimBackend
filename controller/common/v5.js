var express = require('express'),
	path = '../../models/common/v4/',
	router = express.Router(),
	login = require(`${path}login.js`),
	uploadImageToS3 = require(`${path}uploadImageToS3.js`),
	uploadImage = require(`${path}uploadImage.js`),
	create_orders = require(`${path}create_orders.js`),
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
	update_sto_md_my = require(`${path}update_sto_md_my.js`),
	update_sto_md = require(`${path}update_sto_md.js`),
	notification_logs_count = require(`${path}notification_logs_count.js`),
	company_codes = require(`${path}company_codes.js`),
	received_materials = require(`${path}received_materials.js`),
	logout = require(`${path}logout.js`),
	first_endpoint = require(`${path}first-endpoint.js`),
	sendmail = require(`${path}sendmail.js`),
	auto_reject = require(`${path}auto_reject.js`),
	departments = require(`${path}departments.js`),
	services = require(`${path}services.js`),
	service_details = require(`${path}service_details.js`),
	approvals_details = require(`${path}approvals_details.js`),
	return_reasons = require(`${path}return_reasons.js`),
	get_managers = require(`${path}get_managers.js`),
	code_creation = require(`${path}code_creation.js`),
	update_code_status = require(`${path}update_code_status.js`),
	code_history = require(`${path}code_history.js`),
	service_creation = require(`${path}service_creation.js`),
	unit_of_measure = require(`${path}unit_of_measure.js`),
	code_details = require(`${path}code_details.js`),
	code_rm_meta_data = require(`${path}code_rm_meta_data.js`),
	code_store_details = require(`${path}code_store_details.js`),
	new_material_reqs = require(`${path}new_material_reqs.js`),
	code_finance_meta_data = require(`${path}code_finance_meta_data.js`),
	code_finance_details = require(`${path}code_finance_details.js`),
	control_codes = require(`${path}control_codes.js`),
	code_taxation_details = require(`${path}code_taxation_details.js`),
	assets = require(`${path}assets.js`),
	cost_centers = require(`${path}cost_centers.js`),
	ticket_details = require(`${path}ticket_details.js`),
	temp_details =  require(`${path}temp_details.js`),
	approval_pending_orders =  require(`${path}approval_pending_orders.js`),
	special_products =  require(`${path}special_products.js`),
	approval_count =  require(`${path}approval_count.js`),
	service_nos =  require(`${path}service_nos.js`),
	service_groups =  require(`${path}service_groups.js`),
	gl_accounts =  require(`${path}gl_accounts.js`),
	service_status_history = require(`${path}service_status_history.js`),
	update_service_status = require(`${path}update_service_status.js`),

	// new API 
	order_status = require(`${path}order_status.js`);
	user_roles = require(`${path}user_role.js`);
    purchase_group = require(`${path}purchase_group.js`);
    create_vendor = require(`${path}create_vendor.js`)







var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const ppath = require('path');
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
		cb(null, './public/uploads')
	},
	
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + ppath.extname(file.originalname))
    }
});
var upload = multer({
	storage: storage
});

// new API created by shikhar 
router.post('/create_vendor', function (req, res) {
	create_vendor.create_vendor_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint order_status.. !'
			})
		} else {
			res.json({
				'success': data,
				'message': 'Create Vendor executed successfully'
			})
		}
	})
});

router.get('/purchase_group', function (req, res) {
	purchase_group.purchaseGroupFunc(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint order_status.. !'
			})
		} else {
			res.json({
				'success': data,
				'message': 'Purchase Group executed successfully'
			})
		}
	})
});

router.get('/order_status', function (req, res) {
	order_status.orderStatusFunc(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint order_status.. !'
			})
		} else {
			res.json({
				'success': data,
				'message': 'order status executed successfully'
			})
		}
	})
});


router.get('/user_roles', function (req, res) {
	user_roles.userRoleFunc(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint order_status.. !'
			})
		} else {
			res.json({
				'success': data,
				'message': 'User Role executed successfully'
			})
		}
	})
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

router.post('/create_orders', function (req, res) {
	create_orders.create_order_func(req, res, function (err, data) {
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

// router.get('/plants', function (req, res) {
// 	locations.plants_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint Locations.. !'
// 			})
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'Locations endpoint executed successfully'
// 			})
// 		}
// 	})
// })

// router.post('/locations_wrt_plant', function (req, res) {
// 	locations.locations_wrt_plant_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint Locations.. !'
// 			})
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'Locations endpoint executed successfully'
// 			})
// 		}
// 	})
// })

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

router.get('/user_sto_store_locations', function (req, res) {
	locations.user_sto_store_locations_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint user_sto_store_locations_func.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'user_sto_store_locations_func endpoint executed successfully'
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



router.post('/uploadImage', upload.single('file'), function (req, res) {
	uploadImage.uploadImage_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint topic_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'uploadImage endpoint executed successfully'
			})
		}
	})
})

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

router.get('/ticket_details', function (req, res) {
	ticket_details.ticket_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint ticket_details.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'ticket_details endpoint executed successfully'
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

router.get('/company_codes', function (req, res) {
	company_codes.company_codes_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint company_codes.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'company_codes endpoint executed successfully'
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

router.post('/update_sto_md_my_old', function (req, res) {
	update_sto_md_my.update_sto_md_my_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_sto_md_my.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'update_sto_md_my endpoint executed successfully'
			});
		}
	});
});

router.post('/update_sto_md_my', function (req, res) {
	update_sto_md.update_sto_md_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_sto_md_my.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'update_sto_md endpoint executed successfully'
			});
		}
	});
});


router.get('/received_materials', function (req, res) {
	received_materials.received_materials_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint received_materials.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'received_materials endpoint executed successfully'
			});
		}
	});
});

router.put('/logout', function (req, res) {
	logout.logout_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint logout.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'logout endpoint executed successfully'
			});
		}
	});
});

router.post('/sendmail', function (req, res) {
	sendmail.sendmail_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint sendmail.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'sendmail endpoint executed successfully'
			});
		}
	});
});

router.get('/demo', function (req, res) {

	first_endpoint.firstendpoint(req, res, function (err, data) {
		if (err) {
			res.status(500).json({
				'error': true,
				'message': 'Error with endpoint .. !'
			})
		} else {
			res.status(200).json({
				'success': true,
				'message': 'endpoint executed successfully'
			})
		}
	})
})

router.post('/auto_reject', function (req, res) {
	auto_reject.auto_reject_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint auto_reject.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'auto_reject endpoint executed successfully'
			});
		}
	});
});

router.get('/departments', function (req, res) {
	departments.departments_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint departments.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'departments endpoint executed successfully'
			})
		}
	})
})

router.post('/departments', function (req, res) {
	departments.departments_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint departments.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'departments endpoint executed successfully'
			})
		}
	})
})

router.put('/departments', function (req, res) {
	departments.departments_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint departments.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'departments endpoint executed successfully'
			})
		}
	})
})

router.get('/services', function (req, res) {
	services.services_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint services.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'services endpoint executed successfully'
			})
		}
	})
})

router.post('/service_details', function (req, res) {
	service_details.service_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_details endpoint executed successfully'
			})
		}
	})
})

router.get('/service_details', function (req, res) {
	service_details.service_details_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_details endpoint executed successfully'
			})
		}
	})
})

router.put('/service_details', function (req, res) {
	service_details.service_details_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_details endpoint executed successfully'
			})
		}
	})
})

router.get('/approvals_details', function (req, res) {
	approvals_details.approvals_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint approvals_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'approvals_details endpoint executed successfully'
			})
		}
	})
})

router.get('/return_reasons', function (req, res) {
	return_reasons.return_reasons_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint return_reasons.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'return_reasons endpoint executed successfully'
			})
		}
	})
})

router.get('/get_managers', function (req, res) {
	get_managers.get_managers_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint get_managers.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'get_managers endpoint executed successfully'
			})
		}
	})
})

router.post('/code_creation', function (req, res) {
	code_creation.code_creation_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_creation.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_creation endpoint executed successfully'
			})
		}
	})
})

router.post('/update_code_status', function (req, res) {
	update_code_status.update_code_status_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_code_status.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'update_code_status endpoint executed successfully'
			})
		}
	})
})

router.post('/code_history', function (req, res) {
	code_history.code_history_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_history.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_history endpoint executed successfully'
			})
		}
	})
})

router.post('/service_creation', function (req, res) {
	service_creation.service_creation_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_creation.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_creation endpoint executed successfully'
			})
		}
	})
})

router.put('/service_creation', function (req, res) {
	service_creation.service_creation_update_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_creation.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_creation endpoint executed successfully'
			})
		}
	})
})

router.get('/uom', function (req, res) {
	unit_of_measure.unit_of_measure_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint unit_of_measure.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'unit_of_measure endpoint executed successfully'
			})
		}
	})
})

router.get('/code_details', function (req, res) {
	code_details.code_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_details endpoint executed successfully'
			})
		}
	})
})

router.get('/code_rm_meta_data', function (req, res) {
	code_rm_meta_data.code_rm_meta_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_rm_meta_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_rm_meta_data endpoint executed successfully'
			})
		}
	})
})

router.post('/code_store_details', function (req, res) {
	code_store_details.code_store_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_store_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_store_details endpoint executed successfully'
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

router.get('/code_finance_meta_data', function (req, res) {
	code_finance_meta_data.code_finance_meta_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_finance_meta_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_finance_meta_data endpoint executed successfully'
			})
		}
	})
})

router.post('/code_finance_details', function (req, res) {
	code_finance_details.code_finance_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_finance_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_finance_details endpoint executed successfully'
			})
		}
	})
})

router.post('/code_taxation_details', function (req, res) {
	code_taxation_details.code_taxation_details_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint code_taxation_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'code_taxation_details endpoint executed successfully'
			})
		}
	})
})

router.get('/control_codes', function (req, res) {
	control_codes.control_codes_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint control_codes.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'control_codes endpoint executed successfully'
			})
		}
	})
})

router.get('/assets', function (req, res) {
	assets.assets_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint assets.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'assets endpoint executed successfully'
			})
		}
	})
})

router.get('/cost_centers', function (req, res) {
	cost_centers.cost_centers_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cost_centers.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cost_centers endpoint executed successfully'
			})
		}
	})
})

router.get('/temp_details', function (req, res) {
	temp_details.temp_details_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint temp_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cost_centers endpoint executed successfully'
			})
		}
	})
})

router.post('/temp_details', function (req, res) {
	temp_details.temp_details_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint temp_details.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'temp_details endpoint executed successfully'
			})
		}
	})
})

router.post('/i_orders', function (req, res) {
	approval_pending_orders.approval_pending_orders_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint approval_pending_orders.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'approval_pending_orders endpoint executed successfully'
			})
		}
	})
})

// router.post('/save_for_later', function (req, res) {
// 	save_for_later.save_for_later_func(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint save_for_later.. !'
// 			});
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'save_for_later endpoint executed successfully'
// 			});
// 		}
// 	});
// });

// router.get('/save_for_later', function (req, res) {
// 	save_for_later.save_for_later_getfunc(req, res, function (err, data) {
// 		if (err) {
// 			res.json({
// 				'success': false,
// 				'message': 'Error with endpoint save_for_later.. !'
// 			});
// 		} else {
// 			res.json({
// 				'success': true,
// 				'message': 'save_for_later endpoint executed successfully'
// 			});
// 		}
// 	});
// });

router.post('/special_products', function (req, res) {
	special_products.special_products_filter_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint special_products.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'special_products endpoint executed successfully'
			})
		}
	})
})

router.post('/add_special_products', function (req, res) {
	special_products.add_special_products_filter_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint add_special_products.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'add_special_products endpoint executed successfully'
			})
		}
	})
})

router.post('/approval_count', function (req, res) {
	approval_count.approval_count_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint approval_count.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'approval_count endpoint executed successfully'
			})
		}
	})
})

router.get('/service_nos', function (req, res) {
	service_nos.service_nos_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_nos.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_nos endpoint executed successfully'
			})
		}
	})
})

router.get('/service_groups', function (req, res) {
	service_groups.service_groups_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_groups.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'service_groups endpoint executed successfully'
			})
		}
	})
})

router.get('/gl_accounts', function (req, res) {
	gl_accounts.gl_accounts_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint gl_accounts.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'gl_accounts endpoint executed successfully'
			})
		}
	})
})



router.post('/service_status_history', function (req, res) {
	service_status_history.service_status_history_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint service_status_history.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'service_status_history endpoint executed successfully'
			});
		}
	});
});

router.post('/update_service_status', function (req, res) {
	update_service_status.update_service_status_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint update_service_status.. !'
			});
		} else {
			res.json({
				'success': true,
				'message': 'update_service_status endpoint executed successfully'
			});
		}
	});
});
module.exports = router