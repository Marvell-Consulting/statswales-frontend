# Data preparation - New Datasets

Datasets consist of a set of statistics and their associated metadata. The dataset is built in SW3 as a data cube from a data table and reference, or lookup, data.

## Data tables

For new datasets you need to have a data table. The table should preferably be in [CSV format](#csv-format) and must contain columns for:

- data values (including rows for any calculated [totals or averages](#totals-and-averages) you want to include)
- all relevant dimensions and [reference codes](#reference-data-lookup-tables-and-date-formatting)
- [measure or data types](#measure-or-data-types)
- [standardised shorthand](#notes) note codes to label specific data values - **you must include this column**, even if you do not have any note codes to include

In this guidance, we’ll be using the example scenario of data for council tax bands. Here are example rows of a data table for this scenario:

| AreaCode | YearCode | BandCode | NoteCodes | Measure | Data   |
| :------- | :------- | :------- | :-------- | :------ | :----- |
| 512      | 202425   | A-       |           | 1       | 256.88 |
| 512      | 202425   | A        | x         |         |        |
| 512      | 202425   | B        |           | 1       | 359.64 |
| 512      | 202425   | C        | e         | 1       | 411.01 |
| 512      | 202425   | D        |           | 1       | 462.39 |

### File format

The preferred file format is a CSV with:

- values separated by commas
- headings in the first row
- " " used for quote marks, if needed
- columns in any order
- data values as numeric values only

The preferred format for CSVs is UTF-8, as this works better with any special characters used. This format should be an option in the software you use to generate CSVs, and may be under 'text encoding' or similar. In Excel, 'CSV UTF-8' is under common formats in the 'Save as' options.

Whilst CSVs are the recommended format, the system can also accept JSON and Parquet formats as well.

### Headings

Column headings should have meaningful names, so that you know what each column contains. This will be important when [uploading your CSV](creating-a-new-dataset-in-SW3) into SW3. They can have spaces between words if required.

### Totals and averages

You should include rows in your data table for any totals or averages you want to include with the dataset. The rows should contain:

- totals or averages
- correct [references codes](#reference-data-lookup-tables-and-date-formatting) or [date formats](#date-formatting)
- a [standard note code](#notes) indicating whether the data value is a total (t) or an average (a)

In our council tax example, the AreaCode dimension refers to local authorities. If you wanted to include a total for the whole of Wales, you would need to include a row containing the total, the reference code for Wales [596] and a ‘t’ note code. If the value for Wales was an average, this would be an ‘a’ note code.

If your data contains hierarchies with multiple layers - for example economic regions, which are groupings of local authorities - you can provide multiple totals or averages. For example, a total for each economic region and a total for Wales.

### Column ordering

The order of columns in your data table file will affect the ordering of the data table that consumers will download, based on the sort orders defined by each dimension's reference data. In our council tax example above, the data table would first be sorted by local authority (AreaCode), then year (YearCode), then council tax band (BandCode), then measure.

## Reference data (date formatting and lookup tables)

When you build your dataset in SW3, you’ll need to select reference data for each dimension in your data table. In our example table, this would mean selecting lookup tables for ‘AreaCode’ and ‘BandCode’, and confirming date formats for 'YearCode'. You do not need to add lookup tables for [data value notes](#notes).

### Standardised reference data

SW3 does not use lookup tables for dimensions containing dates, instead taking a [standardised approach to formatting](#date-formatting).

In addition, in the near future SW3 will have standardised, centrally-managed lookup tables for:

- age
- ethnicity
- geography
- religion
- sex and gender

Implementing this standardised reference data for these data types will:

- ensure better consistency across StatsWales
- standardise English and Welsh descriptions
- improve usability for data consumers

This guidance will be updated once this standardised reference data has been implemented.

### Date formatting

SW3 can only accept certain date formats in your data table. When you [build your dataset](Creating-a-new-dataset-in-SW3) in SW3, for dimensions containing dates [you’ll be asked about the date formats you’ve used](Creating-a-new-dataset-in-SW3#date-formatting).

The dates that will appear on the consumer website, that is the English and Welsh descriptions, are standardised and built into the system.

#### Periods of time

For example, months, quarters or years for which data values apply to.

##### Year formats

| Format in data table | Example   | How it will appear on website |
| :------------------- | :-------- | :---------------------------- |
| YYYYYYYY             | 20222023  | 2022-23                       |
| YYYY-YYYY            | 2022-2023 | 2022-23                       |
| YYYY/YYYY            | 2022/2023 | 2022/23                       |
| YYYYYY               | 202223    | 2022-23                       |
| YYYY-YY              | 2022-23   | 2022-23                       |
| YYYY/YY              | 2022/23   | 2022/23                       |
| YYYY                 | 2022      | 2022                          |

##### Quarter formats

Any of the year formats followed by a quarter code.

| Quarter format in data table | Example | How it will appear on website |
| :--------------------------- | :------ | :---------------------------- |
| Qx                           | 2022Q1  | Q1 2022                       |
| \_Qx                         | 2022_Q1 | Q1 2022                       |
| -Qx                          | 2022-Q1 | Q1 2022                       |
| x                            | 20221   | Q1 2022                       |
| \_x                          | 2022_1  | Q1 2022                       |
| -x                           | 2022-1  | Q1 2022                       |

##### Month formats

Any of the year formats followed by a month code.

| Month format in data table | Example | How it will appear on website |
| :------------------------- | :------ | :---------------------------- |
| MMM                        | 2022Jan | January 2022                  |
| mMM                        | 2022m01 | January 2022                  |
| MM                         | 202201  | January 2022                  |

##### Year type

You also need to know the type of year the dimension covers, either:

- Calendar (1 January to 31 December)
- Meteorological (1st March to 28th or 29th February)
- Financial (1 April to 31 March)
- Tax (6 April to 5 April)
- Academic (1 September to 31 August)

##### Multiple periods in the same dataset

Your dataset can contain data for multiple time periods. For example, monthly values with quarterly and yearly totals.

You **must use consistent year formatting** for all time periods present in the dataset. For example if you use ‘YYYY’ for years, you could use ‘YYYYQx’ for quarters and 'YYYYMM' for months.

#### Specific points in time

For example, specific dates when data values were collected.

| Format in data table | Example    | How it will appear on website |
| :------------------- | :--------- | :---------------------------- |
| DD/MM/YYYY           | 01/01/2022 | 1 January 2022                |
| DD-MM-YYYY           | 01-01-2022 | 1 January 2022                |
| YYYY-MM-DD           | 2022-01-01 | 1 January 2022                |
| YYYYMMDD             | 20220101   | 1 January 2022                |

### Lookup tables

For dimensions not containing dates, you should prepare your own lookup tables, which you will upload to SW3.

A lookup table tells the system what each of the reference codes used in a relevant dimension represents. It's important that the reference codes in the dimension in the data table **match exactly** with those in the lookup table.

Your lookup table should be in [CSV format](#csv-format) and in one of the following formats.

#### 2-row format (preferred)

| Heading     | What the column contains                                   |
| :---------- | :--------------------------------------------------------- |
| refcode     | Reference codes                                            |
| hierarchy   | Indicate if a value hierarchically relates to other values |
| sort        | Sort order                                                 |
| description | Description                                                |
| lang        | Language used, either 'en' or 'cy'                         |
| note        | Notes                                                      |

Example part of lookup table for tax band code:

| refcode | hierarchy | sort | description | lang | note |
| :------ | :-------- | :--- | :---------- | :--- | :--- |
| A-      |           | 1    | A-          | en   |      |
| A-      |           | 1    | A-          | cy   |      |
| A       |           | 2    | A           | en   |      |
| A       |           | 2    | A           | cy   |      |
| B       |           | 3    | B           | en   |      |

#### Single row format

| Heading        | What the column contains                                   |
| :------------- | :--------------------------------------------------------- |
| refcode        | Reference codes                                            |
| hierarchy      | Indicate if a value hierarchically relates to other values |
| sort           | Sort order                                                 |
| description_en | Description (English)                                      |
| description_cy | Description (Welsh)                                        |
| note_en        | Notes (English)                                            |
| note_cy        | Notes (Welsh)                                              |

Example part of lookup table for tax band code:

| refcode | hierarchy | sort | description_en | description_cy | note_en | note_cy |
| :------ | :-------- | :--- | :------------- | :------------- | :------ | :------ |
| A-      |           | 1    | A-             | A-             |         |         |
| A       |           | 2    | A              | A              |         |         |
| B       |           | 3    | B              | B              |         |         |
| C       |           | 4    | C              | C              |         |         |
| D       |           | 5    | D              | D              |         |         |

#### Headings and notes

It is important **these specific column headings** are used.

Lookup table notes can be provided, but **are not currently shown in the consumer view** in SW3. If notes contain important information, you should ensure this information is also provided in the most appropriate [metadata section](#metadata).

### Dimension names

When you add reference data in SW3, you’ll also need to add what you want the dimension to be called on the consumer side.

Dimension names should be:

- concise and clearly explain what the dimension contains
- in sentence case, except for proper nouns, for example 'Local authorities'

## Measure or data types

A measure, or data type, indicates what the data value represents. You **must** include a column for this in your data table, even if there is only one type of measure in your dataset. Including measures helps consumers better understand the data in your dataset.

For a dimension containing measures, you should prepare your own lookup table, which you will upload to SW3. It should be in the same format as other [lookup tables](#lookup-tables), with the following additional columns:

| Heading | What the column contains                                                                                                                                                                                                                                                                                     |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type    | Any of the following:<ul><li>count</li><li>percentage</li><li>rate</li><li>rank</li><li>numerator</li><li>denominator</li><li>index value</li><li>mode</li><li>median</li><li>mean</li><li>standard deviation</li><li>variance</li><li>quartile</li><li>quintile</li><li>decile</li><li>percentile</li></ul> |
| format  | Any of the following:<ul><li>decimal</li><li>float</li><li>integer</li><li>long</li><li>percentage</li><li>string</li><li>text</li><li>date</li><li>datetime</li><li>time</li></ul>                                                                                                                          |
| decimal | Number of decimal places to show, if relevant                                                                                                                                                                                                                                                                |

Example measure lookup table for our council tax example:
| refcode | type | format | sort | description_en | description_cy |
| :- | :- | :- | :- | :- | :- |
| 1 | count | decimal | 1 | Council tax in £ | Treth cyngor mewn £ |
| 2 | percentage | percentage | 2 | % of median monthly salary | % o ganolrif cyflog misol |
| 3 | rank | integer | 3 | Rank of council tax band | Safle band treth gyngor |

_Please note this example is for demonstration purposes only and is not a genuine lookup table for council tax data._

## Notes

### Data value notes (formerly footnotes and missing data)

You should only add a note to a specific data value if it's necessary to understand the data. However, **you must include a column for note codes** in your data table, even if you do not have any note codes to include.

SW3 uses shorthand note codes, with standardised explanations, closely following [public sector standards](https://analysisfunction.civilservice.gov.uk/policy-store/symbols-in-tables-definitions-and-help/). These are as follows:

| Shorthand <br>(Not case sensitive) | Meaning                  | Use                                                                                                                                                                                                                                     |
| :--------------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a                                  | Average                  | When a data value is an average of other values                                                                                                                                                                                         |
| c                                  | Confidential information | For example, if a data value has been suppressed because you could identify details about specific people from the data.<br><br>_Note that there is no way in SW3 to mask or suppress values, so this must be done in your data table._ |
| e                                  | Estimated                | When a data value is an estimated value                                                                                                                                                                                                 |
| f                                  | Forecast                 | When a data value is a calculated future value instead of an observed value                                                                                                                                                             |
| k                                  | Low figure               | A low figure that appears as a zero when rounded                                                                                                                                                                                        |
| p                                  | Provisional              | When a data value is yet to be finalised, or is expected to be revised                                                                                                                                                                  |
| r                                  | Revised                  | When a data value has been revised since it was first published                                                                                                                                                                         |
| t                                  | Total                    | When a data value is a total of other values                                                                                                                                                                                            |
| u                                  | Low reliability          | When a data value is of low statistical quality                                                                                                                                                                                         |
| x                                  | Missing data             | For example, where a data value is not collected in a region                                                                                                                                                                            |
| z                                  | Not applicable           | For example, in tables of employment where people under 16 cannot legally be employed                                                                                                                                                   |

If you need to provide any custom explanations to clarify any note codes used, these should be provided in the most appropriate [metadata section](#metadata).

If you need to add multiple note codes to a single data value, these should be comma separated, for example ‘p,f’.

### Other notes

All other notes about dimensions or the dataset should be provided in the most appropriate [metadata section](#metadata).

## Metadata

Before you create a new dataset in SW3, you should prepare all the related metadata you need. You should provide this **all in the same language**. This should be whichever language you’ll use when using SW3, either English or Welsh. Translations of metadata into the other language are [processed with all other translations](Creating-a-new-dataset-in-SW3#translations).

You can use bullet points to help present content (if needed), but you should:
- use '* ' at the start of each bullet - this will be styled properly by the system
- keep to one sentence per bullet
- not end bullets with punctuation or conjuctions like 'or'
- try to use a different word at the beginning of each bullet

If you use a lead-in line to your bullet list (like in the bullet list above), each bullet should form a complete sentence with the lead-in line.

The following is all the metadata you’ll need to provide.

### Title

- The title that will appear with the dataset on the StatsWales website
- Should be short, descriptive and unique
- The system will tell you if you enter a title that is already in use by a live, published dataset

### Summary

- In short, simple sentences explain what this dataset is about and what it shows
- Describe which dimensions have been used and, if needed, why they’ve been used
- This should ideally not be more than 2-3 paragraphs long
- Anything related to data collection or data quality should not be included, and be kept to their respective sections

### Data collection or calculation

In short, simple sentences explain either:

- the methodology used to collect the data
- the methodology used to calculate the data
- both of the above

### Statistical quality

In short, simple sentences explain any issues or methodological changes related to the dataset including any:

- notes relevant to all data values in the dataset
- custom explanations needed to clarify any data value note codes used

If available, you can include a **high-level summary** of the statistical quality report. You should add a link to the report in the ‘Related reports’ section, not as a link here.

#### Rounding applied

There is also a subsection within this section to indicate if any rounding has been applied, and if it has, explain it in short, simple sentences.

### Data sources

This is split into data providers, such as ‘Office for National Statistics (ONS)’, and sources from those data providers, such as ‘2021 Census’. In some instances, you may only know the data provider and not a specific source from that provider, for example ‘Health Behaviours in School-aged Children (HBSC)’.

You can add multiple sources if required.

The [list of data providers and sources [link TBD]](#) is centrally managed. If you need to have a data provider or source added to the list, you need to:

- email ... at ... [process TBD]
- provide the name of the data provider and source in both English and Welsh

You’ll be notified once the data provider and source have been added to the list. You’ll then be able to select them in SW3.

### Related reports

You should provide links to any related reports, which may include:

- GOV.WALES statistics and research releases
- statistical quality reports
- other related work

You need to provide the URL of the report, and the link text that will appear on the webpage. The link text should be the title or a short description of the report, not the URL.

If there are different URLs for the report for different languages, you should provide both URLs. The link text should clearly state what language the linked report is in. For example you might add these two links:

- GOV.WALES statistics and research releases (English)
- GOV.WALES statistics and research releases (Welsh)

### How often the dataset is updated

Indicate whether the dataset will be regularly updated or not - either because it’s one-off data or it’s stopped being updated. You have the option to provide the period between updates in days, weeks, months, quarters or years.

### Designation

There are [different types of official statistics designations](https://uksa.statisticsauthority.gov.uk/about-the-authority/uk-statistical-system/types-of-official-statistics/). The definition of each of these are:

| Designation                                                           | What it means                                                                                                                                                                                  |
| :-------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official statistics                                                   | Statistics produced by Crown bodies and other organisations listed within an Official Statistics Order, on behalf of the UK government or devolved administrations                             |
| Accredited official statistics (formerly National Statistics)         | Official statistics that the Office for Statistics Regulation (OSR) has independently reviewed and confirmed comply with the standards of trustworthiness, quality and value                   |
| Official statistics in development (formerly experimental statistics) | Official statistics that are undergoing a development; they may be new or existing statistics, and will be tested with users, in line with the standards of trustworthiness, quality and value |
| No designation                                                        | Any other statistics                                                                                                                                                                           |

### Relevant topics

There are 13 high-level topics, most of which have multiple secondary topics. A **single topic tag** consists of ‘high-level + secondary topic’. The only exceptions are the ‘Tourism’ and ‘Welsh language’ topic tags which are high level only.

For example a healthcare related dataset may be tagged to a single topic tag ‘Environment, energy and agriculture: Farming’. Or it could also be tagged to a second topic tag of ‘Business, economy and labour market: Business’. You should select as many topics as are relevant to the dataset.

This selection will allow consumers to more easily locate and identify datasets of interest to them. It’s important to consider the different ways consumers may categorise what a dataset covers.

**Business, economy and labour market**

- Business
- Economic indices
- Employment
- Gross disposable household income
- Gross value added
- Research and development

**Crime, fire and rescue**

- Crime and justice
- Fire and rescue incidents
- Fire services
- Police

**Education and training**

- Apprenticeships
- Further education
- Higher education
- Lifelong learning
- Pupils
- Schools
- Student support
- Teachers and support staff
- Youth work

**Environment, energy and agriculture**

- Air quality
- Energy
- Farming
- Flooding
- Fly-tipping
- Greenhouse gases
- Land
- Waste management

**Finance and tax**

- Capital
- Council tax
- Land transaction tax
- Landfill disposals tax
- Non-domestic rates (business rates)
- Revenue
- Settlement

**Health and social care**

- Ambulance services
- Children
- Coronavirus (COVID-19)
- Dental services
- Health finance
- Hospital and other care setting activity
- General practice
- Maternity, births and conceptions
- Mental health
- Performance and waiting times
- Primary care and community services
- Staff
- Social care and day care
- Social services
- Substance misuse

**Housing**

- Affordable housing
- Demolitions
- Disabled facilities grants
- Hazards, licences and housing quality
- Help to buy
- Homelessness
- Household numbers
- Housing improvement
- Housing stock and need
- New house building
- Possessions and evictions
- Private sector rents
- Social housing
- Traveller caravan count

**People, identity and equality**

- Age
- Disability
- Ethnicity
- Gender identity
- Language
- Marital status
- Migration
- National identity
- Population
- Pregnancy and maternity
- Religion
- Sex
- Sexual orientation
- Socio-economic status

**Poverty**

- Communities First
- Deprivation
- Discretionary assistance fund
- Income poverty

**Tourism**

**Transport**

- Air
- Rail
- Road
- Sea

**Welsh and local government**

- Electoral register
- Government workforce
- Local authority performance
- Senedd constituencies

**Welsh language**
