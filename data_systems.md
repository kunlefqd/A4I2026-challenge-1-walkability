# Data Architecture & Sources: Urban Heat Resilience App

## 1. Upstream Public Data Sources
Our system synthesizes four distinct public datasets to solve the **"Where vs. When vs. Who"** urban heat problem—combining street-level microclimate spatial variation, multi-year regional climate frequency, and census-tract social vulnerability:

| Data Source | Role in the System | Granularity | Licensing & Governance |
| :--- | :--- | :--- | :--- |
| **1. NOAA / CAPA Heat Watch Campaigns**<br>*(ArcGIS REST Service / Fallback Simulator)* | **"WHERE" (Spatial Microclimate):** High-resolution afternoon vehicle traverse readings capturing block-by-block temperature and humidity offsets driven by asphalt, building density, and tree cover. | Point-level (`~15,000` street readings within a 1-hour afternoon window) | **CC0 1.0 Public Domain** (No PII; vehicle-mounted street sensors) |
| **2. NOAA GHCN-Daily**<br>(`bigquery-public-data.ghcn_d.ghcnd_20*` & `ghcnd_stations`) | **"WHEN" (Temporal Frequency):** 7-year daily maximum temperature history (`2019–2025`) from regional weather stations to quantify how frequently the city crosses dangerous heat thresholds. | Station-day (`13,490` verified `TMAX` records across 7 Chicago-area stations) | **Public Domain** (Filtered on `qflag IS NULL` for QA-verified observations) |
| **3. U.S. Census Bureau ACS 5-Year**<br>(`bigquery-public-data.census_bureau_acs.censustract_2020_5yr`) | **"WHO" (Social Vulnerability):** Socioeconomic and demographic indicators identifying populations most susceptible to extreme heat (seniors 65+, low-income households, and carless households). | Census Tract (`1,342` tracts across the Chicago metro footprint) | **Public Domain** (Aggregate-only; race/ethnicity columns deliberately excluded from model inputs to prevent proxy-based resource gating, reserved strictly for post-hoc fairness auditing) |
| **4. U.S. Census Tract Geometry**<br>(`bigquery-public-data.geo_census_tracts.us_census_tracts_national`) | **Spatial Backbone:** Provides internal tract centroids (`internal_point_lat`, `internal_point_lon`) and standardized 11-digit FIPS `geo_id` keys to join street observations to census tracts. | Census Tract (`1,368` geometry polygons in bounding box) | **Public Domain** |

---

## 2. Data Storage & Processing Layer (Google BigQuery)
All cleaned, harmonized, and normalized datasets are stored in **Google BigQuery** under project **`qwiklabs-gcp-04-2bc40033bbb7`** in the **`a4i_climate`** dataset (`US` multi-region).

### Core Tables in `qwiklabs-gcp-04-2bc40033bbb7.a4i_climate`

1. **`heat_observations` (`15,000` rows)**
   * **Purpose:** Cleaned street-level afternoon temperature (`temp_f`), heat index (`heat_index_f`), and relative humidity (`humidity_pct`) readings.
   * **Cleaning Pipeline:** Harmonizes inconsistent schema names across cities, converts Celsius to Fahrenheit where needed, strips sensor sentinel values (`-9999.0`, `-999.0`, `9999.9`), and validates physical bounds (`40°F–140°F`).

2. **`station_daily_temps` (`13,490` rows)**
   * **Purpose:** 7-year daily maximum temperature (`max_temp_f`) time series (`2019–2025`) for regional NOAA weather stations.
   * **Cleaning Pipeline:** Pivots `TMAX` elements, converts tenths of degrees Celsius (`value / 10.0`) to Fahrenheit, and removes QA-flagged readings (`qflag IS NULL`).

3. **`tract_demographics` (`1,342` rows)**
   * **Purpose:** Census-tract demographic baseline joined to tract centroids.
   * **Cleaning Pipeline:** Applies `LPAD(geo_id, 11, '0')` to repair stripped leading zeros on state FIPS codes, casts string coordinates via `SAFE_CAST`, computes `poverty_rate` and `no_vehicle_rate` via `SAFE_DIVIDE`, and aggregates 12 separate male/female age brackets (`65–66` through `85+`) into `pop_over_65`.

4. **`tract_heat_risk` (`1,342` rows — *Primary Agent Lookup Table*)**
   * **Purpose:** Pre-aggregated decision table combining normalized microclimate heat hazard scores (`[0.0, 1.0]`), normalized demographic vulnerability scores (`[0.0, 1.0]`), and a composite intervention priority index (`combined_priority_score`).

---

## 3. Risk Normalization & Scoring Methodology
To allow the AI agent to compare temperature anomalies (`°F`) and socioeconomic rates on a unified **`[0.0, 1.0]` scale**, the pipeline executes a four-stage SQL transformation in `tract_heat_risk`:

1. **Spatial Aggregation:** Matches street-level `heat_observations` to each census tract (`tract_demographics`) and computes the tract's temperature offset relative to the city-wide mean (`raw_anomaly_f`).
2. **Hazard Floor (`HAZARD_FLOOR = 1.0°F`):** Tracts at or below `+1.0°F` above the city mean are clamped to `0.0` (`floored_anomaly_f`) so cooler lakefront neighborhoods never pull down or distort emergency heat prioritization.
3. **Adjusted Min-Max Heat Hazard (`normalized_heat_hazard`):** Divides each tract's `floored_anomaly_f` by the city's maximum positive tract anomaly (`+2.83°F`), mapping all elevated-heat tracts onto `[0.0, 1.0]`.
4. **Demographic Min-Max Scaling & Composite Priority:**
   * Normalizes `poverty_rate` ($\rightarrow$ `norm_poverty`), `no_vehicle_rate` ($\rightarrow$ `norm_no_vehicle`), and `over_65_rate` ($\rightarrow$ `norm_over_65`) to `[0.0, 1.0]`.
   * Computes **`social_vulnerability_score`** as the equal-weighted average of the three normalized demographic pillars.
   * Computes **`combined_priority_score`** (`50% normalized_heat_hazard + 50% social_vulnerability_score`, gated on `normalized_heat_hazard > 0`) to surface neighborhoods where extreme heat and high social vulnerability intersect.

---

## 4. Machine Learning & Explainability Layer (BigQuery ML)
* **Model ID:** `qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.heat_offset_model`
* **Model Type:** BigQuery ML `LINEAR_REG` (trained in-database).
* **Target Label:** `degrees_above_city_average` (predicts the *spatial microclimate offset* rather than absolute calendar temperature).
* **Explainable AI (`ML.EXPLAIN_PREDICT`):** Generates per-feature attributions (`feature_contribution_f`) for every census tract prediction. This allows the downstream ADK Agent to explain *why* a specific tract is prioritized, backing every cooling center, hydration truck, or tree-canopy recommendation with transparent, auditable numbers.
