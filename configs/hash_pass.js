const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hash(password) {
	const epassword = await bcrypt.hash(password, saltRounds);
//	console.log(epassword);

	return epassword;
}


function hashcompare(password,hash){

	bcrypt.compare(password, hash, function(err, result) {
    // result == true

	});
}


module.exports = {hash,hashcompare};
