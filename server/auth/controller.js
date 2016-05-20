const signToken = require('./index').signToken;

exports.signin = (req, res, next) => {
	const username = req.body.username,
		password = req.body.password;
	
	var token = signToken(username);
	res.send({ access_token: token, username: username });
};