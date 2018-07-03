var base = require('./airpuri_baseDAO.js');
var mysql = require('mysql');

exports.insertSerial = function(uid, sn, callback){
	var inform = {user_id : uid, serial:sn}
	var sqlQuery = 'insert into serial_number_table set ?'
	base.insert(sqlQuery , inform, callback);
}