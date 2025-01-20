# Data preparation - Updating datasets

## Updating data values

If you need to **add or replace data** in a dataset, you should prepare update data tables.

These should be in the **same format as the originally uploaded data table** for this dataset, with the **same columns and column headers**.

You can check the formatting and columns of the originally uploaded data table in SW3 by:

- selecting the dataset you need to update from your home screen
- selecting ‘View originally uploaded data table’

## Adding new data only

This means adding data values for data that is not currently in the dataset. For example, data values for the most recent year. The update data table should contain **only the new data values you’re adding**.

Example rows of update data table for council tax bands, adding new data for 2024/25:

| AreaCode | YearCode | BandCode | NoteCodes | Measure or data type | Data    |
| :------- | :------- | :------- | :-------- | :------------------- | :------ |
| 512      | 2024/25  | A-       |           | 1                    | 1216.86 |
| 512      | 2024/25  | A        |           | 1                    | 1014.05 |
| 512      | 2024/25  | B        |           | 1                    | 1419.67 |
| 512      | 2024/25  | C        |           | 1                    | 1622.48 |
| 512      | 2024/25  | D        |           | 1                    | 1825.30 |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Replacing all existing data

If you need to replace existing data, currently in SW3 your update data table should contain **all data values for the dataset**. This may include both data values that need to be changed and those that don’t.

It is very important that you ensure:

- the data in the update data table is correct
- no data will be lost from the currently published dataset (unless it needs to be [removed for a legitimate reason](#removing-data))
- all revised data values have [an ‘r’ in the note code column](notes)

Example rows of update data table for council tax bands, revising data for 2022/23 for Isle of Anglesey:

| AreaCode | YearCode | BandCode | NoteCodes | Measure or data type | Data    |
| :------- | :------- | :------- | :-------- | :------------------- | :------ |
| 512      | 2022/23  | G        | r         | 1                    | 3042.10 |
| 512      | 2022/23  | H        | r         | 1                    | 3650.60 |
| 512      | 2022/23  | I        | r         | 1                    | 4259.03 |
| 514      | 2022/23  | A-       |           | 1                    | 1104.00 |
| 514      | 2022/23  | A        |           | 1                    | 1324.80 |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Adding and replacing data

If you need to both add new data and replace existing data, you must combine these into **a single update table**, which contains **all data values for the dataset**.

## Removing data

You should only remove data values if there is a legitimate, statistical reason for doing so. You cannot remove whole rows from your dataset.

To remove data values, you should follow the same process as for replacing data but with:

- empty cells for the removed data values
- the [appropriate data value note shorthand](notes) to explain why the data value is no longer present, as well as the ‘r’ indicating this is a revision

Depending on the reason for removal, it may be necessary to add an explanation to the [‘Statistical quality’ metadata section](Data-preparation-%E2%80%90-New-datasets#statistical-quality).

Example rows of update data table for council tax bands, removing data for council tax band A- prior to 2001/02:

| AreaCode | YearCode | BandCode | NoteCodes | Measure or data type | Data   |
| :------- | :------- | :------- | :-------- | :------------------- | :----- |
| 512      | 1998/99  | A-       | z,r       |                      |        |
| 512      | 1999/00  | A-       | z,r       |                      |        |
| 512      | 2000/01  | A-       | z,r       |                      |        |
| 512      | 2001/02  | A-       |           | 1                    | 359.52 |
| 512      | 2002/03  | A-       |           | 1                    | 395.03 |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Updating metadata

Any [section of the metadata](Data-preparation-%E2%80%90-New-datasets#metadata) can be updated if needed. This can be done whether the data itself is being updated or not. It may also be necessary to explain why the metadata has been changed, within the relevant section.
