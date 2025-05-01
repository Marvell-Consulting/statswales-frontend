# Data preparation: Updating datasets

## Updating data values

If you need to add or replace data in a dataset, you should prepare update data tables.

These should be in the **same format as the originally uploaded data table** for this dataset. Using the **same columns and column headers**.

<!-- You can check the formatting of previously uploaded data files by downloading them from the 'History' tab on a dataset's overview page. -->

<!-- You can check the formatting and columns of the originally uploaded data table in SW3 by:

- selecting the dataset you need to update from your home screen
- selecting ‘View originally uploaded data table’ -->

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

This means replacing data in the current dataset with revised values. This may be because values used to be provisional, or need correcting. The update data table should contain **only the data values you’re revising**.

Example rows of update data table for council tax bands, revising data for 2022/23:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure or data type | Data    |
| :-------- | :------- | :------- | :-------- | :------------------- | :------ |
| W06000001 | 2022/23  | G        | r         | 1                    | 3042.10 |
| W06000001 | 2022/23  | H        | r         | 1                    | 3650.60 |
| W06000001 | 2022/23  | I        | r         | 1                    | 4259.03 |
| W06000002 | 2022/23  | A-       | r         | 1                    | 1104.00 |
| W06000002 | 2022/23  | A        | r         | 1                    | 1324.80 |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Adding and revising data

If you need to both add new data and revise existing data, you must combine these into **a single update table**.

## Replacing all existing data

There may be rare circumstances where you need to replace all existing data. It is very important that you ensure:

- there is a legitimate reason for replacing all data
- the data in the update data table is correct
- no data will be lost from the currently published dataset (unless it needs to be [removed for a legitimate reason](#guidance-removing-data))
- all revised data values have [an ‘r’ in the note code column](Data-preparation-‐-New-datasets#guidance-notes)

## Removing data

You should only remove data values if there is a legitimate, statistical reason for doing so. You cannot remove whole rows from your dataset.

To remove data values, you should follow the same process as for revising data but with:

- empty cells for the removed data values
- the [appropriate data value note shorthand](Data-preparation-‐-New-datasets#guidance-notes) to explain why the data value is no longer present
- an 'r’ shorthand indicating this is a revision

Depending on the reason for removal, it may be necessary to add an explanation to the [‘Statistical quality’ metadata section](Data-preparation-‐-New-datasets#guidance-statistical-quality).

Example rows of update data table for council tax bands, removing data for council tax band A- before 2001/02:

| AreaCode  | YearCode | BandCode | NoteCodes | Measure or data type | Data |
| :-------- | :------- | :------- | :-------- | :------------------- | :--- |
| W06000001 | 1996/97  | A-       | z,r       | 1                    |      |
| W06000001 | 1997/98  | A-       | z,r       | 1                    |      |
| W06000001 | 1998/99  | A-       | z,r       | 1                    |      |
| W06000001 | 1999/00  | A-       | z,r       | 1                    |      |
| W06000001 | 2000/01  | A-       | z,r       | 1                    |      |

_Please note this example is for demonstration purposes only and is not a genuine update._

## Updating metadata

Any [section of the metadata](Data-preparation-‐-New-datasets#guidance-metadata) can be updated if needed. This can be done whether the data itself is being updated or not. It may also be necessary to explain why the metadata has been changed, within the relevant section.

## Updates that are not currently possible

In the current system, you cannot:

- add a new dimension to a dataset
- delete a dimension from a dataset
