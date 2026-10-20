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

### 4. `tract_heat_risk`
**Full Table ID:** `qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.tract_heat_risk`  
**Description:** Census-tract level heat hazard scores normalized using a Hazard Floor (`<= 1.0°F` zeroed out) and Adjusted Min-Max scaling (`[0.0, 1.0]`), joined with ACS vulnerability indicators.

| Column Name | Data Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `geo_id` | `STRING` | `NULLABLE` | 11-character FIPS census tract identifier |
| `tract_lat` | `FLOAT` | `NULLABLE` | Census tract internal point latitude |
| `tract_lon` | `FLOAT` | `NULLABLE` | Census tract internal point longitude |
| `observation_count` | `INTEGER` | `NULLABLE` | Number of street-level heat observations matched to the tract |
| `tract_avg_temp_f` | `FLOAT` | `NULLABLE` | Mean afternoon temperature (°F) within the tract |
| `raw_anomaly_f` | `FLOAT` | `NULLABLE` | Raw temperature difference (°F) relative to the city-wide mean |
| `floored_anomaly_f` | `FLOAT` | `NULLABLE` | Hazard-floored anomaly (`0.0` if `raw_anomaly_f <= 1.0`, else `raw_anomaly_f`) |
| `max_positive_anomaly_f` | `FLOAT` | `NULLABLE` | Maximum positive `floored_anomaly_f` across all tracts in the city |
| `normalized_heat_hazard` | `FLOAT` | `NULLABLE` | Adjusted Min-Max heat hazard score (`floored_anomaly_f / max_positive_anomaly_f`) on a `[0.0, 1.0]` scale |
| `total_pop` | `FLOAT` | `NULLABLE` | Total tract population |
| `median_age` | `FLOAT` | `NULLABLE` | Median age of tract residents |
| `median_income` | `FLOAT` | `NULLABLE` | Median household income |
| `poverty_rate` | `FLOAT` | `NULLABLE` | Proportion of population below the poverty line (`0.0` to `1.0`) |
| `no_vehicle_rate` | `FLOAT` | `NULLABLE` | Proportion of households with no vehicle available (`0.0` to `1.0`) |
| `pop_over_65` | `FLOAT` | `NULLABLE` | Total population aged 65 and older |
