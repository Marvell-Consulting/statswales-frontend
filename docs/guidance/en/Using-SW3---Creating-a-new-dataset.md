# Using SW3 ‐ Creating a new dataset

## Data

From your home screen, click ‘Create new dataset’. Using your [prepared data](Data-preparation-‐-New-datasets#guidance-data-tables), you’ll go through the following steps:

1. Add title
1. Upload your data table
1. Indicate what each column in the data table contains, either:
   - data values
   - a dimension
   - measure or data types
   - note codes

You'll then be taken to your dataset tasklist. It will list all the dimensions you indicated, except note codes as these are standardised. 

Clicking on each dimension will let you select what kind of data the dimension contains. This will be either:
- dates - you'll then answer questions about the date formatting used
- geography - the system will then add the standardised reference data
- text, [where no lookup table is needed](Data-preparation-‐-New-datasets#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required) 
- numbers, [where no lookup table is needed](Data-preparation-‐-New-datasets#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required) - you'll then need to indicate the kind of numbers used
   - For this option, the dimension must only contain numbers, with no symbols or letters
- something else - you'll then need to upload your own lookup table

For each option you'll be asked to enter a name for the dimension to be called on the StatsWales website. The name should be:
- concise and clearly explain what the dimension contains
- different to other dimension names in the dataset

For a dimension containing measure or data types, when you click on it from your dataset tasklist, you'll then need to upload the [appropriate lookup table](Data-preparation-‐-New-datasets#guidance-measure-or-data-types).

### Date formatting questions

For [dimensions containing dates](Data-preparation-‐-New-datasets#guidance-date-formatting), you’ll be asked whether the dimension contains either:
- periods - for example, months or years for which data values apply to
- specific points - for example, specific dates when data values were collected

For periods you’ll be asked:
- the type of year the dimension represents
- the date format used for years
- whether the shortest period in the dimension are months, quarters or years
- the date format used for months or quarters (if relevant)

For specific points you’ll just be asked for the date format used.

### Errors

The system will check whether the selected or uploaded reference data, or the indicated date formatting, match the contents of your data table. If there are any issues, the system will try to explain them and what you need to do to fix them.

For example, if you have used a reference code in your data table that isn’t in the lookup table you uploaded.

### Making changes

From your dataset tasklist, if you click on ‘Data table’, you can:

- upload a different data table
- change what each column in the data table contains

Be advised, both of these actions will remove all reference data from all dimensions.

If you click on a dimension, you can either:

- replace the uploaded lookup table (as applicable)
- change what kind of data the dimension contains
- change the name of the dimension

## Metadata

You should add all [prepared metadata](Data-preparation-‐-New-datasets#guidance-metadata) to the appropriate sections. This can be done in any order. You can go back to any section by clicking on it from your dataset tasklist.

## Translations

Once you’ve completed all text entry fields, you’ll be able to export all the text into a single CSV file. This CSV will be used to input all required translations of either Welsh or English, depending on which language you’ve completed all fields in.

1. From your dataset tasklist, click ‘Export text fields for translation’
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

When opening the exported translation CSV in software such as Excel, text fields with multiple paragraphs may split across multiple cells. If this happens, you should ensure that all text for a specific section, in one language, is in a single cell.

Once you have the completed CSV: 
1. select ‘Import translations’ from your dataset tasklist
1. upload the CSV and check the translations have uploaded correctly
1. click ‘Continue’ to populate all fields appropriately

You can now preview your dataset fully in both English and Welsh.

## Publishing

### Publisher organisation and team

Select your organisation and team. Teams have a set contact email address associated with them.

The [list of teams and associated emails [link TBD](#)] is centrally managed. If you need to have a team in the list added or changed, you need to:

- email ... at ... [process TBD]
- provide the team and its email address in both English and Welsh

### When the dataset should be published

Indicate what date and time the dataset should be published. Consider how long the dataset will take to be approved once you've submitted it. Set the publishing date far enough in the future to allow for this.

The publishing time is 9:30am by default. You should only change this if a different time is absolutely necessary.

### Submit

Submit the dataset for publishing on selected publishing date.
