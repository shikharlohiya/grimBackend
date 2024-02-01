var express = require('express'),
    path = '../../models/sync/v2/',
    router = express.Router(),
    materialItems = require(`${path}materialItems.js`),
    material_group = require(`${path}material_group.js`),
    material_type = require(`${path}material_type.js`),
    plants = require(`${path}plants.js`),
    material_stock = require(`${path}material_stock.js`),
    material_stock_price_update = require(`${path}material_stock_price_update.js`),
    wbs_number = require(`${path}wbs_number.js`),
    assets = require(`${path}assets.js`),
    purchase_group = require(`${path}purchase_group.js`),
    indent_data = require(`${path}indent_data.js`),
    material_request = require(`${path}material_request.js`),
    receive_data = require(`${path}receive_data.js`),
    pr_data = require(`${path}pr_data.js`),
    material_sync = require(`${path}material_sync.js`),
    material_group_sync = require(`${path}material_group_sync.js`),
    material_type_sync = require(`${path}material_type_sync.js`),
    plants_sync = require(`${path}plants_sync.js`),
    wbs_numbers_sync = require(`${path}wbs_numbers.js`),
    purchase_group_sync = require(`${path}purchase_group_sync.js`),
    batch_id_sync = require(`${path}batch_id_sync.js`),
    serial_number_sync = require(`${path}serial_number_sync.js`),
    serial_numbers = require(`${path}serial_numbers.js`),
    batch_ids = require(`${path}batch_ids.js`),
    material_stock_org = require(`${path}material_stock_org.js`),
    cost_center = require(`${path}cost_center.js`)


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


router.get('/materialItems', function (req, res) {
    materialItems.materialItems_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint materialItems.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'materialItems endpoint executed successfully'
            })
        }
    })
})

router.get('/material_group', function (req, res) {
    material_group.material_group_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_group.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_group endpoint executed successfully'
            })
        }
    })
})

router.get('/plants', function (req, res) {
    plants.plants_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint plants. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'plants endpoint executed successfully'
            })
        }
    })
})

router.get('/material_type', function (req, res) {
    material_type.material_type_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_type.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_type endpoint executed successfully'
            })
        }
    })
})

router.get('/purchase_group', function (req, res) {
    purchase_group.purchase_group_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint purchase_group.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'purchase_group endpoint executed successfully'
            })
        }
    })
})

router.get('/material_stock', function (req, res) {
    material_stock.material_stock_func(req, res, function (err, data) {
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

router.put('/material_stock_price_update', function (req, res) {
    material_stock_price_update.material_stock_price_update_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_stock_price_update.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_stock_price_update endpoint executed successfully'
            })
        }
    })
})

router.get('/wbs_number', function (req, res) {
    wbs_number.wbs_number_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint wbs_number.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'wbs_number endpoint executed successfully'
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


router.post('/indent_data', function (req, res) {
    indent_data.indent_data_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint indent_data.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'indent_data endpoint executed successfully'
            });
        }
    });
});

router.post('/material_request', function (req, res) {
    material_request.material_request_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_request.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'material_request endpoint executed successfully'
            });
        }
    });
});

router.post('/receive_data', function (req, res) {
    receive_data.receive_data_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint receive_data.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'receive_data endpoint executed successfully'
            });
        }
    });
});

router.post('/pr_data', function (req, res) {
    pr_data.pr_data_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint pr_data.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'pr_data endpoint executed successfully'
            });
        }
    });
});

router.post('/material_sync', function (req, res) {
    material_sync.material_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_sync endpoint executed successfully'
            })
        }
    })
});

router.post('/material_group_sync', function (req, res) {
    material_group_sync.material_group_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_group_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_group_sync endpoint executed successfully'
            })
        }
    })
});


router.post('/material_type_sync', function (req, res) {
    material_type_sync.material_type_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_type_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_type_sync endpoint executed successfully'
            })
        }
    })
});

router.post('/plants_sync', function (req, res) {
    plants_sync.plants_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint plants_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'plants_sync endpoint executed successfully'
            })
        }
    })
});

router.post('/wbs_numbers_sync', function (req, res) {
    wbs_numbers_sync.wbs_numbers_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint wbs_numbers_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'wbs_numbers_sync endpoint executed successfully'
            })
        }
    })
});

router.post('/purchase_group_sync', function (req, res) {
    purchase_group_sync.purchase_group_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint purchase_group_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'purchase_group_sync endpoint executed successfully'
            })
        }
    })
});

router.put('/batch_id_sync', function (req, res) {
    batch_id_sync.batch_id_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint batch_id_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'batch_id_sync endpoint executed successfully'
            })
        }
    })
})

router.put('/serial_number_sync', function (req, res) {
    serial_number_sync.serial_number_sync_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint serial_number_sync.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'serial_number_sync endpoint executed successfully'
            })
        }
    })
})

router.get('/serial_numbers', function (req, res) {
    serial_numbers.serial_numbers_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint serial_numbers.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'serial_numbers endpoint executed successfully'
            })
        }
    })
})

router.get('/batch_ids', function (req, res) {
    batch_ids.batch_ids_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint batch_ids.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'batch_ids endpoint executed successfully'
            })
        }
    })
})

router.get('/material_stock_org', function (req, res) {
    material_stock_org.material_stock_org_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_stock_org.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'material_stock_org endpoint executed successfully'
            })
        }
    })
})

router.get('/cost_centers', function (req, res) {
    cost_center.cost_center_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint cost_center.. !'
            })
        } else {
            res.json({
                'success': true,
                'message': 'cost_center endpoint executed successfully'
            })
        }
    })
})
module.exports = router