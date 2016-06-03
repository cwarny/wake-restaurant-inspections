const config = require('./config'),
	express = require('express'),
	app = express();

require('./middleware')(app);

app.use('/api', /*require('./auth').decodeToken(),*/ require('./middleware/include')(), require('./api'));
app.use('/auth', require('./auth/routes'));

// app.use(require('./middleware/err')());

app.listen(config.port.http, () => {
	console.log('http server listening on port', config.port.http);
});

module.exports = app;