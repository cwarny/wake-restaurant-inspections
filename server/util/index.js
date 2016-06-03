const _ = require('lodash'),
	config = require('../config'),
	qs = require('qs');

module.exports = {
	normalizeRestaurant: (id, score, record) => {
		var normalizedRecord = {
			type: 'restaurants',
			id: id,
			links: {
				self: `http://localhost:${config.port.http}/api/restaurants/${id}`
			},
			attributes: _.omit(record, ['inspections', 'restaurant_id'])
		};

		if (score) normalizedRecord.attributes.relevancy = score;

		if ('inspections' in record) {
			normalizedRecord.relationships = {
				inspections: {
					links: {
						self: `http://localhost:${config.port.http}/api/restaurants/${id}/relationships/inspections`,
						related: `http://localhost:${config.port.http}/api/restaurants/${id}/inspections`
					},
					data: record.inspections.map(insp => ({ type: 'inspections', id: insp.inspection_id }))
				}
			};
		}

		return normalizedRecord;
	},

	normalizeInspection: (id, score, record) => {
		var normalizedRecord = {
			type: 'inspections',
			id: id,
			links: {
				self: `http://localhost:${config.port.http}/api/inspections/${id}`
			},
			attributes: _.omit(record, ['violations', 'inspection_id', 'restaurant_id'])
		};

		if (score) normalizedRecord.attributes.relevancy = score;

		if ('violations' in record) {
			normalizedRecord.relationships = {
				violations: {
					links: {
						self: `http://localhost:${config.port.http}/api/inspections/${id}/relationships/violations`,
						related: `http://localhost:${config.port.http}/api/inspections/${id}/violations`
					},
					data: record.violations.map(viol => ({ type: 'violations', id: viol.code }))
				},
				restaurant: {
					links: {
						self: `http://localhost:${config.port.http}/api/restaurants/${id}`
					},
					data: {
						id: id,
						type: 'restaurants'
					}
				}
			};

			normalizedRecord.included = record.violations.map(viol => ({
				type: 'violations', 
				id: viol.code,
				attributes: _.omit(viol, 'code'),
				links: {
					self: `http://localhost:${config.port.http}/api/violations/${viol.code}`
				}
			}));
		}

		return normalizedRecord;
	},

	normalizeViolation: (id, score, record) => {
		var normalizedRecord = {
			type: 'violations',
			id: id,
			links: {
				self: `http://localhost:${config.port.http}/api/violations/${id}`
			},
			attributes: record
		};

		return normalizedRecord;
	},

	dig: function(o, k) {
		if (!'.' in k) {
			if (!k in o) {
				throw Error();
			}
			var r = {};
			r[k] = o[k];
			return r;
		} else {
			var keys = k.split('.');
			var r = {}
			r[keys[0]] = this.dig(o[keys[0]], keys.slice(1).join('.'));
			return r;
		}
	},

	pickDeep: function(arr, include) {
		return arr.map(e => _.merge.apply(this, include.map(incl => {
			return this.dig(e,include);
		})))
	},

	trace: function(o, path) {
		if ('properties' in o) {
			return _.keys(o.properties).map(prop => {
				var newPath = path ? `${path}.${prop}` : prop;
				return [newPath, this.trace(o.properties[prop], newPath)];
			});
		}
		return [];
	},

	getValidIncludes: function(mappings) {
		return _.mapValues(mappings, (v,k,o) => {
			return _.flattenDeep(this.trace(v));
		});
	},

	getPagination: (total, pageLimit, pageNumber, pageOffset, query, baseUrl, path, hostname, port) => {
		var next, prev;

		if (total > pageLimit && pageOffset < total) {
			var clonedQuery = JSON.parse(JSON.stringify(query));
			clonedQuery.page = {
				limit: pageLimit,
				number: pageNumber + 1
			};
			var queryString = qs.stringify(clonedQuery);
			var fullPath = `${baseUrl}${path}`;
			
			if (fullPath[fullPath.length-1] === '/') {
				fullPath = fullPath.slice(0,fullPath.length-1);
			}
			
			next = `http://${hostname}:${port}${fullPath}?${queryString}`;
		}

		if (pageOffset > 0) {
			var clonedQuery = JSON.parse(JSON.stringify(query));
			clonedQuery.page.number--;
			var queryString = qs.stringify(clonedQuery);
			var fullPath = `${baseUrl}${path}`;
			
			if (fullPath[fullPath.length-1] === '/') {
				fullPath = fullPath.slice(0,fullPath.length-1);
			}

			prev = `http://${hostname}:${port}${fullPath}?${queryString}`;
		}

		return { prev: prev, next: next };
	}
};