import { FactTableDto } from '../dtos/fact-table';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { SourceType } from '../enums/source-type';
import { FactTableInfoDto } from '../dtos/fact-table-info';

export const updateSourceTypes = (factTable: FactTableDto, sourceAssign: SourceAssignmentDTO[]) => {
    return {
        ...factTable,
        sources: factTable.fact_table_info.map((factTableInfo: FactTableInfoDto) => {
            const type =
                sourceAssign.find((sass) => sass.column_name === factTableInfo.column_name)?.column_type ||
                SourceType.Unknown;
            return { ...factTableInfo, type };
        })
    };
};
