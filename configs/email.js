var nodemailer = require('nodemailer');


function send_email(email1,link,callback)
{
  
	var transporter = nodemailer.createTransport({
  		service: 'gmail',
  		auth: {
   			 user: 'zendesktest16@gmail.com',
    			pass: 'P@ssw0rd@1234'
  		      }
	});

	var mailOptions = {
  		from: 'zendesktest16@gmail.com',
  		to: email1,
  		subject: 'Reset Password',
  		text: 'open the link in the same browser as the application as the link runs on localhost '+link 
	};

	transporter.sendMail(mailOptions, function(error, info){
  	if (error) {
    		console.log(error);
  	} else {
   		 console.log('Email sent: ' + info.response);
  	}
	});
}

module.exports = {send_email};
