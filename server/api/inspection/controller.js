const es = require('../../es'),
	config = require('../../config'),
	utils = require('../../util'),
	_ = require('lodash');

exports.get = (req, res, next) => {
	var /*username = req.auth.username,*/
		include = req.query.include,
		filter = req.query.filter || {},
		pageLimit = req.pageLimit,
		pageOffset = req.pageOffset,
		pageNumber = req.pageNumber,
		sortingProperty = req.sortingProperty,
		sortingDir = req.sortingDir,
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
		size: pageLimit,
		from: pageOffset,
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
					return utils.normalizeInspection(d._id, d._score, d._source);
				})
			};

			var included = resp.hits.hits.map(d => {
				if ('violations' in d._source && ('violations' in include || !include.length)) {
					return d._source.violations.map(viol => {

						var v = {
							type: 'violations', 
							id: viol.code,
							links: {
								self: `http://${req.hostname}:${config.port.http}/api/violations/${viol.code}`
							}
						};

						if (!include.length) {
							v.attributes = viol;
						} else {
							v.attributes = utils.pickDeep(viol, include);
						}

						return v;
					});
				} else {
					return [];
				}
			});

			included = _.flatten(included);

			if (included.length) {
				response.included = included;
			}

			// Pagination

			var pagination = utils.getPagination(response.meta.total, pageLimit, pageNumber, pageOffset, req.query, req.baseUrl, req.path, req.hostname, config.port.http);

			if (pagination.next) {
				response.links = { next: pagination.next };
			}

			if (pagination.prev) {
				if ('links' in response) {
					response.links.prev = pagination.prev;
				} else {
					response.links = { prev: pagination.prev };
				}
			}

			res.send(response);
		}
	});
};