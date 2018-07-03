var email = require('nodemailer');

var emailConfig = {
		
		};

    // create reusable transporter object using the default SMTP transport
    let emailTransport = email.createTransport({
    	host : 'smtp.gmail.com' ,
		port :465,
		secure : true,
		auth : {
				user : 'sendwitchdev@gmail.com',
				pass : '7557523m'
			}
    });

var mailOption = {
		from : '',
		to : '3sh0402@gmail.com',
		subject : '',
		html : ''
}


exports.makeEmail = function(inform , callback){
	mailOption.from = '"' + inform.name;
	mailOption.subject = '[AirPuri] ' +inform.subject;
	mailOption.html = inform.content + '<br \><br \> - '+ inform.name+ '님 '+ inform.email+'에서 온 메일';
	emailTransport.sendMail(mailOption , function(err , info){
		if(err){
			console.log(err)
			callback(err , null);
		} else{
			callback(null , true);
		}
	});
}