export enum FeatureFlag {
  Example = 'example', // don't use - enum needs at least one value otherwise we get ts errors in isFeatureEnabled()
  SummaryTable = 'summary_table'
}
