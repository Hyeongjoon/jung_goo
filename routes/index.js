var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");
var orderDAO = require('../model/airpuriDAO')

var async= require('async');

const request = require('request-promise');

const requestMeUrl = 'https://kapi.kakao.com/v1/user/me?secure_resource=true';

var Iamport = require('iamport');

var iamport = new Iamport({
	impKey: '6683913542960635',
	impSecret: 'YTlqLzbpcZN6b6CAmAbrdzXwTt4cSsjRlEh6dtwpsjwEq9eNKpeYZbvTFA5y2opn2Huga0GDkdhKmvx7'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index-airpuri', {});
});

router.get('/contact', function(req, res, next){
	res.render('contact', {});
});

router.post('/sign-up' , function(req, res, next){
	if(req.body.pw_confirm==req.body.pw){
	    admin.auth().createUser({
	    	  email: req.body.email,
	    	  password: req.body.pw,
	    	  displayName: req.body.nickname,
	    	  disabled: false
	    	}).then(function(userRecord) {
	    	    // See the UserRecord reference doc for the contents of userRecord.
	    	    res.json({result : 'success'});
	    	  })
	    	  .catch(function(error) {
	    		  if(error['errorInfo']['code']=='auth/email-already-exists'){
	    			  res.json({result : 'duplicate'});
	    		  } else{
	    			  res.status(500).json({});  
	    		  }
	    	  });
	} else{
		res.status(403).json({});
	}
});

router.get('/use' , function(req, res, next){
	res.render('use', {});
});

router.get('/buy' , function(req, res, next){
	res.render('buy', {});
})

router.get('/individual' , function(req, res, next){
	res.render('individual', {});
});

router.get('/auth', function(req,res,next){
	res.render('naverLoginRedirect', {});
})

router.post('/naver_login', function(req, res, next){
	const userId=`naver:${req.body.id}`;
	return naverUpdateOrCreateUser(userId,req.body['email']).then((userRecord)=>{
		if(userRecord == 'email-already-exists'){
    		res.json({result:'duplicate'})
    	} else{
    		admin.auth().createCustomToken(userRecord.uid, {provider: 'NAVER'}).then(function(token){
    			res.json({result:'success' , token : token});
    		}).catch(function(error){
    			res.status(500).json({message: '내부 서버 오류입니다.'});
    		});
    	}
	}).catch(function(err){
		res.status(500).json({message: '내부 서버 오류입니다.'});
	});
});

router.post('/kakao_login' , function(req, res, next){
	requestMyInfo(req.body.access_token).then((response) => {
		    const body = JSON.parse(response)
		    const userId = `kakao:${body.id}`;
		    if (!userId) {
		        res.status(404).json({message: 'There was no user with the given access token.'});
		      }
		    var displayName = null;
		    var profile_image = null;
		    if (body.properties) {
		    	displayName  = body.properties.nickname;
		    	profile_image = body.properties.profile_image;
		      }
		    return updateOrCreateUser(userId, body.kaccount_email, displayName  , profile_image);
		    }).then((userRecord)=> {
		    	if(userRecord == 'email-already-exists'){
		    		res.json({result:'duplicate'})
		    	} else{
		    		admin.auth().createCustomToken(userRecord.uid, {provider: 'KAKAO'}).then(function(token){
		    			res.json({result:'success' , token : token});
		    		}).catch(function(error){
		    			res.status(500).json({message: '내부 서버 오류입니다.'});
		    		});
		    	}
		    })
});
//네이버 아이디로 firebase 등록하기
function naverUpdateOrCreateUser(userId, email) {
	  var updateParams = {
	    provider: 'NAVER',
	    displayName: email.substring(0,email.lastIndexOf('@'))
	  };
	  return admin.auth().updateUser(userId, updateParams)
	  .catch((error) => {
	    if (error.code === 'auth/user-not-found') {
	      updateParams['uid'] = userId;
	      if (email) {
	        updateParams['email'] = email;
	      }
	      return admin.auth().createUser(updateParams).catch((error)=>{
	    	  if(error.code==='auth/email-already-exists'){
	    		  return 'email-already-exists';
	    	  }
	    	  throw error;
	      });
	    }
	    throw error;
	  });
	};



//카카오 서버에 내 정보 요청하기
function requestMyInfo(kakaoToken) {
	  return request({
	    method: 'GET',
	    headers: {'Authorization': 'Bearer ' + kakaoToken},
	    url: requestMeUrl,
	  });
	};
	function updateOrCreateUser(userId, email, displayName, photoURL) {
		  var updateParams = {
		    provider: 'KAKAO',
		    displayName: displayName,
		    emailVerified: true
		  };
		  if (displayName) {
		    updateParams['displayName'] = displayName;
		  } else {
		    updateParams['displayName'] = email;
		  }
		  if (photoURL) {
		    updateParams['photoURL'] = photoURL;
		  }
		  return admin.auth().updateUser(userId, updateParams)
		  .catch((error) => {
		    if (error.code === 'auth/user-not-found') {
		      updateParams['uid'] = userId;
		      if (email) {
		        updateParams['email'] = email;
		      }
		      return admin.auth().createUser(updateParams).catch((error)=>{
		    	  if(error.code==='auth/email-already-exists'){
		    		  return 'email-already-exists';
		    	  }
		    	  throw error;
		      });
		    }
		    throw error;
		  });
		};
		
router.get('/pay-success', function(req, res, next){
	if(req.query['imp_success']=='false'){
		res.redirect('/fail');
	} else{
		iamport.payment.getByImpUid({
			  imp_uid: req.query['imp_uid']  
			}).then(function(result){
				if((result['status']=='paid')&&(result['amount']==req.query['amount'])){
					//결제 된 상태일 경우
					async.waterfall([function(callback){
						var custom_data = JSON.parse(result['custom_data']);
						var inform = {
								uid:'',
								imp_uid:req.query['imp_uid'],
								merchant_uid:result['merchant_uid'],
								anony_pw:custom_data['pw']
						}
						if(custom_data['token']==''){
							inform['uid']=result['buyer_email'];
							orderDAO.insertOrder(inform , callback);
						} else{
							admin.auth().verifyIdToken(custom_data['token']).then(function(decodedToken){
								inform['uid']=decodedToken.uid;
								orderDAO.insertOrder(inform , callback);
							});
						}
					}] , function(err, results){
						if(err){
							//원래는 취소 날려야함
							res.redirect('/fail');
						} else{
							res.redirect('/success');
						}
					});
				} else {
					//결제상태가 아닐 경우
					res.redirect('/order/fail');
				}
			});
	}
});

router.post('/check_pay' , function(req, res, next){
	iamport.payment.getByImpUid({
		  imp_uid: req.body['imp_uid']  
		}).then(function(result){
			if((result['status']=='paid')&&(result['amount']==result['custom_data']['car_price'])){
				
			} else if(result['cancelled']){
				//취소했을때 코드시켜놓을 것
			} 
		}).catch(function(error){
		  // handle error
		});
});
		
router.get('/fail',function(req,res,next){
	res.render('order-fail',{});
});

router.get('/cancle',function(req,res,next){
	res.render('order-cancle',{});
});

router.get('/success', function(req, res, next){
	res.render('order-success' , {});
});
	
module.exports = router;