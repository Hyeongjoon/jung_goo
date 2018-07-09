var base = require('./airpuri_baseDAO.js');
var mysql = require('mysql');

exports.insertBoard = function(inform , callback){
	var sqlQuery = 'insert into board set ?'
	base.insert(sqlQuery , inform, callback);
}

exports.findBoard = function(keyword, option, callback){
	var sqlQuery = 'select `phone`,`email`, `bid`,`reg_date` FROM board WHERE ';
	if(option=='0'){
		sqlQuery +='email='
	} else{
		sqlQuery +='phone='
	}
	sqlQuery = sqlQuery + mysql.escape(keyword) +' ORDER BY `reg_date` DESC'
	base.select(sqlQuery ,callback);
}

exports.findContent = function(bid, callback){
	var sqlQuery = 'select `content` from board WHERE bid = '+ mysql.escape(bid);
	base.select(sqlQuery, callback);
}