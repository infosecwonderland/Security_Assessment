
const express = require("express")
const app= express()
const db=require("./configs/connectDB");
const hash=require("./configs/hash_pass")
const helmet = require('helmet');
const checks=require("./configs/verification");
const bcrypt=require("bcrypt");
const sessions=require("express-session");
const router = express.Router();
const email_trig=require("./configs/email")
var async = require('async');
var crypto = require('crypto');
var encryptedpass;
var encryptcheck;
var new_encrypt;
var fs = require('fs'); // to read data from a file
var https = require('https'); //enable https
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8'); //reading the value of private key value
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8'); 
var credentials = {key: privateKey, cert: certificate}; //type of storage for dictionary
var httpsServer = https.createServer(credentials, app);
var cookieParser = require('cookie-parser')
var csrf = require('csurf') //csrf protection implementation
var bodyParser = require('body-parser') //process data sent through an HTTP request body
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })
var comment;
var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store,{freeRetries: 1000,
    minWait: 1*60*1000, // 5 minutes
    maxWait: 60*60*1000, // 1 hour,
});

const oneDay = 30*60*1000;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay,secure: true },	
    httpOnly: true,
    resave: false,
   // ephemeral: true,
    name:"SessionId"
}));


app.use(cookieParser())

app.use(helmet()); //configuring HTTP Headers

let setCache = function (req, res, next) {
  // here you can define period in second, this one is 5 minutes
  const period = 60 * 5 

  // you only want to cache for GET requests
  if (req.method == 'GET') {
    res.set('Cache-control', `no-store`)
  } else {
    // for the other requests set strict no caching parameters
    res.set('Cache-control', `no-store`)
  }

  // remember to call next() to pass on the request
  next()
}

// now call the new middleware function in your app

app.use(setCache)





function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

require("./configs/connectDB"); //connect to db
app.set('view-engine','ejs') //to render html content from views folder
app.use(express.urlencoded({ extended: false}))




app.get('/',bruteforce.prevent,function(req,res){

	
	res.render('index.ejs', {name: 'Secure Application'})

});


app.get('/login',bruteforce.prevent,csrfProtection,(req,res)=>{ //get endpoint to reach to login page
        res.render('login.ejs',{name:"",csrfToken: req.csrfToken()})
})


app.post('/login',bruteforce.prevent,parseForm,csrfProtection,(req,res)=>{ //post login
	var email=req.body.email;
	var password=req.body.password; //check for valid email format

	comment=checks.verify(email,password,password)
	console.log(comment);

	if (comment==''){
                	db.connection.query('SELECT * FROM users WHERE email = ?',[email], function(error,results){
				console.log(results)
		    		if (results.length > 0){
		       			console.log(password,results[0].password);	
                       			bcrypt.compare(password,results[0].password,function(err,result){
					console.log(result);
		  			if(result==true){
                                            		
							req.session.regenerate(function(err) {
                                                                console.log("Authenticated")
 						         	req.session.user_id=results[0].password
								app.get('/home',csrfProtection,checkAuth,(req,res)=>{ //get endpoint to reach to home page after login
	                                       				res.render('home.ejs',{csrfToken: req.csrfToken()})
	                                			})
								res.redirect('/home');
							})
					}

					else{
	  					res.render('login.ejs',{name:"Incorrect Username and Password",csrfToken: req.csrfToken()})
			        	}

					});
		    		}

		   		 else{
			 		res.render('login.ejs',{name:"Incorrect Username and Password",csrfToken: req.csrfToken()})
	           		}


			});
        }		
	else{

		//console.log(comment)  
              res.render('login.ejs',{name:comment,csrfToken: req.csrfToken()});

          }
});

app.get('/register',bruteforce.prevent,csrfProtection,(req,res)=>{
        res.render('register.ejs',{name:'',csrfToken: req.csrfToken()})  //get  endpoint to reach to register page
})

app.post('/register',bruteforce.prevent,parseForm,csrfProtection,(request,res)=>{


	comment=checks.verify(request.body.email,request.body.password,request.body.confirmpassword)		
	console.log(comment)	

	if (comment==''){	
	 	db.check_email(request.body.email,function(err,data){ //check if email exists in the database, if it does then just render the page

			if (err) {
				console.log("ERROR : ",err); 
			}else {
            			console.log("result from db is : ",data);   
				if (data!=undefined){
					console.log("user present in the database,hence not registered") //email id is present in the db
				}
				else{
					hash.hash(request.body.password).then(encryptedpass => { db.register_data(request.body.email,encryptedpass);});
					//res.render('register.ejs',{name:'user registered',csrfToken: request.csrfToken()});	
				}
			
        		}
 
		});

	res.render('register.ejs',{name:'user registered',csrfToken: request.csrfToken()}); 
     	}
	else{
		res.render('register.ejs',{name:comment,csrfToken: request.csrfToken()});

	}


	//res.render('register.ejs',{name:'user registered',csrfToken: request.csrfToken()}); 
})

