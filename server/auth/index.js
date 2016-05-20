const jwt = require('jsonwebtoken'),
	config = require('../config'),
	expressJwt = require('express-jwt'),
	checkToken = expressJwt({ secret: config.secrets.jwt, requestProperty: 'auth' });

exports.decodeToken = () => {
	return (req, res, next) => {
		// This will call next if token is valid
		// and send error if it's not. It will attach
		// the decoded token to req[requestProperty]
		checkToken(req, res, next);
	};
};

exports.signToken = username => {
	return jwt.sign(
		{ username: username },
		config.secrets.jwt,
		{ expiresIn: config.expireTime }
	);
};