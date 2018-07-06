var base = require('./airpuri_baseDAO.js');
var mysql = require('mysql');

exports.insertOrder = function(inform,callback){
	var sqlQuery = 'insert into order_log set ?'
	base.insert(sqlQuery , inform, callback);
}

exports.getAnonyImpUid = function(email, pw, callback){
	var sqlQuery = 'select imp_uid from order_log WHERE uid='+ mysql.escape(email) + ' AND anony_pw=' + mysql.escape(pw)+' ORDER BY `oid` DESC;';
	base.select(sqlQuery, callback);
}

exports.getImpUidByUid = function(uid,callback){
	var sqlQuery = 'select imp_uid from order_log WHERE uid='+ mysql.escape(uid)+' ORDER BY `oid` DESC;';
	base.select(sqlQuery, callback);
}