const _ = require('lodash');

var config = {
	dev: 'development',
	test: 'testing',
	prod: 'production',
	port: {
		http: process.env.HTTP_PORT || 8888
	},
	expireTime: 10 * 24 * 60 * 60, // 10 days in seconds
	secrets: { 
		jwt: process.env.JWT || 'supersecretkey' 
	}
};

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;

config.env = process.env.NODE_ENV;

var envConfig = require('./' + config.env);

module.exports = _.merge(config, envConfig);