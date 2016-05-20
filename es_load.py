import csv
import itertools
from elasticsearch import Elasticsearch
import copy

es = Elasticsearch()

restaurant_fields = ['restaurant_id', 'name', 'city', 'state', 'address', 'phone_number', 'zip_code', 'lat', 'lon']
inspection_fields = ['type','date']

with open('data/wake_restaurants.csv') as infile:
	reader = csv.DictReader(infile)
	for k,g in itertools.groupby(reader, key=lambda row: (row['restaurant_id'], row['date'])):
		violations = [ { k:v for k,v in e.items() if v != 'NA' } for e in g ]
		inspection = { k:violations[0][k] for k in inspection_fields if k in violations[0] }
		restaurant = { k:violations[0][k] for k in restaurant_fields if k in violations[0] }
		if restaurant:
			inspection['restaurant'] = restaurant
		
		inspection['violations'] = [
			{
				'code': violation['code'],
				'description': violation['description']
			}
			for violation in violations
		]

		if 'restaurant' in inspection and 'lon' in inspection['restaurant'] and 'lat' in inspection['restaurant']:
			inspection['restaurant']['coords'] = [float(inspection['restaurant'].pop('lon')), float(inspection['restaurant'].pop('lat'))]

		es.index(index='wake', doc_type='inspection', body=inspection)

		if 'restaurant' in inspection:
			restaurant_id = inspection['restaurant'].pop('restaurant_id')
			es.index(index='wake', doc_type='restaurant', body=inspection['restaurant'], id=restaurant_id)