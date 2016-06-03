module.exports = {
	"mappings": {
		"_default_": {
			"_all": {
				"enabled": "false"
			},
			"dynamic": false
		},
		"violation": {
			"properties": {
				"code": {
					"type": "string", 
					"index": "not_analyzed"
				},
				"description": { 
					"type": "string", 
					"index": "analyzed"
				}
			}
		},
		"inspection": {
			"properties": {
				"score": { 
					"type": "float", 
					"index": "not_analyzed"
				},
				"type": { 
					"type": "string", 
					"index": "not_analyzed"
				},
				"date": { 
					"type": "date",
					"index":"not_analyzed"
				},
				"violations": {
					"type": "nested",
					"include_in_parent": true,
					"properties": {
						"code": {
							"type": "string", 
							"index": "not_analyzed"
						},
						"description": { 
							"type": "string", 
							"index": "analyzed"
						}
					}
				}
			}
		},
		"restaurant": {
			"properties": {
				"name": { 
					"type": "string", 
					"index": "analyzed" 
				},
				"address": { 
					"type": "string", 
					"index": "not_analyzed" 
				},
				"city": { 
					"type": "string", 
					"index": "not_analyzed" 
				},
				"state": { 
					"type": "string", 
					"index": "not_analyzed" 
				},
				"zip_code": { 
					"type": "string", 
					"index": "not_analyzed" 
				},
				"address": { 
					"type": "string", 
					"index": "not_analyzed" 
				},
				"coords": {
					"type": "geo_point",
					"geohash_prefix": true,
					"geohash_precision": 10
				},
				"phone_number": {
					"type": "string",
					"index": "not_analyzed"
				},
				"inspection": {
					"type": "nested",
					"include_in_parent": true,
					"properties": {
						"inspection_id": {
							"type": "string", 
							"index": "not_analyzed"
						},
						"score": { 
							"type": "float", 
							"index": "not_analyzed"
						},
						"type": { 
							"type": "string", 
							"index": "not_analyzed"
						},
						"date": { 
							"type": "date",
							"index":"not_analyzed"
						},
						"violations": {
							"type": "nested",
							"include_in_parent": true,
							"properties": {
								"code": {
									"type": "string", 
									"index": "not_analyzed"
								},
								"description": { 
									"type": "string", 
									"index": "analyzed"
								}
							}
						}
					}
				}
			}
		}
	}
};