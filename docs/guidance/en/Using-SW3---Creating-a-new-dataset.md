# Using SW3: Creating a new dataset

## Data

From your home screen, click ‘Create new dataset’. Using your [prepared data](Data-preparation-‐-New-datasets#guidance-data-tables), you’ll go through the following steps.

1. Add title.
1. Upload your data table.
1. Indicate what each column in the data table contains, either:
   - data values
   - a dimension
   - measure or data types
   - note codes

You'll then be taken to your dataset tasklist. It will list all the dimensions you indicated, except note codes as these are standardised.

Clicking on each dimension will let you select what kind of data the dimension contains. This will be either:

<!-- - dates - you'll then answer questions about the date formatting used, or upload your own lookup table if necessary -->

- dates - you'll then answer questions about the date formatting used
<!-- - geography - you'll then select the appropriate standardised reference data, or upload your own lookup table if necessary -->
- geography - you'll then select the appropriate standardised reference data
- text, [where no lookup table is needed](Data-preparation-‐-New-datasets#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required)
- numbers, [where no lookup table is needed](Data-preparation-‐-New-datasets#guidance-dimensions-containing-text-or-numbers-where-no-lookup-table-is-required) - you'll then indicate the kind of numbers used
  - For this option, the dimension must only contain numbers, with no symbols or letters.
- something else - you'll then upload your own lookup table

In the rare instances where you've been unable to use standardised geography or dates, you should select the 'Something else' option and upload your prepared lookup tables.

For most options you'll be asked to enter a name for the dimension to be called on the StatsWales website. The name should be:

- concise and clearly explain what the dimension contains
- different to other dimension names in the dataset

If you select standardised reference data, the dimension name will be automatically populated. You can change this, but you should only do so if absolutely necessary for understanding the dataset. For example, a migration-related dataset where there are 2 dimensions containing local authorities - one is the local authority someone moved from and the other is the one they moved to. In that scenario you might rename the dimensions to "Local authorities moved from" and "Local authorities moved to", to distinguish between them.

For a dimension containing measure or data types, when you click on it from your dataset tasklist, you'll then need to upload the [appropriate lookup table](Data-preparation-‐-New-datasets#guidance-measure-or-data-types).

### Date formatting questions

For [dimensions containing dates](Data-preparation-‐-New-datasets#guidance-date-formatting), you’ll be asked whether the dimension contains either:

- periods - for example, months or years for which data values apply to
- specific points - for example, specific dates when data values were collected

For periods you’ll first be asked whether you need to use standardised date formatting or upload your own custom date lookup table. You should only upload your own date lookup table if you cannot use any of the accepted date formats.

For standardised date formatting you'll be asked:

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

1. From your dataset tasklist, click ‘Export text fields for translation’.
1. You’ll be shown all relevant text and will be able to make any final changes, if needed.
1. In summary, all possible text fields are:
   - dimension names
   - title
   - summary of dataset and variables
   - data collection or calculation
   - statistical quality
   - rounding applied
   - related report link text(s)
1. Click ‘Export CSV’ to download a table containing columns for:
   - text field name
   - text (English)
   - text (Welsh)
1. The column for whichever language you’ve been using will be populated.
1. You should send this CSV to your translator to enter the required translations, or enter the translations yourself if you have them.

When opening the exported translation CSV in software such as Excel, text fields with multiple paragraphs may split across multiple cells. If this happens, you should ensure that all text for a specific section, in one language, is in a single cell.

The values in the 'key' column are unique to each dataset. Therefore, ensure you:

- use the exported translation file for the dataset you're creating
- do not change any of the values in the key column

Once you have the completed CSV:

1. select ‘Import translations’ from your dataset tasklist
1. upload the CSV and check the translations have uploaded correctly
1. click ‘Continue’ to populate all fields appropriately

You can now preview your dataset fully in both English and Welsh.

## Publishing

### When the dataset should be published

Indicate what date and time the dataset should be published. Consider how long the dataset will take to be approved once you've submitted it. Set the publishing date far enough in the future to allow for this.

The publishing time is 9:30am local UK time by default. You should only change this if a different time is absolutely necessary.

### Submit

Submit the dataset for approval. An approver in your group will check the dataset and approve or reject it for publishing on the proposed publishing date.

If the approver rejects the dataset for publishing, they will provide detail on why it's been rejected and what needs fixing. These details will be visible in the 'History' section of the dataset's overview page. Once the issues have been fixed, the dataset can be resubmitted for approval.
