var email_validator = require("email-validator");
const { passwordStrength } = require('check-password-strength');

var comment;

function verify(email,pass,conpass){

	if (email_validator.validate(email)==false)
	{
		
		comment="Email Format not correct";	
	}	
	//console.log(passwordStrength(pass).value);
	else{

		if (passwordStrength(pass).value!="Strong")
		{
			comment="Use a strong password";
		}
		else{
			if (pass!==conpass)
			{
        	          comment="Password does not match";
			}
			else{
			  comment=""	
			}	
		    }
	}
	//if (pass!==conpass){
	//	comment="Password does not match";
	//}
	return comment;

}

function verify_email(email){
        if (email_validator.validate(email)==false)
        {

                comment="Email Format not correct";     
        }       
        return comment;
}

function verify_pass_strength(pass,conpass){

	if (passwordStrength(pass).value!="Strong")
                {
                        comment="Use a strong password";
                }
                else{
                        if (pass!==conpass)
                        {
                          comment="Password does not match";
                        }
                        else{
                          comment=""    
                        }       
                    }

	return comment
}

module.exports={verify,verify_email,verify_pass_strength};
