import csv
import itertools
from elasticsearch import Elasticsearch
import copy
import hashlib

def generate_id(s):
	return hashlib.md5(s.encode('utf-8')).hexdigest()

es = Elasticsearch()

restaurant_fields = ['name', 'city', 'state', 'address', 'phone_number', 'zip_code', 'lat', 'lon']
inspection_fields = ['type','date']

with open('data/wake_restaurants.csv') as infile:
	reader = csv.DictReader(infile)
	viols = {}

	for restaurant_id,g1 in itertools.groupby(reader, key=lambda e: e['restaurant_id']):
		inspections = []
		for date,g2 in itertools.groupby(g1, key=lambda e: e['date']):
			inspection_id = generate_id(restaurant_id + '~' + date)

			violations = [ { k:v for k,v in e.items() if v != 'NA' } for e in g2 ]
			inspection = { k:violations[0][k] for k in inspection_fields if k in violations[0] }

			es.index(index='wake', doc_type='inspection', body=inspection, id=inspection_id)

			inspection['inspection_id'] = inspection_id

			restaurant = { k:violations[0][k] for k in restaurant_fields if k in violations[0] }
			
			if violations:
				inspection['violations'] = []
				for violation in violations:
					inspection['violations'].append({
						'code': violation['code'],
						'description': violation['description']
					})
					viols[violation['code']] = violation['description']

			inspections.append(inspection)

			if 'lon' in restaurant and 'lat' in restaurant:
				restaurant['coords'] = [float(restaurant.pop('lon')), float(restaurant.pop('lat'))]

		restaurant['inspections'] = inspections
		es.index(index='wake', doc_type='restaurant', body=restaurant, id=restaurant_id)

	for code, desc in viols.items():
		es.index(index='wake', doc_type='violation', body={'description':desc}, id=code)