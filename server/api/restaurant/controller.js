const es = require('../../es'),
	config = require('../../config'),
	utils = require('../../util'),
	inflect = require('i')();

exports.get = (req, res, next) => {
	var /*username = req.auth.username,*/
		filter = req.query.filter,
		limit = filter.limit || 10,
		page = filter.page || 1,
		offset = (page - 1) * limit,
		sortingProperty = filter.sortBy || '_score',
		sortingDir = filter.sortDir || 'desc',
		query = filter.query,
		coords = filter.coords,
		radius = filter.radius || 10;

	// Build query

	var q = { match_all: {} };

	if (query) {
		q = { 
			simple_query_string: { 
				query: query, 
				fields: ['name']
			}
		};
	}

	// Build filters

	var filters = [];

	if (coords) {
		filters.push({
			geo_distance: {
				distance: radius + 'mi',
				coords: coords.map(d => +d)
			}
		});
	}

	var sort = {};
	sort[sortingProperty] = { order: sortingDir };

	var request_body = {
		query: {
			bool: {
				must: q
			}
		},
		sort: [ sort, '_score' ],
		highlight: {
			pre_tags: ['<b>'],
			post_tags: ['</b>'],
			fields: { 'name': {} }
		}
	};

	if (filters.length) request_body.query.bool.filter = filters;

	console.log(JSON.stringify(request_body));

	es.search({
		index: 'wake',
		type: 'restaurant',
		size: limit,
		from: offset,
		body: request_body
	}, (err, resp) => {
		if (err) {
			next(err);
		} else {
			var response = {
				meta: {
					total: resp.hits.total
				},
				data: resp.hits.hits.map(d => {
					if ('highlight' in d) {
						d._source.highlight = d.highlight;
					}
					return utils.normalizeRecord(inflect.pluralize(d._type), d._id, d._score, d._source);
				})
			};

			res.send(response);
		}
	});
};

exports.getOne = (req, res, next) => {
	var /*username = req.auth.username,*/
		restaurant_id = req.params.restaurant_id;

	es.get({
		index: 'wake',
		type: 'restaurant',
		id: restaurant_id
	}, (err, resp) => {
		if (err) {
			next(err);
		} else {
			res.send({ 
				data: utils.normalizeRecord(inflect.pluralize(resp._type), resp._id, null, resp._source) 
			});
		}
	});
};