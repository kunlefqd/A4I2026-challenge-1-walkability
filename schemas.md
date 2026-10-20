# BigQuery Dataset Schemas (`a4i_climate`)

**Project ID:** `qwiklabs-gcp-04-2bc40033bbb7`  
**Dataset:** `a4i_climate`  
**Location:** `US`

---

## 1. `a4i_climate.heat_observations`
*Single-day afternoon street-level temperature traverse snapshot (NOAA/CAPA Heat Watch).*

| Column Name | Data Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `longitude` | `FLOAT64` | `NULLABLE` | Longitude of the sensor reading |
| `latitude` | `FLOAT64` | `NULLABLE` | Latitude of the sensor reading |
| `city` | `STRING` | `NULLABLE` | Campaign city name (e.g., `"Chicago"`) |
| `temp_f` | `FLOAT64` | `NULLABLE` | Air temperature in degrees Fahrenheit |
| `heat_index_f` | `FLOAT64` | `NULLABLE` | Heat index in degrees Fahrenheit |
| `humidity_pct` | `FLOAT64` | `NULLABLE` | Relative humidity percentage (`0`–`100`) |
| `observed_at` | `DATETIME` | `NULLABLE` | Timestamp of the observation |

---

## 2. `a4i_climate.station_daily_temps`
*Multi-year daily maximum temperatures from nearby NOAA GHCN-Daily weather stations.*

| Column Name | Data Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `station_id` | `STRING` | `NULLABLE` | NOAA GHCN station identifier |
| `station_name` | `STRING` | `NULLABLE` | Common name of the weather station |
| `latitude` | `FLOAT64` | `NULLABLE` | Station latitude |
| `longitude` | `FLOAT64` | `NULLABLE` | Station longitude |
| `observation_date` | `DATE` | `NULLABLE` | Date of the recorded daily maximum |
| `max_temp_f` | `FLOAT64` | `NULLABLE` | Daily maximum temperature (`TMAX`) in degrees Fahrenheit |

---

## 3. `a4i_climate.tract_demographics`
*US Census American Community Survey (ACS) 5-year tract-level vulnerability indicators.*

| Column Name | Data Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `geo_id` | `STRING` | `NULLABLE` | 11-character Census Tract FIPS code |
| `tract_lat` | `FLOAT64` | `NULLABLE` | Internal centroid latitude of the census tract |
| `tract_lon` | `FLOAT64` | `NULLABLE` | Internal centroid longitude of the census tract |
| `total_pop` | `FLOAT64` | `NULLABLE` | Total population in the census tract |
| `median_age` | `FLOAT64` | `NULLABLE` | Median age of residents |
| `median_income` | `FLOAT64` | `NULLABLE` | Median household income |
| `housing_units` | `FLOAT64` | `NULLABLE` | Total number of housing units |
| `median_year_structure_built` | `FLOAT64` | `NULLABLE` | Median construction year of housing structures |
| `no_cars` | `FLOAT64` | `NULLABLE` | Count of households without access to a vehicle |
| `households` | `FLOAT64` | `NULLABLE` | Total number of households |
| `poverty_rate` | `FLOAT64` | `NULLABLE` | Proportion of population below the poverty line (`0.0`–`1.0`) |
| `no_vehicle_rate` | `FLOAT64` | `NULLABLE` | Proportion of households with no vehicle (`0.0`–`1.0`) |
| `pop_over_65` | `FLOAT64` | `NULLABLE` | Total population aged 65 and older |