app.get('/forgot-password',bruteforce.prevent,csrfProtection,(req,res)=>{
        res.render('forgot-password.ejs',{name:'',csrfToken: req.csrfToken()})  //get  endpoint to reach to forgot password page
})

app.post("/forgot-password",bruteforce.prevent,csrfProtection,(req,res)=>{
	var email=req.body.email;

        check_format=checks.verify_email(email)
	console.log(check_format);

	db.check_email(email,function(err,data){ //check if email exists in the database, if it does then just render the page
	
                        if (err) {
                                console.log("ERROR : ",err); 
                        }else {
                                console.log("result from db is : ",data);   
                                if (data!=undefined){

                                        console.log("email id present in the database") //email id is present in the db
					async.waterfall([
				              function(done) {
                  					crypto.randomBytes(20, function(err, buf) {
                    						var token = buf.toString('hex');
                    						done(err, token);
        //            console.log(token);
                    						var st_time= new Date(); 
								const link=`https://127.0.0.1/reset?reset=${token}`
                                                                email_trig.send_email(email,link)	
								db.token_set(email,token,st_time.getTime(),function(err,data){
									
								})
							});
						}				
					]);



				}	
                                else{
					console.log("email not present")
                                }

                        }
 
                });

	res.render('forgot-password.ejs',{name:'You will receive the reset token if you are registered with us',csrfToken: req.csrfToken()})
});



app.get("/reset",bruteforce.prevent,csrfProtection,(req,res)=>{

	let token = req.query.reset;
	db.get_token(token,function(err,data,fields){
		console.log(data.length)		
  		if((data!=undefined)&&(data.length!=0)){        
			var new_date=new Date();	
	                console.log(new_date.getTime(),data[0].time)
			console.log(token)
			var time_diff=new_date.getTime()-data[0].time
			time_diff /= 1000;
                        console.log(time_diff)	
			var seconds = Math.round(time_diff);
  			console.log(seconds + " seconds");
			if (seconds > 1800){
			   res.render('forgot-password.ejs',{name:'token not valid',csrfToken: req.csrfToken()})
			}
			else{

				res.render('reset.ejs',{name:'reset your password',csrfToken: req.csrfToken(),token:data[0].reset_pass})

			}
  		}
 		else{
			res.send("token not valid")	
		}


  	})
});


app.post("/reset",bruteforce.prevent,csrfProtection,(req,res)=>{

	        let token = req.body.token;

	        db.get_token(token,function(err,data,fields){
		
                console.log(token,data)
                if((data!=undefined)&&(data.length!=0)){        
                        var new_date=new Date();        
                        console.log(new_date.getTime(),data[0].time)
                        console.log(token)
                        var time_diff=new_date.getTime()-data[0].time
                        time_diff /= 1000;
                        console.log(time_diff)  
                        var seconds = Math.round(time_diff);
                        console.log(seconds + " seconds");
                        if (seconds < 1800){
//                           res.render('forgot-password.ejs',{name:'token not valid',csrfToken: req.csrfToken()})
				bcrypt.compare(req.body.Oldpass,data[0].password,function(err,result){				

					if(result==true){
						var comment=checks.verify_pass_strength(req.body.Newpass,req.body.confirmpassword)
						console.log(comment)						
						if(comment==''){

							hash.hash(req.body.Newpass).then(encryptedpass => { db.password_set(encryptedpass,data[0].id);})								
//							res.render('reset.ejs',{name:'password has been reset',csrfToken: req.csrfToken(),token:data[0].reset_pass})
						
							async.waterfall([
								function(done){
									crypto.randomBytes(20, function(err, buf) {
                                                                		var token1 = buf.toString('hex');
                                                                		done(err, token1);
										console.log(token1)
										var st_time= new Date();

										db.token_set(data[0].email,token1,st_time.getTime(),function(err,data){
                        		                                        })


									})
								}
							])	
					
							res.render('reset.ejs',{name:'Password has been reset',csrfToken: req.csrfToken(),token:""})
						}
						else{
							res.render('reset.ejs',{name:comment,csrfToken: req.csrfToken(),token:data[0].reset_pass})
						}
					}
					else{

					    res.render('reset.ejs',{name:'Something is Wrong',csrfToken: req.csrfToken(),token:data[0].reset_pass})
					}

				})
                        }
                        else{
				
								
                                res.render('reset.ejs',{name:'token expired',csrfToken: req.csrfToken(),token:data[0].reset_pass})
                        }
                }
                else{
                        res.send("token not valid")     
                }


	})

});
app.post("/logout",bruteforce.prevent,csrfProtection,(req,res)=>{
		//delete req.session.user_id;	
		req.session.destroy()
    		res.redirect("/login");
});

httpsServer.listen(443); //port no to listen on
