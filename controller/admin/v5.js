// Import required modules
var express = require('express'),
    path = '../../models/admin/v4/',
    router = express.Router(),
    users = require(`${path}users.js`),
    dashboard = require(`${path}dashboard.js`),
    indent_report = require(`${path}indent_report.js`),
    material_report = require(`${path}material_report.js`),
    user_report = require(`${path}user_report.js`),
    pr_report = require(`${path}pr_report.js`),
    cost_report = require(`${path}cost_report.js`);

var jwt = require('jsonwebtoken');
var multer = require('multer');
var da = new Date();

// Middleware to ensure the presence of a token in the request header
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

// Configure multer storage for file uploads
var time = ("0" + (da.getDate())).slice(-2) + ("0" + (da.getMonth() + 1)).slice(-2) + da.getFullYear() + ("0" + (da.getHours())).slice(-2) + ("0" + (da.getMinutes())).slice(-2) + ("0" + (da.getSeconds())).slice(-2) + ("0" + (da.getMilliseconds())).slice(-2);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '' + __dirname + '/temp/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, "" + time + "");
    }
});

var upload = multer({
    storage: storage
});

// Define routes with improved structure and comments
router.post('/get_users', function (req, res) {
    users.users_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint Users.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'Users endpoint executed successfully'
            });
        }
    });
});

router.delete('/users', function (req, res) {
    users.users_delete_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint Users.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'Users endpoint executed successfully'
            });
        }
    });
});

router.put('/users', function (req, res) {
    users.users_update_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint Users.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'Users endpoint executed successfully'
            });
        }
    });
});

router.post('/dashboard', function (req, res) {
    dashboard.dashboard_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint Dashboard.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'Dashboard endpoint executed successfully'
            });
        }
    });
});

router.post('/indent_report', function (req, res) {
    indent_report.indent_report_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint indent_report.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'indent_report endpoint executed successfully'
            });
        }
    });
});

router.post('/material_report', function (req, res) {
    material_report.material_report_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint material_report.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'material_report endpoint executed successfully'
            });
        }
    });
});

router.post('/user_report', function (req, res) {
    user_report.user_report_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint user_report.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'user_report endpoint executed successfully'
            });
        }
    });
});

router.post('/pr_report', function (req, res) {
    pr_report.pr_report_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint pr_report.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'pr_report endpoint executed successfully'
            });
        }
    });
});

router.post('/cost_report', function (req, res) {
    cost_report.cost_report_func(req, res, function (err, data) {
        if (err) {
            res.json({
                'success': false,
                'message': 'Error with endpoint cost_report.. !'
            });
        } else {
            res.json({
                'success': true,
                'message': 'cost_report endpoint executed successfully'
            });
        }
    });
});

// Export the router
module.exports = router;
