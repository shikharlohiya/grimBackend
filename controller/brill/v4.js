var express = require('express'),
	path = '../../models/brill/v4/',
	router = express.Router(),
    stored_formulas = require(`${path}stored_formulas.js`),
    stored_formula_ingrediants = require(`${path}stored_formula_ingrediants.js`),
	formulas = require(`${path}formulas.js`),
	plants = require(`${path}plants.js`),
	raw_materials = require(`${path}raw_materials.js`),
	PODetails = require(`${path}PODetails.js`),
	material_stock = require(`${path}material_stock.js`),
	roles = require(`${path}roles.js`),
	privileges = require(`${path}privileges.js`),
	login = require(`${path}login.js`),
	logout = require(`${path}logout.js`),
	users = require(`${path}users.js`),
	compounds = require(`${path}compounds.js`),
	plant_types = require(`${path}plant_types.js`),
	cptp_groups = require(`${path}cptp_groups.js`),
	stock_based_on_plant = require(`${path}stock_based_on_plant.js`),
	stock_based_on_rm = require(`${path}stock_based_on_rm.js`),
	batch_data = require(`${path}batch_data.js`),
	packing_data = require(`${path}packing_data.js`),
	TITO_data = require(`${path}TITO_data.js`),
	energy_power_data = require(`${path}energy_power_data.js`)
	formulas_daily_report = require(`${path}formulas_daily_report.js`),


router.post('/stored_formulas', function (req, res) {
	stored_formulas.stored_formulas_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint stored_formulas.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'stored_formulas endpoint executed successfully'
			})
		}
	})
})

router.post('/stored_formula_ingrediants', function (req, res) {
	stored_formula_ingrediants.stored_formula_ingrediants_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint stored_formula_ingrediants.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'stored_formula_ingrediants endpoint executed successfully'
			})
		}
	})
})

router.get('/stored_formula_ingrediants', function (req, res) {
	stored_formula_ingrediants.stored_formula_ingrediants_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint stored_formula_ingrediants.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'stored_formula_ingrediants endpoint executed successfully'
			})
		}
	})
})

router.post('/formulas_daily_report', function (req, res) {
	formulas_daily_report.formulas_daily_report_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint formulas_daily_report.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'formulas_daily_report endpoint executed successfully'
			})
		}
	})
})

router.get('/formulas', function (req, res) {
	formulas.formulas_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint formulas.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'formulas endpoint executed successfully'
			})
		}
	})
})

router.post('/formulas', function (req, res) {
	formulas.formulas_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint formulas.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'formulas endpoint executed successfully'
			})
		}
	})
})

router.delete('/formulas', function (req, res) {
	formulas.formulas_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint formulas.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'formulas endpoint executed successfully'
			})
		}
	})
})

router.get('/plants', function (req, res) {
	plants.plants_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint plants.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'plants endpoint executed successfully'
			})
		}
	})
})

router.get('/raw_materials', function (req, res) {
	raw_materials.raw_materials_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint raw_materials.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'raw_materials endpoint executed successfully'
			})
		}
	})
})

router.post('/PODetails', function (req, res) {
	PODetails.PODetails_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint PODetails.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'PODetails endpoint executed successfully'
			})
		}
	})
})

router.post('/PODetailsList', function (req, res) {
	PODetails.PODetails_list_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint PODetailsList.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'PODetailsList endpoint executed successfully'
			})
		}
	})
})

router.get('/material_stock', function (req, res) {
	material_stock.material_stock_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint material_stock.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'material_stock endpoint executed successfully'
			})
		}
	})
})

router.get('/material_sap_stock', function (req, res) {
	material_stock.material_stock_sap_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint material_sap_stock.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'material_sap_stock endpoint executed successfully'
			})
		}
	})
})

router.get('/roles', function (req, res) {
	roles.roles_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint roles.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'roles endpoint executed successfully'
			})
		}
	})
})

