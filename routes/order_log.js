var express = require('express');
var router = express.Router();

var logDAO = require('../model/airpuriDAO.js');

var async= require('async');
var admin = require("firebase-admin");

var Iamport = require('iamport');

var iamport = new Iamport({
	impKey: '6683913542960635',
	impSecret: 'YTlqLzbpcZN6b6CAmAbrdzXwTt4cSsjRlEh6dtwpsjwEq9eNKpeYZbvTFA5y2opn2Huga0GDkdhKmvx7'});


var reqImportInform = function(index,impArr, callback){
	iamport.payment.getByImpUid({
		  imp_uid: impArr[index]['imp_uid']  
		}).then(function(result){
			impArr[index]['amount'] = result['amount'];
			impArr[index]['name'] = result['name'];
			impArr[index]['paid_at'] = result['paid_at'];
			callback(null,null);
		}).catch(function(error){
		  callback('err' , null);
		});
}


router.get('/', function(req, res, next) {
	admin.auth().verifyIdToken(req.query['token']).then(function(decodedToken){
		async.waterfall([function(callback){
			logDAO.getImpUidByUid(decodedToken.uid,callback);
		},function(args1, callback){
			var importInform = args1;
			async.times(args1.length , function(index,next){
				reqImportInform(index, importInform, function(err, result){
					next(err, result);
				});
			},function(err , subresults){
				if(err){
					callback('err', null)
				} else{	
					callback(null,importInform);
				}
			});
		}], function(err, results){
			if(err){
				res.redirect('/error');
			} else{
				res.render('cart',{result : results});
			}
		});
	}).catch(function(err){
		res.redirect('/error');
	});
});

router.get('/anony_cart', function(req, res, next) {
	async.waterfall([function(callback){
		logDAO.getAnonyImpUid(req.query['email'],req.query['pw'],callback);
	},function(args1, callback){
		iamport.payment.getByImpUid({
			  imp_uid: args1[0]['imp_uid']  
			}).then(function(result){
				callback(null,[{amount:result['amount'],name:result['name'],paid_at:result['paid_at']}]);
			}).catch(function(error){
			  callback('err' , null);
			});
	}], function(err, results){
		if(err){
			res.redirect('/error');
		} else{
			res.render('cart',{result : results});
		}
	});
});

module.exports = router;