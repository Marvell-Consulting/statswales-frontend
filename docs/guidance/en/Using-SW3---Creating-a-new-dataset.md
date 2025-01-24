# Using SW3 - Creating a new dataset

## Data

From your home screen, click ‘Create new dataset’. Using your [prepared data](Data-preparation-‐-New-datasets#guidance-data-tables), you’ll go through the following steps:

1. Add title
1. Upload your data table
1. Indicate what each column in the data table contains, either:
   - data values
   - a dimension
   - a dimension containing dates
   - measure or data types
   - note codes
1. Add reference data for each dimension
   - For dimensions containing dates, answer the questions about date formatting
   - Name the dimensions
   - For measure or data types, upload the [appropriate lookup table](Data-preparation-‐-New-datasets#guidance-measure-or-data-types)

### Date formatting

For dimensions containing dates, you’ll need to answer a set of questions about the date format used.

1. Whether the values in them represent either:
   - periods of time - for example, months or years for which data values apply to
   - specific points in time - for example, specific dates when data values were collected
1. For periods of time you’ll be asked:
   - whether the periods of time are months, quarters or years
   - [the date format used](Data-preparation-‐-New-datasets#guidance-date-formatting) for months, quarters or years (as appropriate)
1. For specific points in times you’ll just be asked for the date format used
1. Lastly you’ll need to select [the type of year](Data-preparation-‐-New-datasets#guidance-year-type) the dimension covers.

### Errors

When you select the reference data or indicate the date formatting used, the system will automatically check it against the contents of your data table. If there are any issues at this point, the system will try to explain the issue and what you need to do to fix it.

For example, if you have used a geographic reference code in your data table that isn’t in the standardised geography lookup tables.

### Making changes

From your dataset overview, if you click on ‘Data table’, you can:

- upload a different data table - this will remove reference data from all dimensions
- change what each column in the data table contains - this will remove reference data for any columns that contain dimensions that you change

If you click on a dimension, you can either:

- select different reference data
- change the date formatting (as applicable)
- change the dimension name (as applicable)

## Metadata

You should add all [prepared metadata](Data-preparation-‐-New-datasets#guidance-metadata) to the appropriate sections. This can be done in any order. You can go back to any section by clicking on it from your dataset overview.

## Translations

Once you’ve completed all text entry fields, you’ll be able to export all the text into a single CSV file. This CSV will be used to input all required translations of either Welsh or English, depending on which language you’ve completed all fields in.

1. From your dataset overview, click ‘Export text fields for translation’
1. You’ll be shown all relevant text and will be able to make any final changes, if needed
1. In summary, all possible text fields are:
   - dimension names
   - title
   - summary
   - data collection
   - statistical quality
   - rounding applied
   - related report link text(s)
1. Click ‘Export CSV’ to download a table containing columns for:
   - Text field name
   - Text (English)
   - Text (Welsh)
1. The column for whichever language you’ve been using will be populated
1. You should send this CSV to your translator to enter the required translations, or enter the translations yourself if you have them
1. Once you have the completed CSV, select ‘Import translations’ from your dataset overview
1. Upload the CSV and check the translations have uploaded correctly
1. Clicking ‘Continue’ will populate all fields appropriately
1. You can now preview your dataset fully in both English and Welsh

## Publishing

### Publisher organisation and team

Select your organisation and team. Teams have a set contact email address associated with them.

The [list of teams and associated emails [link TBD](#)] is centrally managed. If you need to have a team in the list added or changed, you need to:

- email ... at ... [process TBD]
- provide the team and its email address in both English and Welsh

#### Dataset ID

Once you select a team, this will generate the ID for your dataset. The ID consists of a unique combination of the 4 letter code for your team and 4 numbers. For example, TRAN2001 for a ‘Transport’ dataset.

### When the dataset should be published

Indicate what date and time the dataset should be published.

- Date must be at least X days from when you create the dataset in SW3
- Time is 9:30am by default - only change this if a different time is absolutely necessary

### Submit

Submit the dataset for publishing on selected publishing date.
