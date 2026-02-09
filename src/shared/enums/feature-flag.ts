export enum FeatureFlag {
  DoNotUse = 'example', // enum needs at least one value otherwise we get ts errors in isFeatureEnabled function
  SummaryTable = 'summary_table'
}
