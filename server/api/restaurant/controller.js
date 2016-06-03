const es = require('../../es'),
	config = require('../../config'),
	utils = require('../../util'),
	_ = require('lodash');

exports.get = (req, res, next) => {
	var /*username = req.auth.username,*/
		include = req.query.include,
		pageLimit = req.pageLimit,
		pageNumber = req.pageNumber,
		pageOffset = req.pageOffset,
		sortingProperty = req.sortingProperty,
		sortingDir = req.sortingDir,
		filter = req.query.filter || {},
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

	es.search({
		index: 'wake',
		type: 'restaurant',
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
					return utils.normalizeRestaurant(d._id, d._score, d._source);
				})
			};

			
			var included = resp.hits.hits.map(d => {
				if ('inspections' in d._source && ('inspections' in include || !include.length)) {
					return d._source.inspections.map(insp => {

						var i = {
							type: 'inspections', 
							id: insp.inspection_id,
							links: {
								self: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}`
							}
						};

						if (!include.length) {
							i.attributes = _.omit(insp, ['violations', 'inspection_id', 'restaurant_id']);
						} else {
							i.attributes = utils.pickDeep(insp, include);
						}
						
						if ('violations' in insp && ('violations' in include || !include.length)) {
							i.relationships = {
								violations: {
									links: {
										self: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}/relationships/violations`,
										related: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}/violations`
									},
									data: insp.violations.map(viol => ({ type: 'violations', id: viol.code }))
								}
							};
						}

						if ('restaurant' in insp && ('restaurant' in include || !include.length)) {
							if ('relationships' in i) {
								i.relationships.restaurant = {
									links: {
										self: `http://${req.hostname}:${config.port.http}/api/restaurants/${d._id}`
									},
									data: {
										id: d._id,
										type: 'restaurants'
									}
								};
							} else {
								i.relationships = {
									restaurant: {
										links: {
											self: `http://${req.hostname}:${config.port.http}/api/restaurants/${d._id}`
										},
										data: {
											id: d._id,
											type: 'restaurants'
										}
									}
								};
							}
						}

						return i;
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

exports.getOne = (req, res, next) => {
	var /*username = req.auth.username,*/
		include = req.query.include,
		restaurant_id = req.params.restaurant_id;

	es.get({
		index: 'wake',
		type: 'restaurant',
		id: restaurant_id
	}, (err, resp) => {
		if (err) {
			next(err);
		} else {
			var response = { 
				data: utils.normalizeRestaurant(resp._id, null, resp._source) 
			};

			if ('inspections' in resp._source && ('inspections' in include || !include.length)) {
				response.included = resp._source.inspections.map(insp => {

					var i = {
						type: 'inspections', 
						id: insp.inspection_id,
						links: {
							self: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}`
						}
					};

					if (!include.length) {
						i.attributes = _.omit(insp, ['violations', 'inspection_id', 'restaurant_id']);
					} else {
						i.attributes = utils.pickDeep(insp, include);
					}
					
					if ('violations' in insp && ('violations' in include || !include.length)) {
						i.relationships = {
							violations: {
								links: {
									self: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}/relationships/violations`,
									related: `http://${req.hostname}:${config.port.http}/api/inspections/${insp.inspection_id}/violations`
								},
								data: insp.violations.map(viol => ({ type: 'violations', id: viol.code }))
							}
						};
					}

					if ('restaurant' in insp && ('restaurant' in include || !include.length)) {
						if ('relationships' in i) {
							i.relationships.restaurant = {
								links: {
									self: `http://${req.hostname}:${config.port.http}/api/restaurants/${resp._id}`
								},
								data: {
									id: resp._id,
									type: 'restaurants'
								}
							};
						} else {
							i.relationships = {
								restaurant: {
									links: {
										self: `http://${req.hostname}:${config.port.http}/api/restaurants/${resp._id}`
									},
									data: {
										id: resp._id,
										type: 'restaurants'
									}
								}
							};
						}
					}

					return i;
				});
			}

			res.send(response);
		}
	});
};