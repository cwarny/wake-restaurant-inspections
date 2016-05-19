# Wake County Restaurant Inspections

## Prerequisites

* [Git](http://git-scm.com/)
* [Python >=3](https://www.python.org/)
* [Elasticsearch >=2](https://www.elastic.co/products/elasticsearch) (ES)
* [R]()

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `pip install -r requirements.txt`

## Configuration

### Data

* Get the [Wake county restaurants inspections data sets](http://data.wake.opendata.arcgis.com/datasets?q=Restaurant&sort_by=title)
* You should have the following 3 datasets:
	* `Wake_County_Restaurant_Inspections.csv`
	* `Wake_County_Restaurant_Violations.csv`
	* `Wake_County_Restaurants.csv`
* Place them in a `data` folder at the project root
* Run `data_join.R` to merge the data sets. This will create a single data set under the `data` folder with name `wake_restaurants.csv` 

### Set up Elasticsearch

* change into the ES directory (which you downloaded from [the ES website](https://www.elastic.co/products/elasticsearch))
* `bin/elasticsearch` to start ES
* `curl -XPUT localhost:9200/wake -d @es_mapping.json` to create an index for this project with an appropriate mapping
* `python es_load.py` to load the merged data set `wake_restaurants.csv` into ES

## Work so far

* Merge data sets
* Load data into ES with two collections:
	* `inspection`
	* `restaurant`

## Next steps

* Build useful ES queries
* Wrap them behind a REST API (built in either Node.js or Python)
* Host the API so can be consumed by all project participants