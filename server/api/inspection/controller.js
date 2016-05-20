const es = require('../../es'),
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
		dateRange = filter.dateRange,
		coords = filter.coords,
		radius = filter.radius,
		inspectionTypes = filter.inspectionTypes,
		restaurants = filter.restaurants;

	// Build query

	var q = { match_all: {} };

	if (query) {
		q = { 
			simple_query_string: { 
				query: query, 
				fields: ['violations.description']
			}
		};
	}

	// Build filters

	var filters = [];

	if (dateRange) {
		var dateFilter = { 
			range: { 
				date: { gt: dateRange[0], lt: dateRange[1], format: 'epoch_millis' } 
			} 
		}
		filters.push(dateFilter);
	}

	if (coords) {
		var geoFilter = { 
			nested: {
				path: 'restaurant',
				filter: {
					geo_distance: {
						distance: radius + 'mi',
						'restaurant.coords': coords.map(d => +d)
					}
				}
			}
		};

		filters.push(geoFilter);
	}

	if (inspectionTypes) {
		filters.push({ terms: { 'type': inspectionTypes } });
	}

	if (restaurants) {
		filters.push({ terms: { 'restaurant.name': restaurants } });
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
			pre_tags : ['<b>'],
			post_tags : ['</b>'],
			fields: { 'violations.description': {} }
		}
	};

	if (filters.length) request_body.query.bool.filter = filters;

	es.search({
		index: 'wake',
		type: 'inspection',
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