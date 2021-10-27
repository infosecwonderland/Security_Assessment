//import mysql from "mysql2";

const mysql = require('mysql2');
var express= require('express');
var async = require('async');
var crypto = require('crypto');

var app =express();
require('dotenv').config();

let connection= mysql.createConnection({
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD

});

/**
connection.connect(function(err){
	if (err) throw err;
	console.log("Database connected successfully");

});
**/
function check_email(email1,callback)
{
	 connection.connect(function(err){
               if (err) throw err;
               console.log("Database connected successfully");

	 });
         var sql = "select email from users where email=?";
	 var check;
         connection.query(sql,[email1],function(err, result)
	 {
        	 if (err)
	    	    callback(err,null);
	 
	//	Object.keys(result).forEach(function(key) {
      	 //var row = result.email;
	 	else
	    	    callback(null,result[0]);
	
         });
}

function get_token(token,callback)
{
	 connection.connect(function(err){
               if (err) throw err;
               console.log("Database connected successfully");

         });
	
         var sql = "select reset_pass,time,password from users where reset_pass=?";
         var check;
         connection.query(sql,[token],function(err, result)
         {
                 if (err)
                    callback(err,null);

        //      Object.keys(result).forEach(function(key) {
         //var row = result.email;
                else
		    console.log(result)
                    callback(null,result);

         });
}


function get_token(token,callback)
{
         
	 connection.connect(function(err){
               if (err) throw err;
               console.log("Database connected successfully");

         });

	 var sql = "select * from users where reset_pass=?";
         var check;
         connection.query(sql,[token],function(err, result)
         {
                 if (err)
                    callback(err,null);

        //      Object.keys(result).forEach(function(key) {
         //var row = result.email;
                else
                    console.log(result)
                    callback(null,result);

         });
}


function register_data(email,password)
{

		    connection.connect(function(err){
               		if (err) throw err;
               		console.log("Database connected successfully");

         	    });


		    var sql = "INSERT IGNORE INTO users (email, password) VALUES (?,?)";
         	    connection.query(sql,[email,password],(err, rows) => {
        	    if (err) throw err;
               		 console.log("User data is inserted successfully ");
         	    });

			

                       	 	
}


function token_set(email,token,time)
{


		    connection.connect(function(err){
	               if (err) throw err;
        		       console.log("Database connected successfully");

         	    });
	
                    var sql = "UPDATE users SET reset_pass = ?,time = ? WHERE (email=?)";
                    console.log(token)
                    connection.query(sql,[token,time,email],(err, rows) => {
                    if (err) throw err;
                         console.log("token is inserted successfully ");
                    });


}
function password_set(newpass,id)
{
		    connection.connect(function(err){
                       if (err) throw err;
                       console.log("Database connected successfully");

         	    });

         	    var sql = "UPDATE users SET password = ? WHERE (id=?)";
                    console.log(id)
                    connection.query(sql,[newpass,id],(err, rows) => {
                    if (err) throw err;
                         console.log("password is inserted successfully ");
                    });

}




module.exports = {connection,register_data,check_email,get_token,token_set,password_set};

//new code from here
