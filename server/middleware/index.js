const bodyParser = require('body-parser'),
	cors = require('cors');

module.exports = app => {
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json({ type: ['application/json', 'application/vnd.api+json'] })); // This is very important: you need to specify the payload type. If the client is using the JSON API specification, you need to list 'application/vnd.api+json' as a content type, otherwise, the server won't be able to parse the payload of incoming requests
	app.use(cors());
};