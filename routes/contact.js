var express = require('express');
var router = express.Router();
var emailHelper = require('../helper/air_mail');
var async = require('async');
var admin = require("firebase-admin");
var serialDAO = require('../model/serialNumberDAO');
 
router.get('/', function(req, res, next){
	res.render('contact', {});
});

router.post('/send_mail' , function(req, res, next){
	async.parallel([function(callback){
		emailHelper.makeEmail(req.body, callback);
	}] , function(err , result){
		if(err){
			res.status(500).json({result : false})
		}else{
			res.json({result : true})
		}
	});
});

router.post('/reg_sn', function(req, res, next){
	admin.auth().verifyIdToken(req.body['token']).then(function(decodedToken){
		async.parallel([function(callback){
			serialDAO.insertSerial(decodedToken.uid, req.body['sn'], callback);
		}],function(err, results){
			if(err){
				if(err['code']==='ER_DUP_ENTRY'){
					res.status(500).json({message:'duplicate'});
				} else{
					res.status(500).json({});
				}
			} else{
				res.json({});
			}
		});
	}).catch(function(error){
		res.status(500).json();
	});
});

module.exports = router;