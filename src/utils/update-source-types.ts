import { FileImportDTO } from '../dtos/file-import';
import { SourceDTO } from '../dtos/source';
import { SourceAssignmentDTO } from '../dtos/source-assignment-dto';
import { SourceType } from '../enums/source-type';

export const updateSourceTypes = (fileImport: FileImportDTO, sourceAssign: SourceAssignmentDTO[]) => {
    return {
        ...fileImport,
        sources: fileImport.sources.map((source: SourceDTO) => {
            const type = sourceAssign.find((sass) => sass.sourceId === source.id)?.sourceType || SourceType.Unknown;
            return { ...source, type };
        })
    };
};
