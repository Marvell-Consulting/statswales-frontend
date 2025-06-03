/*
    The order of the file is important as it sets the order
    for the items in the sources select boxes.
 */
export enum SourceType {
  Unknown = 'unknown',
  Dimension = 'dimension',
  Measure = 'measure',
  DataValues = 'data_values',
  NoteCodes = 'note_codes',
  Ignore = 'ignore',
  LineNumber = 'line_number'
}
