import { FactTableDto } from '../dtos/fact-table';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { SourceType } from '../enums/source-type';
import { FactTableInfoDto } from '../dtos/fact-table-info';

export const updateSourceTypes = (factTable: FactTableDto, sourceAssign: SourceAssignmentDTO[]) => {
    return {
        ...factTable,
        sources: factTable.info.map((factTableInfo: FactTableInfoDto) => {
            const type =
                sourceAssign.find((sass) => sass.columnName === factTableInfo.column_name)?.sourceType ||
                SourceType.Unknown;
            return { ...factTableInfo, type };
        })
    };
};
