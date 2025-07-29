# Data preparation: Updating datasets

## Updating data values

If you need to add or replace data values in a dataset, you should prepare update data tables.

These should be in the **same format as the originally uploaded data table** for this dataset. Using the **same columns and column headers**.

<!-- You can check the formatting of previously uploaded data files by downloading them from the 'History' tab on a dataset's overview page. -->

## Adding new data only

This means adding data values for data that is not currently in the dataset. For example, data values for the latest year. The update data table should contain **only the new data values you’re adding**.

Example rows of update data table for council tax bands, adding new data for 2024/25:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure or data type | Data    |
| :-------- | :------- | :------- | :-------- | :------------------- | :------ |
| W06000001 | 2024/25  | A-       |           | 1                    | 1216.86 |
| W06000001 | 2024/25  | A        |           | 1                    | 1014.05 |
| W06000001 | 2024/25  | B        |           | 1                    | 1419.67 |
| W06000001 | 2024/25  | C        |           | 1                    | 1622.48 |
| W06000001 | 2024/25  | D        |           | 1                    | 1825.30 |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Revising data

This means replacing data values in the current dataset with revised values. This may be because values used to be provisional, or need correcting. The update data table should contain **only the data values you’re revising**.

Example rows of update data table for council tax bands, revising data for 2022/23:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure or data type | Data    |
| :-------- | :------- | :------- | :-------- | :------------------- | :------ |
| W06000001 | 2022/23  | G        |           | 1                    | 3042.10 |
| W06000001 | 2022/23  | H        |           | 1                    | 3650.60 |
| W06000001 | 2022/23  | I        |           | 1                    | 4259.03 |
| W06000002 | 2022/23  | A-       |           | 1                    | 1104.00 |
| W06000002 | 2022/23  | A        |           | 1                    | 1324.80 |

_Please note this example is for demonstration purposes only and is not a genuine update._

### Automated handling of note codes

When you revise data values in SW3, the system will check your update data table against the existing data. For **all data values that have changed**, the system will automatically add an 'r' note code to the note code column. This is to help the consumer know if any data values have changed.

The only exception to this is when data values previously marked as provisional (p) or forecast (f) have been changed. In these cases, the system will:

- remove the previous 'p' and 'f' note codes
- not add any 'r' note codes to these values

This is in line with the recommended StatsWales approach to 'finalising' provisional or forecast values.

However, there may be instances when a provisional or forecast value needs to be changed with an update, but retain its provisional or forecast label. In these cases you should ensure that the relevant data values have 'p' or 'f' in the note codes column in your update lookup table. The system will then keep the 'p' or 'f' codes in the existing data table.

## Adding and revising data

If you need to both add new data values and revise existing data values, you must combine these into **a single update table**.

## Changing data without automated handling of note codes

There may be rare circumstances where you need to change data values without any of the automated handling of 'r', 'p' and 'f' note codes. In these cases, you should ensure that the note code column in your update data table is correct for what you want to display to the consumer. That is, if you want to:

- add a note code, ensure it's in the note code column
- remove an existing note code, ensure it's not in the note code column

When you [upload your update lookup table](Using-SW3---Updating-a-dataset), you will need to select 'Change data without automated handling of note codes'.

## Removing data

You should only remove data values if there is a legitimate, statistical reason for doing so. You cannot remove whole rows from your dataset.

To remove data values, you should follow the same process as for revising data but with:

- empty cells for the removed data values
- the [appropriate data value note shorthand](Data-preparation-‐-New-datasets#guidance-notes) to explain why the data value is no longer present

Depending on the reason for removal, it may be necessary to add an explanation to the [‘Statistical quality’ metadata section](Data-preparation-‐-New-datasets#guidance-statistical-quality).

Example rows of update data table for council tax bands, removing data for council tax band A- before 2001/02:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure or data type | Data |
| :-------- | :------- | :------- | :-------- | :------------------- | :--- |
| W06000001 | 1996/97  | A-       | z         | 1                    |      |
| W06000001 | 1997/98  | A-       | z         | 1                    |      |
| W06000001 | 1998/99  | A-       | z         | 1                    |      |
| W06000001 | 1999/00  | A-       | z         | 1                    |      |
| W06000001 | 2000/01  | A-       | z         | 1                    |      |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Replacing all existing data

There may be rare circumstances where you need to replace all existing data. It is very important that you ensure:

- there is a legitimate reason for replacing all data
- the data in the update data table is correct
- no data will be lost from the currently published dataset (unless it needs to be [removed for a legitimate reason](#guidance-removing-data))

## Updating metadata

Any [section of the metadata](Data-preparation-‐-New-datasets#guidance-metadata) can be updated if needed. This can be done whether the data itself is being updated or not. It may also be necessary to explain why the metadata has been changed, within the relevant section.

## Updates that are not currently possible

In the current system, you cannot:

- add a new dimension to a dataset
- delete a dimension from a dataset
