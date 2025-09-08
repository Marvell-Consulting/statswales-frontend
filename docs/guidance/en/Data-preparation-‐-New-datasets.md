# Data preparation: New datasets

Datasets consist of a set of statistics and their associated metadata. The dataset is built in SW3 as a data cube from a data table and reference, or lookup, data.

## Data tables

For new datasets you need to have a data table. The table should preferably be in [CSV format](#guidance-file-format) and must contain columns for:

- data values (including rows for any calculated [totals or averages](#guidance-totals-and-averages) you want to include)
- all relevant dimensions and [reference codes](#guidance-reference-data)
- [measure or data types](#guidance-measure-or-data-types)
- [standardised shorthand](#guidance-notes) note codes to label specific data values - **you must include this column**, even if you do not have any note codes to include

In this guidance, we’ll be using the example scenario of data for council tax bands. Here are example rows of a data table for this scenario:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure | Data   |
| :-------- | :------- | :------- | :-------- | :------ | :----- |
| W06000001 | 202425   | A-       |           | 1       | 256.88 |
| W06000001 | 202425   | A        | x         | 1       |        |
| W06000001 | 202425   | B        |           | 1       | 359.64 |
| W06000001 | 202425   | C        | e         | 1       | 411.01 |
| W06000001 | 202425   | D        |           | 1       | 462.39 |

### File format

The preferred file format is a CSV with:

- values separated by commas
- headings in the first row
- " " used for quote marks, if needed
- columns in any order
- numeric data values - these can contain decimal points and minus symbols but no other characters such as commas or percentage signs

If a data value is not available or not applicable, you should:

- leave the cell blank
- enter a [standard note code](#guidance-notes) in the note codes column, indicating whether the data value is not available (x) or not applicable (z)

The preferred format for CSVs is UTF-8, as this works better with any special characters used. This format should be an option in the software you use to generate CSVs, and may be under 'text encoding' or similar. In Excel, 'CSV UTF-8' is under common formats in the 'Save as' options.

Whilst CSVs are the recommended format, the system can also accept JSON, Parquet and Excel XLSX formats as well.

### Headings

Column headings should have meaningful names, so that you know what each column contains. This will be important when [uploading your CSV](Using-SW3---Creating-a-new-dataset) into SW3. They can have spaces between words if required.

### Duplicate or incomplete facts

A fact is a unique combination of dimensional values in 1 row of the data table. For example, AreaCode W06000001, YearCode 202425, BandCode A- and Measure 1. There can only be a single data value for each unique fact.

The data table cannot contain incomplete facts. All facts must be populated for all dimensions, except [note codes](#guidance-notes) and data values which should be populated as appropriate.

If you upload a data table with duplicate or incomplete facts, the system will detail which facts need removing or correcting.

### Totals and averages

You should include rows in your data table for any totals or averages you want to include with the dataset. This includes any subtotals and grand totals. The rows should contain:

- totals or averages
- correct [references codes](#guidance-reference-data) or [date formats](#guidance-date-formatting)
- a [standard note code](#guidance-notes) indicating whether the data value is a total (t) or an average (a)

In our council tax example, the AreaCode dimension refers to local authorities. If you wanted to include a total or average for the whole of Wales, you would need to include a row containing:

- the total or average
- the reference code for Wales [W92000004]
- either a ‘t’ or 'a' note code

If your data contains multiple hierarchies, you can provide multiple totals or averages. For example, a total for each economic region and a total for Wales.

### Column ordering

The order of columns in your data table file will affect the ordering of the data table consumers will download. This ordering will be based on the sort orders defined by each dimension's reference data. In our council tax example above, the data table would first be sorted by local authority (AreaCode), then year (YearCode), then council tax band (BandCode), then measure.

## Reference data

When you build your dataset in SW3, you’ll need to select reference data for each dimension in your data table. In our example table, this would mean selecting lookup tables for ‘AreaCode’ and ‘BandCode’, and confirming date formats for 'YearCode'. You do not need to add lookup tables for [data value notes](#guidance-notes).

### Standardised reference data

Standardised, centrally-managed reference data will help:

- ensure better consistency across StatsWales
- standardise English and Welsh descriptions
- improve usability for data consumers

Standardised lookup tables are currently being implemented. For now, you should [prepare your own lookup tables](#guidance-lookup-tables), using commonly used codes and descriptions where possible, with possible exceptions for some [dimensions containing text or numbers](#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required).

<!-- SW3 currently has standardised, centrally-managed lookup tables for geography only. -->

SW3 does not use lookup tables for dimensions containing dates. Instead there is a [standardised approach to formatting](#guidance-date-formatting).

<!-- For any other dimension type, you should [prepare your own lookup table](#guidance-lookup-tables), with possible exceptions for some [dimensions containing text or numbers](#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required). -->

<!-- ### Geography

The system contains standardised lookup tables for all commonly used geographies, as provided by the [ONS Open Geography portal](https://geoportal.statistics.gov.uk/). You can download these lookup tables as CSVs from the ['Reference data' section [link TBD]](#) of this service. You must use the codes in these tables when creating your data tables.

You will not need to upload these standardised lookup tables when you build your dataset in SW3. You will only need to tell the system which geography you've used.

You can only use one geography hierarchy in a dimension. For example, you couldn't have local authorities and Senedd constituencies in the same dimension. But you could have local authorities and local health boards, as these are part of a single hierarchy.

There may be rare circumstances where the standardised tables do not contain the appropriate data for your dataset. For example, if you need to aggregate certain geographical areas for confidentiality reasons. In these cases you should [prepare your own lookup tables](#guidance-lookup-tables). -->

<!-- You'll also need to provide the reason you've not used a standard table. This reason will be visible to the consumer as part of the 'Geographical areas covered' metadata section. -->

### Date formatting

When you build your dataset in SW3, you’ll need to [indicate the date formats you’ve used](Using-SW3---Creating-a-new-dataset#guidance-date-formatting-questions) in your data table. SW3 can only accept certain date formats.

#### Specific points in time

For example, specific dates when data values were collected.

| Format in data table | Example    | How it will appear on website |
| :------------------- | :--------- | :---------------------------- |
| DD/MM/YYYY           | 01/01/2022 | 1 January 2022                |
| DD-MM-YYYY           | 01-01-2022 | 1 January 2022                |
| YYYY-MM-DD           | 2022-01-01 | 1 January 2022                |
| YYYYMMDD             | 20220101   | 1 January 2022                |

#### Standard periods of time

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

- calendar (1 January to 31 December)
- meteorological (1st March to 28th or 29th February)
- financial (1 April to 31 March)
- tax (6 April to 5 April)
- academic (1 September to 31 August)
- other (any other start date)

If you do not know the type of year the dimension covers, you should contact the data collector for your dataset. If you're unable to get this information, you should make your best assumption. Based on your knowledge of the dataset and other datasets like it.

##### Multiple periods in the same dataset

Your dataset can contain data for multiple time periods. For example, monthly values with quarterly and yearly totals.

You **must use consistent year formatting** for all time periods present in the dataset. For example if you use ‘YYYY’ for years, you could use ‘YYYYQx’ for quarters and 'YYYYMM' for months.

#### Rolling or overlapping periods of time

There may be circumstances where the periods of time in your dataset overlap. For example, where your data values represent cumulative values up to a specific date, such as the amount for the year ending 30th June, then the amount for year ending 31st July, and so on. In these cases you should use the following formatting:

- a prefix of either YE, QE, ME or WE for year ending, quarter ending, month ending or week ending
- then any of the specific date formats described in the '[Specific points in time](#guidance-specific-points-in-time)' section

Examples:

| Format in data table | Example      | How it will appear on website |
| :------------------- | :----------- | :---------------------------- |
| YEYYYY-MM-DD         | YE2022-03-31 | Year ending 31 March 2022     |
| QEYYYY-MM-DD         | QE2022-05-30 | Quarter ending 30 May 2022    |
| MEDD-MM-YYYY         | ME15-03-2022 | Month ending 15 March 2022    |
| WEDD-MM-YYYY         | WE25-03-2022 | Week ending 25 March 2022     |

#### Non-standard periods

There may be very rare circumstances where these standardised formats are not appropriate for the data in your dataset. In these cases you should [prepare your own lookup tables](#guidance-lookup-tables).

<!-- In these cases you should [prepare your own date lookup tables](#guidance-date-lookup-tables).

You'll also need to provide the reason you've not used the standard formatting. This reason will be visible to the consumer as part of the 'Time period covered' metadata section. -->

### Lookup tables

For dimensions not containing dates or geography, you should prepare your own lookup tables. You will upload these to SW3.

A lookup table tells the system what each of the reference codes used in a relevant dimension represents. It's important that the reference codes in the dimension in the data table **match exactly** with those in the lookup table.

Your lookup table should be preferably in [CSV format](#guidance-file-format) and in one of the following formats.

#### 2-row format (preferred)

| Heading     | What the column contains                                   | Always required                                         |
| :---------- | :--------------------------------------------------------- | :------------------------------------------------------ |
| refcode     | Reference codes                                            | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| description | Description                                                | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| lang        | Language used, either 'en' or 'cy'                         | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| hierarchy   | Indicate if a value hierarchically relates to other values | <strong class="govuk-tag govuk-tag--red">No</strong>    |
| sort        | Sort order                                                 | <strong class="govuk-tag govuk-tag--red">No</strong>    |
| note        | Notes                                                      | <strong class="govuk-tag govuk-tag--red">No</strong>    |

Example part of lookup table for tax band code:

| refcode | description   | lang | sort |
| :------ | :------------ | :--- | :--- |
| A-      | Tax band A-   | en   | 1    |
| A-      | Band treth A- | cy   | 1    |
| A       | Tax band A    | en   | 2    |
| A       | Band treth A  | cy   | 2    |
| B       | Tax band B    | en   | 3    |

#### Single row format

| Heading        | What the column contains                                   | Always required                                         |
| :------------- | :--------------------------------------------------------- | :------------------------------------------------------ |
| refcode        | Reference codes                                            | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| description_en | Description (English)                                      | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| description_cy | Description (Welsh)                                        | <strong class="govuk-tag govuk-tag--green">Yes</strong> |
| hierarchy      | Indicate if a value hierarchically relates to other values | <strong class="govuk-tag govuk-tag--red">No</strong>    |
| sort           | Sort order                                                 | <strong class="govuk-tag govuk-tag--red">No</strong>    |
| note_en        | Notes (English)                                            | <strong class="govuk-tag govuk-tag--red">No</strong>    |
| note_cy        | Notes (Welsh)                                              | <strong class="govuk-tag govuk-tag--red">No</strong>    |

Example part of lookup table for tax band code:

| refcode | description_en | description_cy | sort |
| :------ | :------------- | :------------- | :--- |
| A-      | Tax band A-    | Band treth A-  | 1    |
| A       | Tax band A     | Band treth A   | 2    |
| B       | Tax band B     | Band treth B   | 3    |
| C       | Tax band C     | Band treth C   | 4    |
| D       | Tax band D     | Band treth D   | 5    |

#### Column headings

It is important **these specific column headings** are used.

#### Hierarchies

Use the 'hierarchy' column to indicate whether a dimension value is hierarchically below another value. For example, if tax bands were divided into sub-bands such as 'A1', 'A2' and 'A3', the 'hierarchy' column for each of these sub-bands would have an 'A' in it. The 'hierarchy' column should only contain reference codes used in the 'refcode' column.

Example part of lookup table for tax bands codes with a 3-level hierarchy:

| refcode | description_en | description_cy | hierarchy | sort |
| :------ | :------------- | :------------- | :-------- | :--- |
| A       | Tax band A     | Band treth A   |           | 14   |
| A1      | Tax band A1    | Band treth A1  | A         | 15   |
| A1a     | Tax band A1a   | Band treth A1a | A1        | 16   |
| A1b     | Tax band A1b   | Band treth A1b | A1        | 17   |
| A1c     | Tax band A1c   | Band treth A1c | A1        | 18   |

There is no limit to how many levels a hierarchy can have. However, a dimension value can only relate to a single value above it in the hierarchy. For example, sub-band 'A1' could not sit below both 'A' and 'A-'.

If you have a hierarchy you don't know how to implement, email richard.davies3@gov.wales for support.

#### Descriptions

Descriptions of all dimension values should be:

- concise and clearly explain what the dimension value represents
- in sentence case, except for proper nouns, for example 'Doses allocated to Wales'
- unique and distinct from each other
- provided in both English and Welsh

#### Lookup table notes

Lookup table notes can be provided, but **are not currently shown in the consumer view** in SW3. If notes contain important information, you should ensure this information is also provided in the most appropriate [metadata section](#guidance-metadata).

<!-- #### Date lookup tables

In the rare circumstance where you need to upload a date lookup table, this should be in the same format as other lookup tables, with the following additional columns:

| Heading | What the column contains                                  |
| :------ | :-------------------------------------------------------- |
| start   | Date the period starts in ISO format, yyyy-mm-ddThh:mm:ss |
| end     | Date the period ends in ISO format, yyyy-mm-ddThh:mm:ss   |

Example date lookup table:

| refcode | start      | end        | sort | description_en | description_cy |
| :------ | :--------- | :--------- | :--- | :------------- | :------------- |
| 2022    | 2022-06-01 | 2022-08-31 | 1    | Summer 2022    | Haf 2022       |
| 2023    | 2023-06-01 | 2023-08-31 | 2    | Summer 2023    | Haf 2023       |
| 2024    | 2024-06-01 | 2024-08-31 | 3    | Summer 2024    | Haf 2024       | -->

### Dimensions containing text or numbers where no lookup table is required

No lookup table is required if the dimension values used in the data table can be used directly as descriptions. This is only the case if:

- dimension values consist of letters, numbers or symbols that are the same in English and Welsh
- a sort order does not need to be stated
- no hierarchies and notes are needed

For example, in our council tax example if the descriptions only needed to be 'A', 'B' etc, instead of 'Tax band A', 'Tax band B' etc. Or as another example, if age in years was used as dimension values, such as '18', '19' etc.

### Dimension names

When you add reference data in SW3, you’ll also need to add what you want the dimension to be called on the consumer side.

Dimension names should be:

- concise and clearly explain what the dimension contains
- in sentence case, except for proper nouns, for example 'Local authorities'

## Measure or data types

A measure, or data type, indicates what the data value represents. You **must** include a column for this in your data table, even if there is only one type of measure in your dataset. Including measures helps consumers better understand the data in your dataset.

For a dimension containing measures, you should prepare your own lookup table. You will upload this to SW3. It should be in the same format as other [lookup tables](#guidance-lookup-tables), with the following additional columns:

| Heading | What the column contains                                                                                                                                                                                                                                                                                     |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type    | Any of the following:<ul><li>count</li><li>percentage</li><li>rate</li><li>rank</li><li>numerator</li><li>denominator</li><li>index value</li><li>mode</li><li>median</li><li>mean</li><li>standard deviation</li><li>variance</li><li>quartile</li><li>quintile</li><li>decile</li><li>percentile</li></ul> |
| format  | Any of the following:<ul><li>decimal</li><li>float</li><li>integer</li><li>long</li><li>percentage</li><li>string</li><li>text</li><li>date</li><li>datetime</li><li>time</li></ul>                                                                                                                          |
| decimal | If 'decimal' or 'float' has been entered for 'format':<ul><li>enter the number of decimal places to show</li><li>if nothing is entered, numbers will be rounded to the nearest whole number</li><ul>                                                                                                         |

Example measure lookup table for our council tax example:

| refcode | type       | format     | decimal | sort | description_en             | description_cy              |
| :------ | :--------- | :--------- | :------ | :--- | :------------------------- | :-------------------------- |
| 1       | count      | decimal    | 2       | 1    | Council tax in £           | Treth gyngor mewn £         |
| 2       | percentage | percentage |         | 2    | % of median monthly salary | % y cyflog misol canolrifol |
| 3       | rank       | integer    |         | 3    | Rank of council tax band   | Safle band treth gyngor     |

_Please note this example is for demonstration purposes only and is not a genuine lookup table for council tax data._

Descriptions should clearly define what the data value represents. This should include the:

- type of measure, such as 'number of' or 'rank of'
- thing the measure represents, such as 'children' or 'businesses'

For example, 'Number of children born' or 'Rank of business performance'. The data description should be worded in a way that makes each row of the data table make sense as a user 'reads' it. For example, "There were 3,855 children born in Cardiff in 2021".

Note that data values in the data table only show numbers. So for example for a percentage of '35%', the data value should be '35' and the measure description should make it clear that it's a percentage, such as '% of all children in Wales'.

## Notes

### Data value notes (formerly footnotes and missing data)

<!-- #### Standardised notes -->

You should only add a note to a specific data value if it's necessary to understand the data. However, **you must include a column for note codes** in your data table, even if you do not have any note codes to include.

SW3 uses shorthand note codes, with standardised explanations, closely following [public sector standards](https://analysisfunction.civilservice.gov.uk/policy-store/symbols-in-tables-definitions-and-help/). The codes are not case sensitive.

| Shorthand | Meaning                                          | Use                                                                                                                                                                                                                            |
| :-------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a         | Average                                          | When a data value is an average of other values                                                                                                                                                                                |
| b         | Break in time series                             | When there is a break in a data series that means that data before the break cannot be directly compared with data after the break                                                                                             |
| c         | Confidential information                         | For example, if a data value has been suppressed because you could identify details about specific people from the data. Note that there is no way in SW3 to mask or suppress values, so this must be done in your data table. |
| e         | Estimated                                        | When a data value is an estimated value                                                                                                                                                                                        |
| f         | Forecast                                         | When a data value is a calculated future value instead of an observed value                                                                                                                                                    |
| k         | Low figure                                       | A low figure that appears as a zero when rounded                                                                                                                                                                               |
| ns        | Not statistically significant                    | When it's not possible to determine if a data value is reliable or not                                                                                                                                                         |
| p         | Provisional                                      | When a data value is yet to be finalised, or is expected to be revised                                                                                                                                                         |
| r         | Revised                                          | When a data value has been revised since it was first published                                                                                                                                                                |
| s         | Statistically significant at 0.05 or 5% level    | When there's a less than 5% chance a data value is unreliable                                                                                                                                                                  |
| ss        | Statistically significant at 0.01 or 1% level    | When there's a less than 1% chance a data value is unreliable                                                                                                                                                                  |
| sss       | Statistically significant at 0.001 or 0.1% level | When there's a less than 0.1% chance a data value is unreliable                                                                                                                                                                |
| t         | Total                                            | When a data value is a total of other values                                                                                                                                                                                   |
| u         | Low reliability                                  | When a data value is of low statistical quality                                                                                                                                                                                |
| w         | None recorded in survey                          | When no people are estimated to be in a category                                                                                                                                                                               |
| x         | Not available                                    | For example, where a data value is not collected in a region                                                                                                                                                                   |
| z         | Not applicable                                   | For example, in tables of employment where people under 16 cannot legally be employed                                                                                                                                          |

If you need to add multiple note codes to a single data value, these should be comma separated, for example ‘p,f’.

Any custom explanations you feel are needed to clarify any note codes, should be provided in the most appropriate [metadata section](#guidance-metadata). For example, if you need to explain multiple reasons why data values have been suppressed.

<!-- #### Custom notes

If it's necessary to clarify any of the standard note codes used, you can add custom explanations. This involves:
- adding a number to the standard code in the note code column, for example 'p1' or 'x1'
- preparing a data value notes lookup table

The data value notes lookup table should have columns for notecode, description_en and description_cy.

Example lookup table for our council tax example:

| notecode | description_en | description_cy |
| :------- | :------------- | :------------- |
| p1       | Data value is provisional as the council tax amount has not been finalised for this band for 2025-26 | Mae’r gwerth data yn amodol gan nad yw swm y dreth gyngor wedi cael ei gadarnhau ar gyfer y band hwn ar gyfer 2025-26 |
| x1       | Data value is not available because this council tax band did not exist prior to 1997-98 | Nid yw’r gwerth data ar gael gan nad oedd y band treth gyngor hwn yn bodoli cyn 1997-98 |

_Please note this example is for demonstration purposes only and is not a genuine lookup table for council tax data._ -->

### Other notes

All other notes about dimensions or the dataset should be provided in the most appropriate [metadata section](#guidance-metadata).

## Metadata

Before you create a new dataset in SW3, you should prepare all the related metadata you need. You should provide this **all in the same language**. This should be whichever language you’ll use when using SW3, either English or Welsh. Translations of metadata into the other language are [processed with all other translations](Using-SW3---Creating-a-new-dataset#guidance-translations).

### Bullet lists

You can use bullet points to help present content, if needed.

You should enter bullets with an asterisk and a space at the start. For example:

'`* text to appear as a bullet`'

The system will style these as lists with circular bullet points.

You should:

- keep to one sentence per bullet
- not end bullets with punctuation or conjunctions like 'or'
- try to use a different word at the beginning of each bullet

If you use a lead-in line to your bullet list, each bullet should form a complete sentence with the lead-in line. The bullet list above demonstrates this.

### Links

You should provide links to related reports in the dedicated [related reports section](#guidance-related-reports). You should only include a link in any of the text-based metadata sections if it's important for understanding the dataset better.

If you need to include a link, ensure you use them appropriately.

You should enter links with the link text in square brackets followed directly by the link URL in round brackets. For example:

'`[Welsh Government](https://www.gov.wales)`'

The system will style this as a clickable link, that is '[Welsh Government](https://www.gov.wales)'. The URL must start with either 'https://' or 'http://'.

Link text should:

- make it clear what the user will be getting from the link
- avoid directions such as “click here” or “find out more”
- be longer than 1 word, but not a full sentence
- form part of a sentence, not be part of a list of links

### Metadata sections

The following is all the metadata you’ll need to provide.

#### Title

A short, descriptive and unique name for the dataset for the StatsWales website. The system will tell you if you enter a title that is already in use by a live, published dataset.

#### Summary of dataset and variables

This explains what the dataset is about and what it shows. It should:

- use short, simple sentences
- define and describe the variables (dimensions) that have been used
- ideally be no more than 2-3 paragraphs long
- not include anything related to data collection or data quality - this should be in the relevant section instead

#### Data collection or calculation

In short, simple sentences explain either:

- the methodology used to collect the data
- the methodology used to calculate the data
- both of the above

For data collection, try to include:

- specific names and types of data collections used, for example "Form HO 13" instead of "a survey", and why these were used
- enough information for consumers to be able to go and find out more about the specific collection techniques used

For data calculation, try to include whether:

- any [data analysis techniques](https://analysisfunction.civilservice.gov.uk/policy-store/guide-to-gss-statistical-techniques-and-tools/) have been used, such as forecasting or scaling
- a widely recognised standard has been used, or one developed by the publisher

#### Statistical quality

In short, simple sentences explain any issues that significantly affect the data. Where applicable, try to include any:

- quantitative measures of uncertainty
- impact from any of the data sources or analysis techniques used
- explanations needed to clarify any data value note codes used

This section should contain more than 'See the statistical quality report'. If available, you can include a **high-level summary** of the statistical quality report. You should add a link to the report in the ‘Related reports’ section, not as a link here.

##### Rounding applied

There is also a subsection within the statistical quality section to indicate if any rounding has been applied. If it has, explain it in short, simple sentences.

#### Data sources

This is split into data providers and specific data sources. Data providers are the organisations that provide access to the data you use to create your datasets. Such as ‘Office for National Statistics (ONS)’. The data provider should tell you what the specific data source is, such as ‘2021 Census’.

In some instances, you may only know the data provider and not a specific source from that provider. For example ‘Health Behaviours in School-aged Children (HBSC)’.

You can add multiple sources if required.

The list of data providers and sources is centrally managed. If you need to have a data provider or source added to the list, you need to:

- email StatsWales@gov.wales
- provide the name of the data provider and source in both English and Welsh

You’ll be notified once the data provider and source have been added to the list. You’ll then be able to select them in SW3.

#### Related reports

You should provide links to any related reports, which may include:

- GOV.WALES statistics and research releases
- statistical quality reports
- other related work

You need to provide the URL of the report, and the link text that will appear on the webpage. The link text should be the title or a short description of the report, not the URL. The URL should start with either 'https://' or 'http://'.

If there are different URLs for the report for different languages, you should provide both URLs. The link text should clearly state what language the linked report is in. For example you might add these two links:

- GOV.WALES statistics and research releases (English)
- GOV.WALES statistics and research releases (Welsh)

#### How often the dataset is updated

Indicate whether the dataset will be regularly updated or not - either because it’s one-off data or it’s stopped being updated. You have the option to provide the period between updates in days, weeks, months, quarters or years.

#### Designation

There are [different types of statistics designations](https://uksa.statisticsauthority.gov.uk/about-the-authority/uk-statistical-system/types-of-official-statistics/). The definition of each of these are:

| Designation                                                           | What it means                                                                                                                                                                                  |
| :-------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official statistics                                                   | Statistics produced by Crown bodies and other organisations listed within an Official Statistics Order, on behalf of the UK government or devolved administrations                             |
| Accredited official statistics (formerly National Statistics)         | Official statistics that the Office for Statistics Regulation (OSR) has independently reviewed and confirmed comply with the standards of trustworthiness, quality and value                   |
| Official statistics in development (formerly experimental statistics) | Official statistics that are undergoing a development; they may be new or existing statistics, and will be tested with users, in line with the standards of trustworthiness, quality and value |
| Management information                                                | Operational data that provides transparency about an organisation’s activity                                                                                                                   |
| No designation                                                        | Any other statistics                                                                                                                                                                           |

#### Relevant topics

There are 13 high-level topics, most of which have multiple secondary topics. A **single topic tag** consists of ‘high-level + secondary topic’. The only exceptions are the ‘Tourism’ and ‘Welsh language’ topic tags which are high level only.

For example a dataset may be tagged to a single topic tag ‘Environment, energy and agriculture: Farming’. Or it could also be tagged to a second topic tag of ‘Business, economy and labour market: Business’. You should select as many topic tags as are relevant to the dataset.

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