router.get('/privileges', function (req, res) {
	privileges.privileges_get_func(req, res, function (err, data) {
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

router.post('/roles', function (req, res) {
	roles.roles_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint roles.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'roles endpoint executed successfully'
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

router.post('/create_user', function (req, res) {
	users.create_user_func(req, res, function (err, data) {
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

router.get('/users', function (req, res) {
	users.users_get_func(req, res, function (err, data) {
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

router.put('/users', function (req, res) {
	users.users_update_func(req, res, function (err, data) {
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

router.delete('/users', function (req, res) {
	users.users_delete_func(req, res, function (err, data) {
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

router.put('/roles', function (req, res) {
	roles.roles_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint roles.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'roles endpoint executed successfully'
			})
		}
	})
})

router.delete('/roles', function (req, res) {
	roles.roles_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint roles.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'roles endpoint executed successfully'
			})
		}
	})
})

router.get('/compounds', function (req, res) {
	compounds.compounds_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint compounds.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'compounds endpoint executed successfully'
			})
		}
	})
})

router.post('/compounds', function (req, res) {
	compounds.compounds_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint compounds.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'compounds endpoint executed successfully'
			})
		}
	})
})

router.put('/compounds', function (req, res) {
	compounds.compounds_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint compounds.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'compounds endpoint executed successfully'
			})
		}
	})
})

router.delete('/compounds', function (req, res) {
	compounds.compounds_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint compounds.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'compounds endpoint executed successfully'
			})
		}
	})
})

router.get('/plant_types', function (req, res) {
	plant_types.plant_types_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint plant_types.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'plant_types endpoint executed successfully'
			})
		}
	})
})

router.post('/plant_types', function (req, res) {
	plant_types.plant_types_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint plant_types.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'plant_types endpoint executed successfully'
			})
		}
	})
})

router.put('/plant_types', function (req, res) {
	plant_types.plant_types_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint plant_types.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'plant_types endpoint executed successfully'
			})
		}
	})
})

router.delete('/plant_types', function (req, res) {
	plant_types.plant_types_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint plant_types.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'plant_types endpoint executed successfully'
			})
		}
	})
})

router.get('/cptp_groups', function (req, res) {
	cptp_groups.cptp_groups_get_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cptp_groups.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cptp_groups endpoint executed successfully'
			})
		}
	})
})

router.post('/cptp_groups', function (req, res) {
	cptp_groups.cptp_groups_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cptp_groups.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cptp_groups endpoint executed successfully'
			})
		}
	})
})

router.put('/cptp_groups', function (req, res) {
	cptp_groups.cptp_groups_put_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cptp_groups.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cptp_groups endpoint executed successfully'
			})
		}
	})
})

router.delete('/cptp_groups', function (req, res) {
	cptp_groups.cptp_groups_delete_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint cptp_groups.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'cptp_groups endpoint executed successfully'
			})
		}
	})
})

router.post('/stock_based_on_plant', function (req, res) {
	stock_based_on_plant.stock_based_on_plant_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint stock_based_on_plant.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'stock_based_on_plant endpoint executed successfully'
			})
		}
	})
})

router.get('/stock_based_on_rm', function (req, res) {
	stock_based_on_rm.stock_based_on_rm_post_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint stock_based_on_rm.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'stock_based_on_rm endpoint executed successfully'
			})
		}
	})
})

router.post('/batch_data', function (req, res) {
	batch_data.batch_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint batch_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'batch_data endpoint executed successfully'
			})
		}
	})
})

router.post('/packing_data', function (req, res) {
	packing_data.packing_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint batch_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'batch_data endpoint executed successfully'
			})
		}
	})
})

router.post('/TITO_data', function (req, res) {
	TITO_data.TITO_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint TITO_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'TITO_data endpoint executed successfully'
			})
		}
	})
})

router.post('/energy_power_data', function (req, res) {
	energy_power_data.energy_power_data_func(req, res, function (err, data) {
		if (err) {
			res.json({
				'success': false,
				'message': 'Error with endpoint energy_power_data.. !'
			})
		} else {
			res.json({
				'success': true,
				'message': 'energy_power_data endpoint executed successfully'
			})
		}
	})
})

module.exports = router