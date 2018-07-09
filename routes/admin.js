var express = require('express');
var router = express.Router();

var config = require('../helper/config2');
var async = require('async');

var boardDAO = require('../model/boardDAO');
var logDAO = require('../model/airpuriDAO');

var admin = require("firebase-admin");

var Iamport = require('iamport');

var iamport = new Iamport({
	impKey: '6683913542960635',
	impSecret: 'YTlqLzbpcZN6b6CAmAbrdzXwTt4cSsjRlEh6dtwpsjwEq9eNKpeYZbvTFA5y2opn2Huga0GDkdhKmvx7'});


var reqImportInform = function(index,impArr, callback){
	iamport.payment.getByImpUid({
		  imp_uid: impArr[index]['imp_uid']  
		}).then(function(result){
			var custom = JSON.parse(result['custom_data']);
			impArr[index]['amount'] = result['amount'];
			impArr[index]['name'] = result['name'];
			impArr[index]['paid_at'] = result['paid_at'];
			impArr[index]['addr'] = result['buyer_addr'];
			impArr[index]['receiver'] = custom['receiver_name'];
			impArr[index]['receiver_phone'] = custom['receiver_phone'];
			impArr[index]['request'] = custom['request'];
			callback(null,null);
		}).catch(function(error){
		  callback('err' , null);
		});
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin-login', {});
});

router.get('/login' , function(req, res, next){
	admin.auth().verifyIdToken(req.query['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			res.render('admin-main.ejs' , {})
		}else{
			res.redirect('/error');
		};
	}).catch(function(err){
		res.redirect('/error');
	});
});

router.post('/save_board', function(req,res,next){
	admin.auth().verifyIdToken(req.body['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			async.parallel([function(callback){
				var inform = {email : req.body['email'], phone : req.body['phone'], content:req.body['content']}
				boardDAO.insertBoard(inform, callback);
			}] , function(err, results){
				if(err){
					res.status(500).json({});
				} else{
					res.json({});
				}
			});
		}else{
			res.status(500).json({});
		};
	}).catch(function(err){
		res.status(500).json({});
	});
});

router.post('/search' , function(req, res, next){
	admin.auth().verifyIdToken(req.body['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			async.parallel([function(callback){
				boardDAO.findBoard(req.body['content'], req.body['option'], callback);
			}] , function(err, results){
				if(err){
					res.status(500).json({});
				} else{
					
					res.json({result : results[0]});
				}
			});
		}else{
			res.status(500).json({});
		};
	}).catch(function(err){
		res.status(500).json({});
	});
});

router.get('/find_board', function(req, res, next){
	admin.auth().verifyIdToken(req.query['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			async.parallel([function(callback){
				boardDAO.findContent(req.query['bid'],callback);
			}] , function(err, results){
				if(err){
					res.redirect('/error');
				} else{
					res.render('blank' , {content : results[0][0]['content']});
				}
			});
		}else{
			res.redirect('/error');
		};
	}).catch(function(err){
		res.redirect('/error');
	});
});

router.get('/paid_list' , function(req, res, next){
	admin.auth().verifyIdToken(req.query['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			async.waterfall([function(callback){
				logDAO.getImpUid(callback);
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
					res.render('admin-paid-list',{data : results})
				}
			});
		}else{
			res.redirect('/error');
		};
	}).catch(function(err){
		res.redirect('/error');
	});
});

router.post('/delivery', function(req, res, next){
	admin.auth().verifyIdToken(req.body['token']).then(function(decodedToken){
		if(decodedToken['email']==config.adminInform['email']){
			async.parallel([function(callback){
				logDAO.changeDelivery(req.body['oid'],callback);
			}], function(err, results){
				if(err){
					res.status(500).json({});
				} else{
					res.json({});
				}
			});
		}else{
			res.status(500).json({});
		};
	}).catch(function(err){
		res.status(500).json({});
	});
});

module.exports = router;
