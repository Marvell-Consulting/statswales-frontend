import { ColumnAssignment } from '../tests-e2e/publish/helpers/publishing-steps';
import { Designation } from '../src/shared/enums/designation';

export interface DebugDimensionConfig {
  originalColName: string;
  dimensionName: string;
  type: 'date' | 'lookup';
  optionSelections?: string[]; // required for date type — the wizard radio button labels in order
  filename?: string; // required for lookup type — CSV filename relative to dataset dir
}

export interface DebugDatasetConfig {
  title: string;
  groupName: string;
  dataFile: string; // CSV filename relative to dataset dir
  columnAssignments: ColumnAssignment[];
  measure: { filename: string }; // CSV filename relative to dataset dir
  dimensions: DebugDimensionConfig[];
  metadata: {
    summary: string;
    collection: string;
    quality: string;
    providerName: string;
    sourceName?: string;
    reports: { title: string; url: string }[];
    topics: string[];
    designation: Designation;
    rounding?: { applied: boolean; description?: string };
  };
  publishMinutesFromNow?: number; // default: 2
}
