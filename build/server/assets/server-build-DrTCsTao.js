var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createCookie, ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, useLocation, Link, createSearchParams, createMemorySessionStorage, unstable_createContext, redirect, data, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse, NavLink as NavLink$1, Form, useSearchParams } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { initReactI18next, I18nextProvider, useTranslation } from "react-i18next";
import { unstable_createI18nextMiddleware } from "remix-i18next/middleware";
import { merge, isEmpty, pick, first } from "lodash-es";
import { a as appConfig, L as Locale, S as SessionStore, l as logger$2, b as appConfigContext } from "./app-Db0nXZgx.js";
import { createElement, useContext, createContext, Fragment as Fragment$1, useEffect } from "react";
import { useChangeLanguage } from "remix-i18next/react";
import { createClient } from "redis";
import { createRedisSessionStorage } from "remix-redis-session";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import clsx from "clsx";
import { performance } from "node:perf_hooks";
import { TZDate } from "@date-fns/tz";
import { format, isBefore, parseISO, add } from "date-fns";
import { cy, enGB } from "date-fns/locale";
import { z } from "zod/v4";
import { parseFormData } from "@mjackson/form-data-parser";
import path from "node:path";
import { marked } from "marked";
import fs from "node:fs";
import * as readline from "node:readline";
import Markdown from "markdown-to-jsx";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { cacheHeader } from "pretty-cache-header";
import { z as z$1 } from "zod";
import "@react-router/express";
import "express";
import "pino";
import "pino-http";
import "lodash/pick.js";
const enTranslation = {
  app_title: "StatsWales",
  developer_warning: '<strong class="govuk-tag govuk-tag--red govuk-phase-banner__content__tag">Warning</strong> This is a developer page and has not been through user research',
  developer_tag: '<span class="govuk-tag govuk-tag--yellow govuk-phase-banner__content__tag">Developer Page</span>',
  external_tag: '<span class="govuk-tag govuk-tag--orange govuk-phase-banner__content__tag">External Page</span>',
  yes: "Yes",
  no: "No",
  toc: "Contents",
  user_roles: {
    editor: "Editor",
    approver: "Approver"
  },
  buttons: {
    continue: "Continue",
    back: "Back",
    cancel: "Cancel",
    upload_csv: "Continue",
    preview: "Preview (opens in new tab)"
  },
  badge: {
    dataset_status: {
      new: "New dataset",
      live: "Live dataset"
    },
    publishing_status: {
      incomplete: "Incomplete",
      update_incomplete: "Update incomplete",
      pending_approval: "Pending approval",
      update_pending_approval: "Update pending approval",
      changes_requested: "Issues to fix",
      scheduled: "Scheduled",
      update_scheduled: "Update scheduled",
      published: "Published"
    }
  },
  pagination: {
    previous: "Previous",
    next: "Next",
    update: "Update",
    page_size: "Page size"
  },
  header: {
    product_name: "StatsWales V3.0",
    beta: "Beta",
    feedback: 'You’re viewing a new version of StatsWales. You can get support on <a class="govuk-link" href="http://statswales3support.slack.com">Slack</a>.',
    logo: "StatsWales logo",
    navigation: {
      home: "Home",
      menu: "Menu",
      skip_to_content: "Skip to main content",
      publish_dataset: "Publish a dataset",
      guidance: "Guidance",
      list_datasets: "List datasets",
      logout: "Sign out",
      login: "Sign in",
      developer: "Developer",
      groups: "Groups",
      users: "Users"
    }
  },
  footer: {
    top_of_page: "Back to top",
    contact_us: "Contact us",
    accessibility: "Accessibility",
    copyright_statement: "Copyright statement",
    cookies: "Cookies",
    privacy: "Privacy",
    terms_conditions: "Terms and conditions",
    modern_slavery: "Modern slavery statement",
    welsh_gov: "Welsh Government"
  },
  login: {
    heading: "Login",
    buttons: {
      entraid: "Microsoft",
      google: "Google",
      local: "Form"
    },
    error: {
      summary_title: "There is a problem",
      generic: "You could not be logged in. Try again later.",
      expired: "Your session has expired. You need to sign in again."
    },
    form: {
      notice_header: "Important",
      notice_1: "The username we've given you is temporary. You'll only be able to log in with it whilst we run this round of testing.",
      notice_2: "Do not upload any sensitive data or data that other StatsWales users should not have access to.",
      username: {
        label: "Username",
        error: "Enter your username"
      },
      submit: "Login"
    }
  },
  homepage: {
    heading: "Datasets",
    table: {
      id: "ID",
      title: "Title",
      group: "Group",
      last_updated: "Last updated",
      dataset_status: "Dataset status",
      publish_status: "Publishing status",
      not_translated: "Not yet translated"
    },
    no_results: {
      summary: "You do not have access to any datasets. You have either:",
      summary_1: "been added to a group with no datasets in it",
      summary_2: "not been given editor or approver access to any groups"
    },
    status: {
      new: "New",
      live: "Live"
    },
    publishing_status: {
      incomplete: "Incomplete",
      update_incomplete: "Update incomplete",
      pending_approval: "Pending approval",
      update_pending_approval: "Update pending approval",
      changes_requested: "Issues to fix",
      scheduled: "Scheduled",
      update_scheduled: "Update scheduled",
      published: "Published"
    },
    buttons: {
      create: "Create new dataset"
    }
  },
  guidance: {
    title: "Guidance for StatsWales 3 (SW3)"
  },
  dataset_view: {
    key_information: {
      heading: "Main information",
      last_update: "Most recent update",
      next_update: "Next update expected (provisional)",
      data_provider: "Data provider",
      data_providers: "Data provider {{index}}",
      data_source: "Data source",
      data_sources: "Data source {{index}}",
      no_source: "No specific source from data provider",
      data_categories: "Data categories",
      time_covered: "Time period covered",
      time_period: "{{start}} to {{end}}",
      update_missing: "Publish date not entered yet",
      next_update_missing: "Publish date or update frequency not entered yet",
      not_updated: "This dataset will not be updated"
    },
    downloads: {
      heading: "Downloads"
    },
    notes: {
      heading: "Data notes",
      revisions: "Revisions",
      data_value_shorthand: "Data value shorthand",
      rounding: "Rounding applied",
      no_rounding: "None applied",
      a: "Average",
      c: "Confidential information",
      e: "Estimated",
      f: "Forecast",
      k: "Low figure",
      p: "Provisional",
      r: "Revised",
      t: "Total",
      u: "Low reliability",
      x: "Not available",
      z: "Not applicable"
    },
    about: {
      heading: "About this dataset",
      overview: "Overview",
      summary: "Summary",
      data_collection: "Data collection and calculation",
      statistical_quality: "Statistical quality",
      designation: "Designation",
      designations: {
        official: "Official statistics",
        accredited: "Accredited official statistics",
        in_development: "Official statistics in development",
        management: "Management information",
        none: "No designation"
      },
      related_reports: "Related reports"
    },
    published: {
      heading: "Published by",
      org: "Organisation",
      contact: "Contact email"
    },
    buttons: {
      csv: "Download as CSV",
      excel: "Download as Excel",
      json: "Download as JSON",
      duckdb: "Download as DuckDB"
    },
    contents: "Contents",
    download: "Download",
    download_as: {
      csv: "Download as CSV",
      parquet: "Download as Parquet",
      excel: "Download as Excel",
      duckdb: "Download as DuckDB"
    },
    table_preview: "Table preview [Publisher use only]",
    table_note: "This is not shown in the consumer view",
    not_entered: "Not entered yet",
    not_selected: "Not selected yet",
    not_available: "Not available",
    categories_missing: "Reference data not selected yet",
    period_cover_missing: "Date information not entered yet"
  },
  publish: {
    header: {
      overview: "Return to dataset tasklist",
      back: "Back"
    },
    cube_preview: {
      panel: "This is a preview of this dataset.",
      heading: "Main information"
    },
    delete_draft: {
      dataset: {
        heading: "By continuing, you confirm this dataset should be deleted",
        message: "All data for this dataset will be removed permanently. This cannot be undone.",
        button: "Delete dataset",
        success: "Dataset has been deleted successfully",
        error: "Failed to delete dataset due to a server error"
      },
      update: {
        heading: "By continuing, you confirm this update should be deleted",
        message: "All data from this update will be removed permanently, but the published dataset will not be affected. This cannot be undone.",
        button: "Delete update",
        success: "Update has been deleted successfully",
        error: "Failed to delete update due to a server error"
      }
    },
    start: {
      title: "Create a new dataset",
      p1: "To create a new dataset, you'll need:",
      data_table: "a data table containing data values and references to all relevant dimensions",
      lookup_table: "any user-generated lookup tables you need to include (if relevant)",
      metadata: "metadata about this dataset, in the language in which you're viewing this service",
      errors: {
        no_groups: "You must be an editor in at least one group to create a dataset"
      }
    },
    dimension_name: {
      dimension_heading: "What should this dimension be called on the StatsWales website?",
      measure_heading: "What should this measure be called on the StatsWales website?",
      hint: "The dimension name should be:",
      concise: "concise and clearly explain what the dimension contains",
      unique: "different to other dimension names in this dataset",
      language: "entered in the language in which you're viewing this service"
    },
    dimension_type_chooser: {
      heading: "Add reference data",
      subheading: "Dimension",
      question: "What kind of data does this dimension contain?",
      chooser: {
        age: "Age",
        date: "Dates",
        ethnicity: "Ethnicity",
        geography: "Geography",
        number: "Numbers (no lookup table needed)",
        religion: "Religion",
        sex_gender: "Sex and gender",
        text: "Text (no lookup table needed)",
        time: "Times",
        lookup: "Something else"
      }
    },
    time_dimension_chooser: {
      heading: "Set up dimension containing dates",
      subheading: "Dates",
      showing: "A sample of {{rows}} of {{total}} rows.",
      question: "What kind of dates does the dimension contain?",
      chooser: {
        period: "Periods",
        "period-hint": "For example, months or years for which data values apply to",
        point: "Specific points",
        "point-hint": "For example, specific dates when data values were collected"
      }
    },
    number_chooser: {
      heading: "Set up dimension containing numbers",
      review_heading: "Check the dimension",
      subheading: "Numbers",
      showing: "A sample of {{rows}} of {{total}} rows.",
      question: "What kind of numbers does this dimension contain?",
      chooser: {
        integer: "Whole numbers",
        decimal: "Decimal numbers",
        decimal_places: "How many decimal places should be displayed?"
      },
      confirm: "By continuing, you confirm the dimension is correct."
    },
    lookup_table_review: {
      heading: "Check the lookup table",
      explain: "The uploaded lookup table has been added to a standardised lookup table. There may be columns in this standardised lookup table that were not in the uploaded lookup table.",
      dimension_heading: "Check the dimension",
      showing: "Showing a sample of {{rows}} of {{total}} rows.",
      confirm: "By continuing, you confirm the lookup table is correct.",
      dimension_confirm: "By continuing, you confirm the dimension is displaying correctly.",
      go_back: "Choose a different lookup table",
      choose_different: "Choose a different reference data",
      change_lookup_table: "Replace lookup table",
      change_date_format: "Change the date formats",
      change_dimension_type: "Change what kind of data this dimension contains",
      column_headers: {
        fact_table: "Fact table:",
        lookup_table: "Lookup table:",
        description: "Description",
        description_en: "Description (English)",
        description_cy: "Description (Welsh)",
        sort_order: "Sort order",
        hierarchy: "Hierarchy",
        notes_en: "Notes (English)",
        notes_cy: "Notes (Welsh)"
      }
    },
    measure_review: {
      heading: "Check the measure table",
      explain: "The uploaded measure lookup table has been added to a standardised measure table. There may be columns in this measure table that were not in the uploaded measure lookup table.",
      showing: "Showing a sample of {{rows}} of {{total}} rows.",
      confirm: "By continuing, you confirm the measure table is correct.",
      go_back: "Choose a different measure table",
      column_headers: {
        fact_table: "Fact Table:",
        lookup_table: "Lookup Table:",
        description_en: "Description (English)",
        description_cy: "Description (Welsh)",
        description: "Description",
        decimals: "Decimal places",
        hierarchy: "Hierarchy",
        language: "Language",
        reference: "Reference value",
        sort: "Sort order",
        sort_order: "Sort order",
        notes: "Notes",
        notes_en: "Notes (English)",
        notes_cy: "Notes (Welsh)",
        format: "Format",
        measure_type: "Value type"
      },
      column_values: {
        null: "No",
        "cy-gb": "Welsh",
        "en-gb": "English",
        float: "Floating point number",
        decimal: "Decimal number",
        integer: "Whole number",
        long: "Big whole number",
        percentage: "Percentage",
        string: "Plain text",
        text: "Plain text",
        date: "Date",
        datetime: "Date and time",
        time: "Time"
      }
    },
    time_dimension_review: {
      heading: "Confirm the dates are correct",
      unknown_name: "Unnamed Dimension",
      actions: "Actions",
      showing: "Showing a sample of {{rows}} of {{total}} rows.",
      confirm: "By continuing, you confirm the dates are correct.",
      go_back: "Change date format",
      change_format: "Change date representation",
      change_name: "Change dimension name",
      change_measure_name: "Change measure name",
      column_headers: {
        date_code: "Date code",
        start_date: "Start",
        end_date: "End",
        date_type: "Date type",
        description: "Description",
        description_en: "Description (English)",
        description_cy: "Description (Welsh)",
        descriptionen: "Description (English)",
        descriptioncy: "Description (Welsh)",
        descriptionenglish: "Description (English)",
        descriptionwelsh: "Description (Welsh)",
        descriptioncymraeg: "Description (Welsh)",
        description_english: "Description (English)",
        description_welsh: "Description (Welsh)",
        description_cymraeg: "Description (Welsh)",
        notes: "Notes",
        notesen: "Notes (English)",
        notescy: "Notes (Welsh)",
        notesenglish: "Notes (English)",
        noteswelsh: "Notes (Welsh)",
        notescymraeg: "Notes (Welsh)",
        notes_english: "Notes (English)",
        notes_welsh: "Notes (Welsh)",
        notes_cymraeg: "Notes (Welsh)",
        language: "Language",
        lang: "Language",
        sortorder: "Sort Order",
        sort: "Sort Order",
        sort_order: "Sort Order",
        hierarchy: "Hierarchy"
      },
      year_type: {
        calendar_year: "Calendar year",
        calendar_quarter: "Calendar quarter",
        calendar_month: "Calendar month",
        financial_year: "Financial year",
        financial_quarter: "Financial quarter",
        financial_month: "Financial month",
        academic_year: "Academic year",
        academic_quarter: "Academic quarter",
        academic_month: "Academic month",
        tax_year: "Tax year",
        tax_quarter: "Tax quarter",
        tax_month: "Tax month",
        meteorological_year: "Meteorological year",
        meteorological_quarter: "Meteorological quarter",
        meteorological_month: "Meteorological month",
        specific_day: "Specific point in time"
      }
    },
    measure_preview: {
      heading: "Upload a measure lookup table"
    },
    "period-type-chooser": {
      heading: "What are the shortest periods in the dimension?",
      subheading: "Dates",
      chooser: {
        years: "Years",
        quarters: "Quarters",
        months: "Months"
      }
    },
    year_type: {
      heading: "What type of year does the dimension represent?",
      chooser: {
        calendar: "Calendar",
        "calendar-hint": "1 January to 31 December",
        financial: "Financial",
        "financial-hint": "1 April to 31 March",
        tax: "Tax",
        "tax-hint": "6 April to 5 April",
        academic: "Academic",
        "academic-hint": "1 September to 31 August",
        meteorological: "Meteorological",
        "meteorological-hint": "1 March to 28 or 29 February"
      }
    },
    year_format: {
      heading: "What format is used for years in the dimension?",
      example: "For example, {{example}}"
    },
    quarter_format: {
      heading: "What format is used for quarters in the dimension?",
      "heading-alt": "What format is used for quarterly totals?",
      example: "For example, {{example}}",
      fifth_quarter: "Is a fifth quarter used to represent yearly totals?",
      fifth_example: "For example, 2024Q5 to represent the total for 2024",
      no_quarterly_totals: "There are no quarterly totals"
    },
    month_format: {
      heading: "What format is used for months in the dimension?",
      example: "For example, {{example}}"
    },
    measure_match_failure: {
      heading: "Measure lookup table cannot be matched to the data table",
      measure_subheading: "Reference codes in the measure lookup table that cannot be matched",
      information: "{{failureCount, number}} instances of reference codes in the data table cannot be found in the measure lookup table.",
      things_to_check: "You should check you selected the correct data table and measure lookup table and that they both:",
      formatting: "contain the correct reference codes",
      choices: "do not contain any trailing spaces after any values",
      upload_different_measure: "Upload corrected or different measure lookup table"
    },
    dimension_match_failure: {
      lookup_heading: "Lookup table data cannot be matched to the data table",
      heading: "Reference data cannot be matched to the data table",
      lookup_information: "{{failureCount, number}} instances of reference codes in the data table could not be found in the uploaded lookup table.",
      you_should_check: "You should check you selected the correct data table and lookup table and that they both:",
      ref_information: "{{failureCount, number}} instances of reference codes in the data table could not be found in the selected standardised reference data.",
      you_should_check_ref: "You should check you selected the correct data table and reference data. You should also check the data table:",
      formatting: "contain the correct reference codes",
      choices: "do not contain any trailing spaces after any values",
      ref_formatting: "contains the correct reference codes",
      ref_choices: "does not contain any trailing spaces after any values",
      fact_table_subheading: "Reference codes in the data table that cannot be matched",
      actions: "Actions",
      upload_different_file: "Upload corrected or different data table",
      upload_different_file_warning: "Warning: This will remove all reference data from all dimensions",
      try_different_format: "Select different reference data",
      try_different_lookup: "Upload corrected or different lookup table",
      no_matches: "None of the dates matched the format supplied",
      missing_data_table_values: "Reference codes in the data table that cannot be matched",
      missing_lookup_table_values: "Reference codes in the lookup table that cannot be matched"
    },
    period_match_failure: {
      heading: "Date formatting cannot be matched to the dimension",
      information: "{{failureCount, number}} instances of date codes in the dimension do not match the date formatting you have indicated. You should check:",
      formatting: "all date codes in the dimension are correct and do not contain any trailing spaces",
      choices: "you indicated the correct date formatting",
      supplied_format: "Indicated date formatting:",
      year_format: "Years: {{format}}",
      quarter_format: "Quarters: {{format}}",
      month_format: "Months: {{format}}",
      date_format: "Date: {{format}}",
      subheading: "Date codes in the data table that cannot be matched",
      fact_table_subheading: "Reference codes in the data table that cannot be matched",
      actions: "Actions",
      upload_different_file: "Upload corrected or different data table",
      upload_different_file_warning: "Warning: This will remove all reference data from all dimensions",
      try_different_format: "Indicate different date formatting",
      no_matches: "None of the dates matched the format supplied"
    },
    group: {
      heading: "Which group should this dataset belong to?",
      form: {
        group_id: {
          error: {
            invalid: "Select which group this dataset should belong to",
            missing: "Select which group this dataset should belong to"
          }
        }
      }
    },
    title: {
      heading: "What is the title of this dataset?",
      appear: "This is the title that will appear on the StatsWales website",
      descriptive: "It should be short, descriptive and unique",
      form: {
        title: {
          hint: "This should be entered in the language in which you're viewing this service.",
          error: {
            missing: "Enter the title of this dataset",
            too_long: "The title of this dataset must be 1,000 characters or less",
            too_short: "The title of this dataset must be 3 characters or more",
            unique: "The entered title is already in use for a currently published dataset. Enter a unique title for this dataset."
          }
        },
        group_id: {
          error: {
            missing: "No group has been selected for this dataset. You need to create this dataset again from the dataset list."
          }
        }
      }
    },
    summary: {
      heading: "What is the summary of this dataset?",
      explain: "In short, simple sentences explain:",
      explain_1: "what this dataset is about and what it shows",
      explain_2: "this dataset's dimensions and why they've been used, if needed",
      language: "This should be entered in the language in which you're viewing this service.",
      form: {
        description: {
          error: {
            missing: "Enter the summary of this dataset"
          }
        }
      }
    },
    collection: {
      heading: "How was the data collected or calculated?",
      explain: "In short, simple sentences explain either:",
      explain_1: "the methodology used to collect the data",
      explain_2: "the methodology used to calculate the data",
      explain_3: "both of the above",
      language: "This should be entered in the language in which you're viewing this service.",
      form: {
        collection: {
          error: {
            missing: "Enter how the data was collected or calculated"
          }
        }
      }
    },
    quality: {
      heading: "What is the statistical quality of this dataset?",
      explain: "In short, simple sentences explain:",
      explain_1: "any issues or methodological changes related to this dataset including any:",
      explain_1a: "notes relevant to all data values in this dataset",
      explain_1b: "custom explanations needed to clarify any note codes used",
      explain_2: "a high-level summary of the statistical quality report, if available",
      language: "This should be entered in the language in which you're viewing this service.",
      form: {
        quality: {
          error: {
            missing: "Enter the statistical quality of this dataset"
          }
        },
        rounding_applied: {
          heading: "Has rounding been applied to the data values?",
          options: {
            yes: {
              label: "Yes",
              note: "In short, simple sentences explain what rounding has been applied."
            },
            no: {
              label: "No"
            }
          },
          error: {
            missing: "Select whether any rounding has been applied to the data values"
          }
        },
        rounding_description: {
          label: "In short, simple sentences explain what rounding has been applied",
          error: {
            missing: "Enter what rounding has been applied to the data values"
          }
        }
      }
    },
    update_frequency: {
      heading: "Will this dataset be regularly updated?",
      form: {
        is_updated: {
          options: {
            yes: {
              label: "Yes"
            },
            no: {
              label: "No"
            }
          },
          error: {
            missing: "Select if this dataset will be regularly updated or not"
          }
        },
        frequency_value: {
          label: "Enter the period between updates. For example, 1 year.",
          error: {
            missing: "Enter the number of weeks, months or years for the period between updates"
          }
        },
        frequency_unit: {
          options: {
            select: "Select",
            day: "days",
            week: "weeks",
            month: "months",
            year: "years"
          },
          error: {
            missing: "Select whether the period between updates is in weeks, months or years"
          }
        }
      }
    },
    related: {
      add: {
        heading: "Add a link to a report",
        explain: "This may include reports for:",
        explain_1: "GOV.WALES statistics and research",
        explain_2: "statistical quality",
        explain_3: "other related work",
        form: {
          link_url: {
            label: "Link URL",
            hint: "This should start with either 'https://' or 'http://'",
            error: {
              missing: "Enter the link URL for a related report",
              invalid: "Enter the link URL in the correct format"
            }
          },
          link_label: {
            label: "Link text to appear on the webpage",
            hint: "This should be entered in the language in which you're viewing this service.",
            error: {
              missing: "Enter the link text to appear on the webpage for a related report"
            }
          }
        }
      },
      list: {
        heading: "Report links added",
        table: {
          link: "Report link",
          action_header: "Action",
          action_edit: "Change",
          action_delete: "Remove"
        },
        not_translated: "Not yet translated",
        form: {
          add_another: {
            heading: "Do you need to add a link to another report?",
            options: {
              yes: {
                label: "Yes"
              },
              no: {
                label: "No"
              }
            },
            error: {
              missing: "Select yes if you need to add a link to another report"
            }
          }
        }
      }
    },
    providers: {
      add: {
        heading: "Add a data provider",
        explain: 'If you cannot find the data provider in the list, you can <a class="govuk-link" href="{{request_data_provider_url}}">request a data provider be added</a>.',
        form: {
          provider: {
            hint: "Start typing or select from the list",
            error: {
              missing: "Select a data provider from the list of data providers"
            }
          }
        }
      },
      add_source: {
        heading: "Add a data source from the selected data provider",
        selected_provider: "Selected data provider",
        form: {
          has_source: {
            options: {
              yes: {
                label: "Select source"
              },
              no: {
                label: "No specific source from data provider"
              }
            },
            error: {
              missing: "Select whether to select a source or indicate there is no specific source from the data provider"
            }
          },
          source: {
            note: 'If you cannot find the source in the list, you can <a class="govuk-link" href="{{request_data_source_url}}">request a data source be added</a>.',
            hint: "Start typing or select from the list",
            error: {
              missing: "Select a source from the list of sources for the selected data provider"
            }
          }
        }
      },
      list: {
        heading: "Sources added",
        table: {
          provider: "Provider",
          source: "Source",
          action_header: "Action",
          action_edit: "Change",
          action_delete: "Remove",
          no_source: "No specific source from data provider"
        },
        form: {
          add_another: {
            heading: "Do you need to add another source?",
            options: {
              yes: {
                label: "Yes"
              },
              no: {
                label: "No"
              }
            },
            error: {
              missing: "Select yes if you need to add another source"
            }
          }
        }
      }
    },
    designation: {
      heading: "How is this dataset designated?",
      form: {
        designation: {
          options: {
            official: {
              label: "Official statistics"
            },
            accredited: {
              label: "Accredited official statistics"
            },
            in_development: {
              label: "Official statistics in development"
            },
            management: {
              label: "Management information"
            },
            none: {
              label: "No designation"
            }
          },
          error: {
            missing: "Select how this dataset is designated"
          }
        }
      }
    },
    topics: {
      heading: "Which topics are relevant to this dataset?",
      form: {
        topics: {
          error: {
            missing: "Select which topics are relevant to this dataset"
          }
        }
      }
    },
    schedule: {
      heading: "When should this dataset be published?",
      form: {
        date: {
          label: "Date",
          hint: "For example, 10 05 2024",
          error: {
            invalid: "The date this dataset should be published must be a real date",
            past: "The date this dataset should be published must be in the future"
          }
        },
        day: {
          label: "Day",
          error: "The date this dataset should be published must include a day"
        },
        month: {
          label: "Month",
          error: "The date this dataset should be published must include a month"
        },
        year: {
          label: "Year",
          error: "The date this dataset should be published must include a year"
        },
        time: {
          label: "Time",
          hint: "This will be 09:30 local UK time by default. Only change this if a different publication time is needed. Use 24 hour clock format, for example 15:00.",
          error: {
            invalid: "The time this dataset should be published must be a real time"
          }
        },
        hour: {
          label: "Hour",
          error: "The time this dataset should be published must include an hour"
        },
        minute: {
          label: "Minute",
          error: "The time this dataset should be published must include a minute"
        }
      },
      error: {
        saving: "Publish date could not be saved. Try again later."
      }
    },
    upload: {
      title: "Upload the data table",
      lookup_heading: "Upload a lookup table",
      measure_heading: "Upload a measure table",
      form: {
        file: {
          label: "The file should be in CSV, JSON or Parquet format"
        }
      },
      buttons: {
        upload: "Continue"
      },
      errors: {
        missing: "Select a data table",
        api: "The selected file could not be uploaded. Try again."
      }
    },
    preview: {
      heading: "Check the data table",
      heading_summary: "Data table summary",
      upload_has: "Your upload has:",
      columns: "{{count}} column",
      columns_other: "{{count}} columns",
      rows: "{{count}} row",
      rows_other: "{{count}} rows",
      row_number: "Row",
      preview_summary: 'There are $t(publish.preview.columns, {"count": {{cols}} }) and $t(publish.preview.rows, {"count": {{rows}} }) in your upload.',
      columns_rows: '$t(publish.preview.columns, {"count": {{cols}} }) and $t(publish.preview.rows, {"count": {{rows}} })',
      upload_summary: 'There are $t(publish.preview.columns, {"count": {{cols}} }) and $t(publish.preview.rows, {"count": {{rows}} }) in the data table. $t(publish.preview.columns, {"count": {{ignored}} }) in the uploaded file have been ignored.',
      showing_rows: "Showing rows {{start}} – {{end}} of {{total}}",
      unnamed_column: "column {{colNum}}",
      confirm_correct: "By continuing, you confirm the data table is correct.",
      revisit_question: "What do you need to do?",
      upload_different: "Upload a different data table",
      upload_different_hint: "Warning: This will remove all reference data from all dimensions",
      change_source: "Change the definition of what each column in the data table contains",
      change_source_hint: "Warning: This will remove all reference data from all dimensions",
      source_type: {
        data_values: "Data values",
        note_codes: "Note codes",
        measure: "Measure or data types",
        dimension: "Dimension",
        time: "Dimension containing dates",
        ignore: "This column can be ignored",
        unknown: "Unknown"
      }
    },
    sources: {
      heading: "What does each column in the data table contain?",
      types: {
        data_values: "Data values",
        note_codes: "Note codes",
        measure: "Measure or data types",
        dimension: "Dimension",
        time: "Dimension containing dates",
        ignore: "This column can be ignored",
        unknown: "Select"
      }
    },
    tasklist: {
      subheading: "Dataset tasklist",
      no_title: "No title available",
      overview: "Dataset overview",
      preview: "Preview (opens in new tab)",
      open_developer_view: "Developer view (opens in new tab)",
      delete: {
        dataset: "Delete this dataset",
        update: "Delete this update"
      },
      status: {
        cannot_start: "Cannot start yet",
        available: "Available",
        completed: "Completed",
        not_required: "Not required",
        not_started: "Not yet started",
        incomplete: "Incomplete",
        unchanged: "Unchanged",
        updated: "Updated"
      },
      data: {
        subheading: "Data",
        datatable: "Data table"
      },
      metadata: {
        subheading: "Metadata",
        title: "Title",
        summary: "Summary",
        data_collection: "Data collection",
        statistical_quality: "Statistical quality",
        data_sources: "Data sources",
        related_reports: "Related reports",
        update_frequency: "How often this dataset is updated",
        designation: "Designation",
        relevant_topics: "Relevant topics"
      },
      translation: {
        subheading: "Translation",
        export: "Export text fields for translation",
        import: "Import translations"
      },
      publishing: {
        subheading: "Publishing",
        when: "When this dataset should be published",
        when_update: "When this update should be published"
      },
      submit: {
        subheading: "By continuing, you confirm that all data and metadata has been checked and is correct.",
        button: "Submit for approval",
        success: "Dataset submitted for approval"
      }
    },
    point_in_time: {
      heading: "What date format is used?",
      example: "For example: {{example}}"
    },
    overview: {
      subheading: "Dataset overview",
      pending: {
        publish_at: "Proposed publication date: <strong>{{publishAt}}</strong>",
        requested_by: "Publishing requested by: <strong>{{userName}}</strong>"
      },
      scheduled: {
        publish_at: "Publishing scheduled: <strong>{{publishAt}}</strong>"
      },
      rejected: {
        summary: "Dataset was not approved for publishing because it has issues to fix:"
      },
      tabs: {
        actions: "Actions",
        history: "History"
      },
      actions: {
        view_published_dataset: "View published dataset (opens in new tab)",
        update_dataset: "Update this dataset",
        withdraw_first_revision: "Change dataset before publication",
        withdraw_update_revision: "Change update before publication",
        continue_update: "Continue update",
        continue: "Continue creating dataset",
        preview: "View dataset preview",
        move: "Move dataset to another group"
      },
      history: {
        table: {
          created_at: "Date",
          action: "Action",
          user: "User",
          comment: "Comments"
        },
        event: {
          dataset: {
            insert: "Dataset first created",
            publish: "Dataset first published"
          },
          revision: {
            insert: "Update started",
            publish: "Update published"
          },
          task: {
            publish: {
              requested: "Dataset submitted for approval",
              update_requested: "Update submitted for approval",
              withdrawn: "Dataset change started",
              update_withdrawn: "Update change started",
              rejected: "Dataset rejected for publishing",
              update_rejected: "Update rejected for publishing",
              approved: "Dataset approved for publishing",
              update_approved: "Update approved for publishing"
            }
          },
          created_by: {
            system: "System"
          }
        }
      },
      buttons: {
        pending_approval: "Respond to publishing request",
        fix: "Fix issues with dataset"
      },
      error: {
        withdraw: "Could not withdraw dataset from publication. You should contact support."
      }
    },
    update_type: {
      heading: "What do you need to do?",
      add: "Add new data only",
      add_revise: "Add new data and revise existing data",
      revise: "Revise existing data only",
      replace_all: "Replace all existing data",
      errors: {
        missing: "You need to select the type of update you wish to make"
      }
    },
    move_group: {
      heading: "Which group do you want to move this dataset to?",
      success: "Dataset moved to {{groupName}}"
    },
    task: {
      decision: {
        dataset_title: "Dataset title: <strong>{{title}}</strong>",
        publish: {
          requested: {
            heading: "Do you approve this dataset for publishing?",
            form: {
              decision: {
                options: {
                  yes: {
                    label: "Yes"
                  },
                  no: {
                    label: "No"
                  }
                },
                error: {
                  missing: "Select yes if you approve this dataset for publishing"
                }
              },
              reason: {
                label: "Enter reason and required actions",
                error: {
                  missing: "Enter why you do not approve this dataset for publishing and the required actions"
                }
              }
            }
          },
          flash: {
            approve: "Dataset approved for publishing",
            reject: "Dataset not approved for publishing"
          }
        }
      }
    }
  },
  translations: {
    export: {
      heading: "Export text fields for translation",
      table: {
        field: "Text field",
        value: "Text",
        action: "Change link"
      },
      field: {
        title: "Title",
        summary: "Summary",
        collection: "Data collection",
        quality: "Statistical quality",
        roundingDescription: "Rounding applied"
      },
      dimension: "{{value}} dimension name",
      measure: "{{value}} measure name",
      link: "Related report",
      buttons: {
        export: "Export CSV",
        change: "Change"
      }
    },
    import: {
      heading: "Import translation file",
      heading_preview: "Check the translated text",
      note: "You can only import the translation file if it has been fully populated.",
      form: {
        file: {
          label: "The file must be in CSV format",
          error: {
            missing: "Select the populated translation file to upload",
            invalid: "The selected file could not be uploaded. Check you have used the exported translation file for this dataset and have not changed any of the values in the key column.",
            values: "The translation file must be fully populated for both languages"
          }
        }
      },
      buttons: {
        import: "Import CSV",
        confirm: "Continue"
      },
      table: {
        field: "Text field",
        english: "Text (English)",
        welsh: "Text (Welsh)"
      }
    }
  },
  developer: {
    heading: "Developer Tools",
    list: {
      heading: "List Datasets",
      details: "Details",
      tasklist: "Task List",
      error: {
        no_datasets: "No datasets are currently listed in the database. If you need help, contact a member of the development team."
      },
      table: {
        id: "ID",
        title: "Title",
        group: "Group",
        revision_by: "Author",
        last_updated: "Last updated",
        dataset_status: "Dataset status",
        publish_status: "Publishing status",
        not_translated: "Not yet translated"
      }
    },
    display: {
      heading: "Display a Dataset",
      fact_table: "Fact Table",
      data_type: "DuckDB Data Type",
      created_by_id: "Created By",
      measure: "Measure",
      show_measure_table: "Show Measure Table",
      show_lookup_table_details: "Show lookup table details",
      reference: "Reference",
      format: "Format",
      decimals: "Decimal places",
      sort_order: "Sort Order",
      hierarchy: "Hierarchy",
      file_type: "File type",
      hash: "SHA256 Hash",
      uploaded_at: "Uploaded at",
      live: "Live date",
      id: "ID",
      name: "Name",
      title: "Title",
      description: "Description",
      notes: "Notes",
      contents: "Contents",
      summary: "Summary",
      dimension: "Dimension",
      start_revision: "Start Revision ID",
      index: "Index",
      type: "Type",
      created_at: "Creation Date",
      created_by: "Created By",
      revision: "Revision",
      import: "File Import",
      imports: "File Imports",
      download: "Download",
      download_file: "Download File",
      location: "Location",
      filename: "Filename",
      mime_type: "Mime Type",
      fact_tables: "Fact Table",
      fact_table_column: "Fact table column",
      join_column: "Join Column",
      extractor: "Extractor",
      show_extractor: "Show Extractor",
      metadata: "Metadata",
      show_metadata: "Show Metadata",
      all_files: "All Files",
      files: "Files",
      download_files: "Download Files",
      error: {
        no_dimensions: "This dataset has not been completed with dimensions",
        no_revisions: "This dataset has not been completed with revisions",
        no_description: "No description available"
      }
    }
  },
  errors: {
    confirm: {
      missing: "You need to confirm or reject the uploaded file using the buttons at the end of the preview"
    },
    session: {
      current_dataset_missing: "A data table cannot be found. Try uploading a data table.",
      current_revision_missing: "A data table cannot be found. Try uploading a data table.",
      current_import_missing: "A data table cannot be found. Try uploading a data table.",
      no_sources_on_import: "The selected data table does not contain any dimensions. Check the data table is correct."
    },
    sources: {
      unknowns_found: "Select what each column in the data table contains",
      no_notes_column: "There should be one column in the data table for note codes. Check you've selected the correct options or check the data table is correct.",
      multiple_datavalues: "There should only be one column in the data table for data values. Check you've selected the correct options or check the data table is correct.",
      multiple_footnotes: "There should only be one column in the data table for note codes. Check you've selected the correct options or check the data table is correct.",
      multiple_measures: "There should only be one column in the data table for measure or data types. Check you've selected the correct options or check the data table is correct.",
      dimension_creation_failed: "Dimensions could not be created. Check you've selected the correct options or check the data table is correct."
    },
    preview: {
      failed_to_get_preview: "Table preview could not be generated. Check you've added reference data to all dimensions or the data table is correct.",
      remove_error: "Uploaded file could not be removed from the server. Try again or contact support.",
      confirm_error: "Confirm or reject the uploaded file",
      revision_missing: "A revision is missing from this dataset",
      import_missing: "An import is missing from this dataset",
      invalid_download_format: "Select whether to download dataset as CSV, Parquet, Excel or DuckDB",
      select_action: "Select whether you need to upload a different data table or change the definition of what each column in the data table contains"
    },
    preview_failure: {
      heading: "Filed to generate dataset preview for {{datasetTitle}}",
      message: "Something went wrong trying to generate preview",
      error: "We were unable to generate a preview of the dataset due to an unexpected server error.",
      generation_fail: "Cube generation failed",
      no_preview: "Cube could not be generated, so table preview and download options are not available. Check you've added reference data to all dimensions or the data table is correct.",
      try_again: "Reload the page"
    },
    datalake_error: "Unable to connect to Data Lake",
    blob_storage_errror: "Unable to connect to Blob Storage Service",
    problem: "There is a problem",
    try_later: "Try again later",
    name_missing: "Dataset name missing",
    dataset_missing: "No dataset found with this ID",
    dimension_validation: {
      duplicate_descriptions_or_notes: "The descriptions columns in the lookup table are the same in all languages. Descriptions must be provided in all required languages.",
      fact_table_creation_failed: "Fact table could not be created by the system. Try again later or contact support.",
      items_not_in_category: "There are reference values in the dimension that are not in the data category you selected. Check you selected the correct type of data.",
      lookup_not_supported: "The file you uploaded could not be recognised. Check the file is in the correct format.",
      lookup_table_loading_failed: "Lookup table could not be added by the system. Try again later or contact support.",
      missing_languages: "The lookup table does not contain descriptions in the following languages: $t({{languages}}).",
      no_reference_data_categories_present: "There are reference values in the dimension that are not in the data category you selected. Check you selected the correct type of data.",
      no_reference_match: "There are reference values in the dimension that are not in the data category you selected. Check you selected the correct type of data.",
      non_numerical_values_present: "The dimension contains non-numerical values. Check you selected the correct type of reference data and that your data table is correct.",
      primary_key_failed: "There are duplicate references in your lookup table. Remove any duplicates from your lookup table and upload it again.",
      reference_data_preview_failed: "Reference data could not be added by the system. Try again later or contact support.",
      "reference_data_validation_failed.": "Reference data could not be added to cube. Check you selected the correct type of reference data and that your data table is correct.",
      some_references_failed_to_match: "Reference data cannot be matched to the data table. Check you selected the correct type of reference data and that your data table is correct.",
      to_many_categories_present: "There are reference values in the dimension that are not in the data category you selected. Check you selected the correct type of data.",
      unknown_error: "Something went wrong adding the reference data to the cube. Try again later or contact support.",
      unknown_reference_data_items: "Reference data cannot be matched to the data table. Check you selected the correct type of reference data and that your data table is correct.",
      unknown_type: "The type of dimension data you selected is not supported. You should selected 'Something else' and upload a lookup table."
    },
    measure_validation: {
      duplicate_descriptions_or_notes: "The descriptions columns in the measure lookup table are the same in all languages. Descriptions must be provided in all required languages.",
      extracting_data_failed: "Measure lookup table could not be added to the cube. Check that you uploaded the correct lookup table.",
      invalid_decimals_present: "The decimal column in the measure lookup table should only contain positive integer values. Correct the measure lookup table and upload it again.",
      invalid_formats_present: "The decimal column in the measure lookup table should only contain either decimal, float, integer, long, percentage, string, text, date, datetime or time. Correct the measure lookup table and upload it again.",
      missing_languages: "The measure lookup table does not contain descriptions in the following languages: $t({{languages}}).",
      no_description_columns: "The measure lookup table does not contain any description columns. Correct the measure lookup table and upload it again.",
      no_join_column: "Measure lookup table could not be added to the cube. Check that the measure lookup table contains a refcode column. Correct the measure lookup table and upload it again.",
      no_reference_match: "Measure lookup table cannot be matched to the data table. Check you uploaded the correct measure lookup table and that your data table is correct.",
      primary_key_failed: "There are duplicate references in your measure lookup table. Remove any duplicates from your measure lookup table and upload it again.",
      some_references_failed_to_match: "Lookup table cannot be matched to the data table. Check you uploaded the correct lookup table and that your data table is correct.",
      unknown_error: "Measure lookup table could not be added to the cube by the system. Try again later or contact support."
    },
    file_validation: {
      invalid_decimals_present: "The decimal column in the measure lookup table should only contain positive integer values. Correct the measure lookup table and upload it again.",
      wrong_data_type_in_reference: "Lookup table cannot be matched to the data table. Check you uploaded the correct lookup table and that your data table is correct.",
      unknown_mime_type: "The selected file must be in CSV, Excel (XLSX), JSON or Parquet format",
      unknown_file_format: "The selected file must be in CSV, Excel (XLSX), JSON or Parquet format",
      invalid_unicode: "CSV and JSON files must be in UTF-8 format. Save the file in the correct format and upload it again.",
      missing_languages: "The lookup table does not contain descriptions in the all required languages",
      invalid_csv: "Could not upload the selected CSV file. Check the file is correct and try again.",
      invalid_json: "Could not upload the selected JSON file. Check the file is correct and try again.",
      fact_table: "Fact table could not be created by the system. Try again later or contact support.",
      datalake: "A required file could not be found in the service's data storage. Try again later or contact support.",
      unknown: "Something went wrong with the system. Try again later or contact support."
    },
    dimension: {
      name_missing: "Enter what this dimension should be called on the StatsWales website",
      name_too_long: "Dimension name must be 256 characters or less",
      naming_failed: "Dimension name could not be added. Try again.",
      illegal_characters: 'Dimension name can only contain letters, numbers and the characters "£ $ € ¢ % ( ) _ - +"',
      dimension_period_type_required: "Select whether the dimension contains periods or specific points",
      dimension_type_required: "Select the kind of data this dimension contains",
      year_type_required: "Select the type of year the dimension represents",
      year_format_required: "Select the format used for years in the dimension",
      shortest_period_required: "Select what the shortest periods in the dimension are",
      quarter_type_required: "Select the format used for quarters in the dimension",
      quarter_total_type_required: "Select whether a fifth quarter is used to represent yearly totals",
      month_type_required: "Select the format used for months in the dimension",
      number_type_required: "Select what kind of numbers this dimension contains",
      invalid_unicode: "CSV and JSON files must be in UTF-8 format. Save the file in the correct format and upload it again."
    },
    upload: {
      no_csv: "Select a lookup table",
      no_csv_data: "Select a lookup table"
    },
    not_found: "Page not found",
    server_error: "An unknown error occurred, try again later",
    forbidden: {
      heading: "You do not have permission to access this page",
      description: "If you think you should have access to this page, you should contact a service administrator."
    },
    dimension_reset: "Something went wrong trying to reset the dimension",
    fact_table_validation: {
      incomplete_fact: "Data table has {{count}} instances incomplete facts",
      incomplete_fact_500: "Data table has {{count}} or more instances incomplete facts",
      incomplete_fact_missing: "Data table has an unknown number of incomplete facts",
      incomplete_fact_info: "You should correct your data table and upload it again.",
      incomplete_table_summary: "Table containing {{rows}} lines of incomplete facts.",
      incomplete_table_summary_500: "Table containing the first {{rows}} lines of incomplete facts.",
      change_data_table: "Replace the data table",
      duplicate_fact: "Data table has {{count}} or more instances duplicate facts",
      duplicate_fact_500: "Data table has {{count}} instances duplicate facts",
      duplicate_fact_missing: "Data table has an unknown number of duplicate facts",
      unknown_duplicate_fact: "The data table has one or more duplicate facts already in the cube.",
      duplicate_fact_info: "You should correct your data table and upload it again.",
      change_sources_action: "Change what each column contains",
      duplicate_fact_summary: "Duplicate facts",
      duplicate_table_summary: "Show Table containing {{rows}} lines of duplicate facts",
      duplicate_table_summary_500: "Show Table containing the first {{rows}} lines of duplicate facts",
      bad_note_codes: "Date table has {{count}} instances of unrecognised note codes",
      bad_note_codes_500: "Date table has {{count}} or more instances of unrecognised note codes",
      bad_note_codes_missing: "Date table has unknown number of unrecognised note codes",
      bad_node_code_fact_summary: "Facts with unrecognised notes codes",
      bad_node_code_table_summary: "Show Table containing {{rows}} lines with unrecognised codes",
      bad_node_code_table_summary_500: "Show Table containing the first {{rows}} lines with unrecognised codes",
      bad_node_code_info: "You should check you have used standard note codes.  Correct your data table and upload it again."
    }
  },
  consumer_view: {
    about_this_dataset: "About this dataset",
    overview: "Overview",
    data: "Data",
    download: "Download",
    data_view: "Data view",
    select_view: "Select view",
    data_table: "Data table",
    apply_view: "Apply view",
    filters: "Filters",
    apply_filters: "Apply filters",
    start_date: "Start Date",
    end_date: "End Date",
    download_heading: "Select the filtered or whole dataset to download",
    filtered_download: "Filtered dataset (using currently active filters)",
    default_download: "Whole dataset",
    download_format: "Select download format",
    data_only_hint: "Contains only the dataset",
    data_metadata_hint: "Contains the dataset and metadata",
    everything_hint: "Contains the dataset, metadata and associated lookup tables",
    number_formating: "Select number formatting",
    formatted_numbers: "Formatted numbers",
    formatted_numbers_hint: "This includes rounding to decimal places and commas to separate thousands",
    unformatted_numbers: "Unformatted numbers",
    select_language: "Select language",
    english: "English",
    welsh: "Welsh",
    download_button: "Download data"
  },
  routes: {
    healthcheck: "healthcheck",
    feedback: "feedback",
    dataset: "dataset",
    publish: "publish",
    start: "start",
    title: "title",
    preview: "preview",
    upload: "upload",
    confirm: "confirm",
    sources: "sources",
    source_confirmation: "source-confirmation",
    tasklist: "tasklist"
  },
  admin: {
    group: {
      list: {
        heading: "Groups",
        table: {
          name: "Name",
          email: "Contact",
          user_count: "Users",
          dataset_count: "Datasets"
        },
        buttons: {
          add: "Add group"
        }
      },
      view: {
        details: {
          heading: "Group details",
          organisation: {
            heading: "Organisation",
            not_set: "Not set"
          },
          email: {
            heading: "Contact email",
            not_set: "Not set"
          }
        },
        users: {
          heading: "Users",
          none: "No users assigned to this group",
          table: {
            name: "Name or email address",
            roles: "Roles",
            status: "Status"
          }
        },
        datasets: {
          heading: "Datasets",
          dataset: "There is {{count}} dataset",
          dataset_other: "There are {{count}} datasets",
          some: '$t(admin.group.view.datasets.dataset, {"count": {{count}} }) assigned to this group',
          none: "No datasets assigned to this group"
        },
        buttons: {
          edit: "Change group details"
        }
      },
      name: {
        heading: "What is the name of the group?",
        form: {
          name_en: {
            label: "Enter the name in English",
            error: {
              missing: "Enter the name of the group in English"
            }
          },
          name_cy: {
            label: "Enter the name in Welsh",
            error: {
              missing: "Enter the name of the group in Welsh"
            }
          }
        },
        buttons: {
          create: "Create group",
          continue: "Continue"
        }
      },
      organisation: {
        heading: "Which organisation does the group belong to?",
        form: {
          organisation_id: {
            label: "Organisation",
            placeholder: "Select organisation",
            error: "Select the organisation the group belongs to"
          }
        },
        error: {
          saving: "Organisation could not be saved. Try again later."
        }
      },
      email: {
        heading: "What is the public email address for datasets in the group?",
        form: {
          email_en: {
            label: "Enter the email in English",
            error: {
              missing: "Enter the public email address for datasets in the group in English",
              invalid: "Enter a valid email for the group in English"
            }
          },
          email_cy: {
            label: "Enter the email in Welsh",
            error: {
              missing: "Enter the public email address for datasets in the group in Welsh",
              invalid: "Enter a valid email for the group in Welsh"
            }
          }
        },
        success: {
          create: "Group created successfully",
          update: "Group updated successfully"
        }
      }
    },
    user: {
      list: {
        heading: "Users",
        table: {
          name: "Name or email address",
          groups: "Groups",
          login: "Last login",
          status: "Status"
        },
        buttons: {
          add: "Add user"
        }
      },
      create: {
        heading: "What is the user's email address?",
        form: {
          email: {
            label: "Email address",
            error: {
              missing: "Enter the user's email address",
              invalid: "Enter a valid email address"
            }
          }
        },
        buttons: {
          create: "Add user",
          continue: "Continue"
        },
        success: "User created successfully",
        error: {
          saving: "There was a problem saving the user",
          email_already_exists: "A user with this email address already exists"
        }
      },
      view: {
        heading: "What do you want to do?",
        details: {
          status: "Status",
          email: "Email address",
          login: "Last login",
          service_admin: "Service administrator",
          developer: "Developer"
        },
        login_never: "Never",
        groups: {
          heading: "Groups",
          empty: "No assigned groups",
          table: {
            name: "Group name",
            roles: "Roles"
          }
        },
        actions: {
          heading: "Actions",
          edit_roles: {
            label: "View or change roles and groups"
          },
          deactivate: {
            label: "Deactivate user"
          },
          reactivate: {
            label: "Reactivate user"
          }
        }
      },
      roles: {
        heading: "Which roles does {{userName}} have?",
        service: {
          heading: "StatsWales"
        },
        form: {
          groups: {
            error: {
              invalid: "Select a group"
            }
          },
          roles: {
            options: {
              service_admin: {
                label: "Service administrator"
              },
              developer: {
                label: "Developer"
              },
              editor: {
                label: "Editor"
              },
              approver: {
                label: "Approver"
              }
            },
            error: {
              invalid: "Select which roles {{userName}} has for {{groupName}}"
            }
          }
        },
        success: {
          create: "{{userName}} added",
          update: "{{userName}} updated"
        }
      },
      deactivate: {
        heading: "Are you sure you want to deactivate {{userName}}?",
        description: "This user will not be able to sign in or edit any datasets.",
        success: "{{userName}} deactivated",
        error: {
          saving: "User could not be deactivated. Try again later."
        }
      },
      reactivate: {
        heading: "Are you sure you want to reactivate {{userName}}?",
        description: "This user will be able to sign in and resume their assigned roles.",
        success: "{{userName}} reactivated",
        error: {
          saving: "User could not be reactivated. Try again later."
        }
      },
      badge: {
        status: {
          active: "Active",
          inactive: "Deactivated"
        }
      }
    }
  },
  consumer: {
    global: {
      home_label: "Home",
      heading: "StatsWales",
      phase_banner: {
        beta: "Beta",
        feedback: "You’re viewing a new version of StatsWales"
      }
    },
    topic_list: {
      heading: "Find statistics and data from the Welsh Government",
      topics: "Topics",
      topic: "Topic",
      dataset: {
        first_published: "First published: {{published}}"
      }
    },
    list: {
      heading: "Find statistics and data from the Welsh Government",
      total_datasets: "datasets"
    }
  },
  languages: {
    en: "English",
    cy: "Welsh"
  }
};
const cyTranslation = merge({}, enTranslation, {
  // show missing translations in English
  app_title: "StatsCymru",
  developer_warning: '<strong class="govuk-tag govuk-tag--red govuk-phase-banner__content__tag">Warning</strong> Tudalen y datblygwr yw hon ac nid yw wedi bod trwy waith ymchwil gyda defnyddwyr',
  developer_tag: '<span class="govuk-tag govuk-tag--yellow govuk-phase-banner__content__tag">Developer Page</span>',
  external_tag: '<span class="govuk-tag govuk-tag--orange govuk-phase-banner__content__tag">External Page</span>',
  yes: "Yes (awaiting feedback from Alex on this)",
  no: "No (awaiting feedback from Alex on this)",
  toc: "Cynnwys",
  buttons: {
    continue: "Parhau",
    back: "Yn ôl",
    upload_csv: "Parhau"
  },
  badge: {
    dataset_status: {
      new: "Set ddata newydd",
      live: "Set ddata fyw"
    },
    publishing_status: {
      published: "Cyhoeddwyd",
      incomplete: "Anghyflawn",
      scheduled: "Wedi'i hamserlennu",
      update_incomplete: "Diweddariad yn Anghyflawn",
      update_scheduled: "Diweddariad wedi'i Amserlennu"
    }
  },
  pagination: {
    previous: "Blaenorol",
    next: "Nesaf",
    update: "Diweddaru",
    page_size: "Maint y dudalen"
  },
  header: {
    product_name: "StatsCymru F3.0",
    beta: "Beta",
    feedback: `Rydych chi'n edrych ar fersiwn newydd o StatsCymru.  Gallwch gael cymorth trwy droi at <a class="govuk-link" href="http://statswales3support.slack.com">Slack</a>.`,
    logo: "StatsCymru logo",
    navigation: {
      menu: "Dewislen",
      skip_to_content: "Neidio i'r prif gynnwys",
      publish_dataset: "Cyhoeddi set ddata",
      guidance: "Canllawiau",
      list_datasets: "Rhestru setiau data",
      logout: "Allgofnodi",
      developer: "Datblygwr"
    }
  },
  footer: {
    top_of_page: "Yn ôl i'r brig",
    contact_us: "Cysylltu â ni",
    accessibility: "Hygyrchedd",
    copyright_statement: "Datganiad Hawlfraint",
    cookies: "Cwcis",
    privacy: "Preifatrwydd",
    terms_conditions: "Amodau a thelerau",
    modern_slavery: "Datganiad caethwasiaeth fodern",
    welsh_gov: "Llywodraeth Cymru"
  },
  login: {
    heading: "Mewngofnodi",
    buttons: {
      entraid: "Microsoft",
      google: "Google",
      local: "Ffurflen"
    },
    error: {
      summary_title: "Mae problem wedi codi",
      generic: "Nid oedd modd eich mewngofnodi.  Rhowch gynnig eto yn nes ymlaen.",
      expired: "Mae eich sesiwn wedi dod i ben.  Mewngofnodwch eto."
    },
    form: {
      notice_1: "Mae'r enw defnyddiwr a roddwyd i chi yn enw defnyddiwr dros dro.  Dim ond yn ystod y cyfnod profi hwn y byddwch yn gallu ei ddefnyddio i fewngofnodi.",
      notice_2: "Peidiwch â lanlwytho unrhyw ddata sensitif neu ddata na ddylai defnyddwyr eraill StatsCymru gael mynediad iddo.",
      username: {
        label: "Enw defnyddiwr",
        error: "Nodwch eich enw defnyddiwr"
      },
      submit: "Mewngofnodi"
    }
  },
  homepage: {
    heading: "Setiau data",
    table: {
      id: "Cod adnabod",
      title: "Teitl",
      last_updated: "Diweddarwyd ddiwethaf",
      dataset_status: "Statws set ddata",
      publish_status: "Statws cyhoeddi"
    },
    status: {
      new: "Newydd",
      live: "Byw"
    },
    publishing_status: {
      incomplete: "Anghyflawn",
      update_incomplete: "Diweddariad Heb ei Gwblhau",
      scheduled: "Wedi'i amserlennu",
      update_scheduled: "Diweddariad wedi'i Amserlennu",
      published: "Cyhoeddwyd"
    },
    buttons: {
      create: "Creu set ddata newydd"
    }
  },
  guidance: {
    title: "Canllawiau ar gyfer StatsCymru 3 (SC3)"
  },
  dataset_view: {
    key_information: {
      heading: "Gwybodaeth allweddol",
      last_update: "Diweddariad mwyaf diweddar",
      next_update: "Disgwylir y diweddariad nesaf (dros dro)",
      data_provider: "Darparwr data",
      data_providers: "Darparwr data {{index}}",
      data_source: "Ffynhonnell data",
      data_sources: "Ffynhonnell data {{index}}",
      no_source: "Dim ffynhonnell benodol gan y darparwr data",
      data_categories: "Categorïau data",
      time_covered: "Cyfnod dan sylw",
      time_period: "{{start}} tan {{end}}",
      update_missing: "Dyddiad cyhoeddi heb ei nodi eto",
      next_update_missing: "Dyddiad cyhoeddi neu amlder diweddaru heb ei nodi eto",
      not_updated: "Ni chaiff y set ddata hon ei diweddaru"
    },
    downloads: {
      heading: "Lawrlwythiadau"
    },
    notes: {
      heading: "Nodiadau data",
      revisions: "Diwygiadau",
      data_value_shorthand: "Llaw-fer gwerth data",
      rounding: "Wedi'i dalgrynnu",
      no_rounding: "Heb ei dalgrynnu",
      a: "Cyfartaledd",
      c: "Gwybodaeth gyfrinachol",
      e: "Amcangyfrifedig",
      f: "Rhagolygol",
      k: "Ffigwr isel",
      p: "Dros dro",
      r: "Diwygiedig",
      t: "Cyfanswm",
      u: "Dibynadwyedd isel",
      x: "Ddim ar gael",
      z: "Ddim yn berthnasol"
    },
    about: {
      heading: "Am y set ddata hon",
      summary: "Crynodeb",
      data_collection: "Casglu a chyfrifo data",
      statistical_quality: "Ansawdd ystadegol",
      designation: "Dynodiad",
      designations: {
        official: "Ystadegau swyddogol",
        accredited: "Ystadegau swyddogol achrededig",
        in_development: "Ystadegau swyddogol sy'n cael eu datblygu",
        management: "Gwybodaeth reolaethol",
        none: "Dim dynodiad"
      },
      related_reports: "Adroddiadau cysylltiedig"
    },
    published: {
      heading: "Cyhoeddwyd gan",
      org: "Sefydliad",
      contact: "Cyfeiriad e-bost cysylltu"
    },
    buttons: {
      csv: "Lawrlwytho fel CSV",
      excel: "Lawrlwytho fel Excel",
      json: "Lawrlwytho fel JSON",
      duckdb: "Lawrlwytho fel DuckDB"
    },
    contents: "Cynnwys",
    download: "Lawrlwytho",
    download_as: {
      csv: "Lawrlwytho fel CSV",
      parquet: "Lawrlwytho fel Parquet",
      excel: "Lawrlwytho fel Excel",
      duckdb: "Lawrlwytho fel DuckDB"
    },
    table_preview: "Rhagolwg o'r Tabl",
    table_note: "Ni ddangosir hwn i'r defnyddiwr",
    not_entered: "Heb ei nodi eto",
    not_selected: "Heb ei ddewis eto",
    not_available: "Ddim ar Gael",
    categories_missing: "Data cyfeirio heb ei ddewis eto",
    period_cover_missing: "Gwybodaeth am y dyddiad heb ei nodi eto"
  },
  publish: {
    header: {
      overview: "Dychwelyd i'r trosolwg o'r set ddata",
      back: "Yn ôl"
    },
    cube_preview: {
      panel: "Dyma ragolwg o'r set ddata hon.",
      heading: "Gwybodaeth allweddol"
    },
    start: {
      title: "Creu set ddata newydd",
      p1: "I greu set ddata newydd, bydd angen y canlynol arnoch:",
      data_table: "tabl data sy'n cynnwys gwerthoedd data a chyfeiriadau at yr holl ddimensiynau perthnasol",
      lookup_table: "unrhyw dablau am-edrych a gynhyrchir gan y defnyddiwr, y mae angen i chi eu cynnwys (os yn berthnasol)",
      metadata: "metadata am y set ddata hon, yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn"
    },
    dimension_name: {
      heading: "Beth ddylai enw'r dimensiwn hwn fod ar wefan StatsCymru?",
      concise: "fod yn gryno, gan esbonio'r hyn y mae'r dimensiwn yn ei gynnwys yn glir",
      language: "cael ei nodi yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn"
    },
    dimension_type_chooser: {
      heading: "Ychwanegu data cyfeirio",
      subheading: "Dimensiwn",
      question: "Pa fath o ddata y mae'r dimensiwn hwn yn ei gynnwys?",
      chooser: {
        age: "Oedran",
        ethnicity: "Ethnigrwydd",
        geography: "Daearyddiaeth",
        religion: "Crefydd",
        sex_gender: "Rhyw a rhywedd",
        lookup: "Rhywbeth arall"
      }
    },
    time_dimension_chooser: {
      heading: "Creu dimensiwn sy'n cynnwys dyddiadau",
      subheading: "Dyddiadau",
      showing: "Sampl o {{rows}} o {{total}} rhes.",
      question: "Pa fath o ddyddiadau y mae'r dimensiwn yn eu cynnwys?",
      chooser: {
        period: "Cyfnodau amser",
        "period-hint": "Er enghraifft, misoedd neu flynyddoedd y mae'r gwerthoedd data yn berthnasol iddynt",
        point: "Pwyntiau penodol mewn amser",
        "point-hint": "Er enghraifft, dyddiadau penodol pan gasglwyd gwerthoedd data"
      }
    },
    lookup_table_review: {
      heading: "Gwirio'r tabl am-edrych",
      showing: "Dangos sampl o {{rows}} o {{total}} rhes.",
      confirm: "Trwy barhau, rydych chi'n cadarnhau bod y tabl am-edrych yn gywir.",
      go_back: "Dewis gwahanol dabl am-edrych",
      column_headers: {
        fact_table: "Tabl Ffeithiau:",
        lookup_table: "Tabl Am-edrych:",
        description_en: "Disgrifiad (Saesneg)",
        description_cy: "Disgrifiad (Cymraeg)",
        sort_order: "Trefn Ddidoli",
        hierarchy: "Hierarchiaeth",
        notes_en: "Nodiadau (Saesneg)",
        notes_cy: "Nodiadau (Cymraeg)"
      }
    },
    measure_review: {
      heading: "Gwirio'r tabl mesur",
      showing: "Dangos sampl o {{rows}} o {{total}} rhes.",
      confirm: "Trwy barhau, rydych chi'n cadarnhau bod y tabl mesur yn gywir.",
      go_back: "Dewis tabl mesur gwahanol",
      column_headers: {
        fact_table: "Tabl Ffeithiau:",
        lookup_table: "Tabl Am-edrych:",
        description_en: "Disgrifiad (Saesneg)",
        description_cy: "Disgrifiad (Cymraeg)",
        sort: "Trefn Ddidoli",
        sort_order: "Trefn Ddidoli",
        notes_en: "Nodiadau (Saesneg)",
        notes_cy: "Nodiadau (Cymraeg)",
        decimal: "Gwerth Degol",
        format: "Fformat",
        measure_type: "Math o Werth"
      },
      column_values: {
        "0": "No (awaiting feedback from Alex on this)",
        "1": "Yes (awaiting feedback from Alex on this)"
      }
    },
    time_dimension_review: {
      heading: "Cadarnhewch bod y dyddiadau'n gywir",
      showing: "Dangos sampl o {{rows}} o {{total}} rhes.",
      confirm: "Trwy barhau, rydych chi'n cadarnhau bod y dyddiadau'n gywir.",
      go_back: "Newid fformat y dyddiad",
      column_headers: {
        date_code: "Cod dyddiad",
        description: "Disgrifiad",
        start_date: "Dechrau",
        end_date: "Gorffen",
        date_type: "Math o ddyddiad"
      },
      year_type: {
        calendar_year: "Blwyddyn Galendr",
        calendar_quarter: "Chwarter Calendr",
        calendar_month: "Mis Calendr",
        financial_year: "Blwyddyn Ariannol",
        financial_quarter: "Chwarter Ariannol",
        financial_month: "Mis Ariannol",
        academic_year: "Blwyddyn Academaidd",
        academic_quarter: "Chwarter Academaidd",
        academic_month: "Mis Academaidd",
        tax_year: "Blwyddyn Dreth",
        tax_quarter: "Chwarter Treth",
        tax_month: "Mis Treth",
        meteorological_year: "Blwyddyn Feteorolegol",
        meteorological_quarter: "Chwarter Meteorolegol",
        meteorological_month: "Mis Meteorolegol",
        specific_day: "Pwynt penodol mewn amser"
      }
    },
    measure_preview: {
      heading: "Lanlwytho tabl am-edrych mesur"
    },
    "period-type-chooser": {
      heading: "Beth yw'r cyfnodau amser byrraf yn y dimensiwn?",
      subheading: "Dyddiadau",
      chooser: {
        years: "Blynyddoedd",
        quarters: "Chwarteri",
        months: "Misoedd"
      }
    },
    year_type: {
      heading: "Pa fath o flwyddyn y mae'r dimensiwn yn ei chynrychioli?",
      chooser: {
        calendar: "Calendr",
        "calendar-hint": "1 Ionawr tan 31 Rhagfyr",
        financial: "Ariannol",
        "financial-hint": "1 Ebrill tan 31 Mawrth",
        tax: "Treth",
        "tax-hint": "6 Ebrill tan 5 Ebrill",
        academic: "Academaidd",
        "academic-hint": "1 Medi tan 31 Awst",
        meteorological: "Meteorolegol",
        "meteorological-hint": "1 Mawrth i 28 neu 29 Chwefror"
      }
    },
    year_format: {
      heading: "Pa fformat a ddefnyddir ar gyfer blynyddoedd yn y dimensiwn?",
      example: "Er enghraifft, {{example}}"
    },
    quarter_format: {
      heading: "Pa fformat a ddefnyddir ar gyfer chwarteri yn y dimensiwn?",
      "heading-alt": "Pa fformat a ddefnyddir ar gyfer cyfansymiau chwarterol?",
      example: "Er enghraifft, {{example}}",
      fifth_quarter: "A ddefnyddir chwarter i gynrychioli cyfansymiau blynyddol?",
      no_quarterly_totals: "Nid oes cyfansymiau chwarterol"
    },
    month_format: {
      heading: "Pa fformat a ddefnyddir ar gyfer misoedd yn y dimensiwn?",
      example: "Er enghraifft, {{example}}"
    },
    measure_match_failure: {
      heading: "Ni ellir cyfateb data y tabl am-edrych mesur gyda'r tabl data",
      information: "Nid oes {{failureCount, number}} cyfeiriad yn y dimensiwn yn cyd-fynd â'r cyfeiriadau yn eich tabl am-edrych mesur.  Dylech wirio:",
      formatting: "bod y codau cyfeirio a ddefnyddir yn y tabl data yn gywir",
      choices: "eich bod wedi dewis y tabl am-edrych cywir ar gyfer eich mesur"
    },
    dimension_match_failure: {
      lookup_heading: "Ni ellir cyfateb data y tabl am-edrych gyda'r tabl data",
      heading: "Ni ellir cyfateb y data cyfeirio gyda'r tabl data",
      lookup_information: "Nid oes {{failureCount, number}} cyfeiriad yn y dimensiwn yn cyd-fynd â'r cyfeiriadau yn eich tabl am-edrych.  Dylech wirio:",
      ref_information: "Nid oes {{failureCount, number}} cyfeiriad yn y dimensiwn yn cyd-fynd â chategori y data cyfeirio a ddewisoch.  Dylech wirio:",
      formatting: "bod y codau cyfeirio a ddefnyddiwyd yn y tabl data yn gywir",
      choices: "eich bod wedi dewis y tabl am-edrych cywir",
      subheading: "Ni ellir cyfateb y codau cyfeirio",
      ref_choices: "eich bod wedi dewis y categori data cyfeirio cywir",
      actions: "Gweithredoedd",
      upload_different_file: "Lanlwytho tabl data wedi'i gywiro neu dabl data gwahanol",
      upload_different_file_warning: "(Bydd hyn yn gwaredu data cyfeirio o bob dimensiwn)",
      try_different_format: "Dewis gwahanol dabl am-edrych",
      no_matches: "Nid oes unrhyw rai o'r dyddiadau yn cyd-fynd â'r fformat a ddarparwyd"
    },
    period_match_failure: {
      heading: "Ni ellir cyfateb fformat y dyddiad gyda'r dimensiwn",
      information: "Nid oes {{failureCount, number}} cod dyddiad yn y dimensiwn yn cyd-fynd â'r fformat dyddiadau a nodoch.  Dylech wirio:",
      formatting: "bod yr holl godau dyddiad yn y dimensiwn yn gywir",
      choices: "eich bod wedi nodi'r fformat dyddiad cywir",
      supplied_format: "Fformat dyddiad a nodwyd:",
      year_format: "Blwyddyn: {{format}}",
      quarter_format: "Chwarter: {{format}}",
      month_format: "Mis: {{format}}",
      date_format: "Dyddiad: {{format}}",
      subheading: "Codau dyddiad unigryw na ellir eu cyfateb",
      actions: "Gweithredoedd",
      upload_different_file: "Lanlwytho tabl data wedi'i gywiro neu dabl data gwahanol",
      upload_different_file_warning: "(Bydd hyn yn gwaredu data cyfeirio o bob dimensiwn)",
      try_different_format: "Nodi fformat dyddiad gwahanol",
      no_matches: "Nid oes unrhyw rai o'r dyddiadau yn cyd-fynd â'r fformat a ddarparwyd"
    },
    title: {
      heading: "Beth yw teitl y set ddata hon?",
      appear: "Dyma'r teitl a fydd yn ymddangos ar wefan StatsCymru",
      descriptive: "Dylai fod yn fyr, yn ddisgrifiadol ac yn unigryw",
      form: {
        title: {
          hint: "Dylid nodi hyn yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn.",
          error: {
            missing: "Nodwch deitl y set ddata hon",
            too_long: "Rhaid i deitl y set ddata hon fod yn 1,000 nod neu'n llai",
            too_short: "Rhaid i deitl y set ddata hon fod yn 3 nod neu'n fwy",
            unique: "Mae'r teitl a nodwyd yn cael ei ddefnyddio yn barod ar gyfer set ddata a gyhoeddwyd.  Nodwch deitl unigryw ar gyfer y set ddata hon."
          }
        }
      }
    },
    summary: {
      heading: "Beth yw'r crynodeb o'r set ddata hon?",
      explain: "Yn fyr, mae brawddegau syml yn esbonio:",
      explain_1: "beth mae'r set ddata hon amdano a'r hyn y mae'n ei ddangos",
      explain_2: "dimensiynau'r set ddata hon a pham eu bod wedi cael eu defnyddio, os oes angen",
      language: "Dylid nodi hyn yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn.",
      form: {
        description: {
          error: {
            missing: "Nodwch y crynodeb o'r set ddata hon"
          }
        }
      }
    },
    collection: {
      heading: "Sut oedd y data wedi cael ei gasglu neu ei gyfrifo?",
      explain: "Yn fyr, brawddegau syml sy'n esbonio naill ai:",
      explain_1: "y fethodoleg a ddefnyddiwyd i gasglu'r data",
      explain_2: "y fethodoleg a ddefnyddiwyd i gyfrifo'r data",
      explain_3: "y ddau uchod",
      language: "Dylid nodi hyn yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn.",
      form: {
        collection: {
          error: {
            missing: "Nodwch sut y cafodd y data ei gasglu neu ei gyfrifo"
          }
        }
      }
    },
    quality: {
      heading: "Beth yw ansawdd ystadegol y set ddata hon?",
      explain: "Yn fyr, mewn brawddegau syml, esboniwch:",
      explain_1: "unrhyw faterion neu newidiadau methodolegol sy'n ymwneud â'r set ddata hon, gan gynnwys unrhyw:",
      explain_1a: "nodiadau sy'n berthnasol i'r holl werthoedd data yn y set ddata hon",
      explain_1b: "esboniadau wedi'u haddasu sy'n angenrheidiol er mwyn egluro unrhyw godau nodiadau a ddefnyddiwyd",
      explain_2: "crynodeb lefel uchel o'r adroddiad ansawdd ystadegol, os yw ar gael",
      language: "Dylid nodi hyn yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn.",
      form: {
        quality: {
          error: {
            missing: "Nodwch ansawdd ystadegol y set ddata hon"
          }
        },
        rounding_applied: {
          heading: "A yw'r gwerthoedd data wedi cael eu talgrynnu?",
          options: {
            yes: {
              label: "Ydynt",
              note: "Mewn brawddegau syml a byr, esboniwch pa waith talgrynnu sydd wedi cael ei wneud."
            },
            no: {
              label: "Nac ydynt"
            }
          },
          error: {
            missing: "Nodwch a oes unrhyw rai o'r gwerthoedd data wedi cael eu talgrynnu"
          }
        },
        rounding_description: {
          label: "Mewn brawddegau syml a byr, esboniwch pa waith talgrynnu sydd wedi cael ei wneud.",
          error: {
            missing: "Nodwch pa waith talgrynnu sydd wedi cael ei wneud i'r gwerthoedd data"
          }
        }
      }
    },
    update_frequency: {
      heading: "A fydd y set ddata hon yn cael ei diweddaru'n rheolaidd?",
      form: {
        is_updated: {
          options: {
            yes: {
              label: "Bydd"
            },
            no: {
              label: "Na fydd"
            }
          },
          error: {
            missing: "Nodwch a fydd y set ddata hon yn cael ei diweddaru'n rheolaidd neu beidio"
          }
        },
        frequency_value: {
          label: "Nodwch y cyfnod rhwng diweddariadau.  Er enghraifft, blwyddyn.",
          error: {
            missing: "Nodwch nifer yr wythnosau, y misoedd neu'r blynyddoedd ar gyfer y cyfnod rhwng diweddariadau"
          }
        },
        frequency_unit: {
          options: {
            select: "Nodwch",
            day: "diwrnod",
            week: "wythnos",
            month: "mis",
            year: "blwyddyn"
          },
          error: {
            missing: "Nodwch a yw'r cyfnod rhwng diweddariadau mewn wythnosau, misoedd neu flynyddoedd"
          }
        }
      }
    },
    related: {
      add: {
        heading: "Ychwanegu dolen i adroddiad",
        explain: "Gallai hyn gynnwys adroddiadau ar gyfer:",
        explain_1: "ymchwil ac ystadegau LLYW.CYMRU",
        explain_2: "ansawdd ystadegol",
        explain_3: "gwaith cysylltiedig arall",
        form: {
          link_url: {
            label: "URL y ddolen",
            hint: "Dylai hwn gychwyn gyda naill ai 'https://' neu 'http://'",
            error: {
              missing: "Nodwch URL y ddolen ar gyfer adroddiad cysylltiedig",
              invalid: "Nodwch URL y ddolen yn y fformat cywir"
            }
          },
          link_label: {
            label: "Testun y ddolen i ymddangos ar y dudalen we",
            hint: "Dylid nodi hyn yn yr iaith yr ydych chi'n gweld y gwasanaeth hwn.",
            error: {
              missing: "Nodwch destun y ddolen i ymddangos ar y dudalen we am adroddiad cysylltiedig"
            }
          }
        }
      },
      list: {
        heading: "Dolenni adroddiadau a ychwanegwyd",
        table: {
          link: "Dolen adroddiad",
          action_header: "Gweithredu",
          action_edit: "Newid",
          action_delete: "Gwaredu"
        },
        form: {
          add_another: {
            heading: "A oes angen i chi ychwanegu dolen i adroddiad arall?",
            options: {
              yes: {
                label: "Oes"
              },
              no: {
                label: "Nac oes"
              }
            },
            error: {
              missing: "Dewiswch oes os bydd angen i chi ychwanegu dolen i adroddiad arall"
            }
          }
        }
      }
    },
    providers: {
      add: {
        heading: "Ychwanegu darparwr data",
        explain: `Os nad ydych chi'n gallu dod o hyd i ddarparwr y data yn y rhestr, gallwch <a class="govuk-link" href="{{request_data_provider_url}}">ofyn bod darparwr data yn cael ei ychwanegu</a>.`,
        form: {
          provider: {
            hint: "Dechrau teipio neu ddewis o'r rhestr",
            error: {
              missing: "Dewis darparwr data o'r rhestr darparwyr data"
            }
          }
        }
      },
      add_source: {
        heading: "Ychwanegu ffynhonnell data gan y darparwr data a ddewiswyd",
        selected_provider: "Darparwr data a ddewiswyd",
        form: {
          has_source: {
            options: {
              yes: {
                label: "Dewis ffynhonnell"
              },
              no: {
                label: "Dim ffynhonnell benodol gan y darparwr data"
              }
            },
            error: {
              missing: "Dewiswch a ydych chi'n dymuno dewis ffynhonnell neu nodi nad oes ffynhonnell benodol gan y darparwr data"
            }
          },
          source: {
            note: 'Os nad ydych yn gallu gweld y ffynhonnell yn y rhestr, gallwch <a class="govuk-link" href="{{request_data_source_url}}">ofyn bod darparwr data yn cael ei ychwanegu</a>.',
            hint: "Dechrau teipio neu ddewis o'r rhestr",
            error: {
              missing: "Dewis ffynhonnell o restr y ffynonellau ar gyfer y darparwr data a ddewiswyd"
            }
          }
        }
      },
      list: {
        heading: "Ffynonellau a ychwanegwyd",
        table: {
          provider: "Darparwr",
          source: "Ffynhonnell",
          action_header: "Gweithredu",
          action_edit: "Newid",
          action_delete: "Gwaredu",
          no_source: "Dim ffynhonnell benodol gan y darparwr data"
        },
        form: {
          add_another: {
            heading: "A oes angen i chi ychwanegu ffynhonnell arall?",
            options: {
              yes: {
                label: "Oes"
              },
              no: {
                label: "Nac oes"
              }
            },
            error: {
              missing: "Dewiswch oes os bydd angen i chi ychwanegu ffynhonnell arall"
            }
          }
        }
      }
    },
    designation: {
      heading: "Beth yw dynodiad y set ddata hon?",
      form: {
        designation: {
          options: {
            official: {
              label: "Ystadegau gwladol"
            },
            accredited: {
              label: "Ystadegau swyddogol achrededig"
            },
            in_development: {
              label: "Ystadegau swyddogol sy'n cael eu datblygu"
            },
            management: {
              label: "Gwybodaeth reolaethol"
            },
            none: {
              label: "Dim dynodiad"
            }
          },
          error: {
            missing: "Nodwch ddynodiad y set ddata hon"
          }
        }
      }
    },
    topics: {
      heading: "Pa faterion sy'n berthnasol i'r set ddata hon?",
      form: {
        topics: {
          error: {
            missing: "Nodwch pa faterion sy'n berthnasol i'r set ddata hon"
          }
        }
      }
    },
    schedule: {
      heading: "Pryd ddylid cyhoeddi'r set ddata hon?",
      form: {
        date: {
          label: "Dyddiad",
          hint: "Er enghraifft, 10 05 2024",
          error: {
            invalid: "Rhaid i'r dyddiad y dylid cyhoeddi'r set ddata hon fod yn ddyddiad go iawn",
            past: "Rhaid i'r dyddiad y dylid cyhoeddi'r set ddata hon fod yn y dyfodol"
          }
        },
        day: {
          label: "Diwrnod",
          error: "Rhaid i'r dyddiad y dylid cyhoeddi'r set ddata hon gynnwys diwrnod"
        },
        month: {
          label: "Mis",
          error: "Rhaid i'r dyddiad y dylid cyhoeddi'r set ddata hon gynnwys mis"
        },
        year: {
          label: "Blwyddyn",
          error: "Rhaid i'r dyddiad y dylid cyhoeddi'r set ddata hon gynnwys blwyddyn"
        },
        time: {
          label: "Amser",
          hint: "Y rhagosodiad fydd 09:30 yr amser lleol yn y DU.  Dim ond os bydd angen amser cyhoeddi gwahanol y dylid newid hwn.  Defnyddiwch fformat cloc 24 awr, er enghraifft 15:00.",
          error: {
            invalid: "Rhaid i'r amser y dylid cyhoeddi'r set ddata hon fod yn amser go iawn"
          }
        },
        hour: {
          label: "Awr",
          error: "Rhaid i'r amser y dylid cyhoeddi'r set ddata hon gynnwys awr"
        },
        minute: {
          label: "Munud",
          error: "Rhaid i'r amser y dylid cyhoeddi'r set ddata hon gynnwys munud"
        }
      },
      error: {
        saving: "Nid oedd modd cadw'r dyddiad cyhoeddi, rhowch gynnig arall yn nes ymlaen"
      }
    },
    organisation: {
      heading: "Sefydliad a thîm cyhoeddi",
      form: {
        organisation: {
          label: "Sefydliad",
          placeholder: "Dewis sefydliad",
          error: "Dewiswch sefydliad"
        },
        team: {
          label: "Tîm",
          note: `Os nad ydych yn gallu gweld eich tîm yn y rhestr, neu os bydd enw eich tîm wedi newid, gallwch <a class="govuk-link" href="{{request_team}}">ofyn bod tîm yn cael ei ychwanegu neu'n cael ei newid</a>.`,
          placeholder: "Dewis tîm",
          error: "Dewiswch dîm"
        }
      },
      error: {
        saving: "Nid oedd modd cadw'r tîm, rhowch gynnig arall yn nes ymlaen"
      }
    },
    upload: {
      title: "Lanlwytho'r tabl data",
      lookup_heading: "Lanlwytho tabl am-edrych",
      measure_heading: "Lanlwytho tabl mesur",
      form: {
        file: {
          label: "Dylai'r ffeil fod mewn fformat CSV, JSON neu Parquet"
        }
      },
      buttons: {
        upload: "Parhau"
      },
      errors: {
        missing: "Dewis tabl data",
        api: "Nid oedd modd lanlwytho'r ffeil a ddewiswyd - rhowch gynnig arall ar hyn"
      }
    },
    preview: {
      heading: "Gwirio'r tabl data",
      heading_summary: "Crynodeb o'r tabl data",
      upload_has: "Mae eich lanlwythiad yn cynnwys:",
      columns: "{{count}} colofn",
      columns_other: "{{count}} colofn",
      rows: "{{count}} rhes",
      rows_other: "{{count}} rhes",
      row_number: "Rhes",
      preview_summary: 'Mae eich lanlwythiad yn cynnwys $t(publish.preview.columns, {"count": {{cols}} }) a $t(publish.preview.rows, {"count": {{rows}} }).',
      columns_rows: '$t(publish.preview.columns, {"count": {{cols}} }) a $t(publish.preview.rows, {"count": {{rows}} })',
      upload_summary: `Mae'r tabl data yn cynnwys $t(publish.preview.columns, {"count": {{cols}} }) a $t(publish.preview.rows, {"count": {{rows}} }).  Mae $t(publish.preview.columns, {"count": {{ignored}} }) yn y lanlwythiad CSV wedi cael eu hanwybyddu.`,
      showing_rows: "Yn dangos rhesi {{start}} – {{end}} o {{total}}",
      unnamed_column: "colofn {{colNum}}",
      confirm_correct: "Trwy barhau, rydych chi'n cadarnhau bod y tabl data yn gywir.",
      source_type: {
        data_values: "Gwerthoedd data",
        note_codes: "Codau nodiadau",
        measure: "Mesur neu fathau o ddata",
        dimension: "Dimensiwn",
        time: "Dimensiwn sy'n cynnwys dyddiadau",
        ignore: "Gellir anwybyddu'r golofn hon",
        unknown: "Anhysbys"
      }
    },
    sources: {
      heading: "Beth mae pob colofn yn y tabl data yn ei gynnwys?",
      types: {
        data_values: "Gwerthoedd data",
        note_codes: "Codau nodiadau",
        measure: "Mesur neu fathau o ddata",
        dimension: "Dimensiwn",
        time: "Dimensiwn sy'n cynnwys dyddiadau",
        ignore: "Anwybyddwyd",
        unknown: "Dewis"
      }
    },
    tasklist: {
      no_title: "Dim Teitl ar Gael",
      preview: "Rhagolwg (yn agor mewn tab newydd)",
      status: {
        cannot_start: "Ni ellir cychwyn eto",
        available: "Ar gael",
        completed: "Wedi'i gwblhau",
        not_started: "Heb gychwyn eto",
        incomplete: "Anghyflawn",
        not_implemented: "Heb ei Weithredu"
      },
      data: {
        subheading: "Data",
        datatable: "Tabl data"
      },
      metadata: {
        subheading: "Metadata",
        title: "Teitl",
        summary: "Crynodeb",
        data_collection: "Casglu data",
        statistical_quality: "Ansawdd ystadegol",
        data_sources: "Ffynonellau data",
        related_reports: "Adroddiadau cysylltiedig",
        update_frequency: "Pa mor aml y caiff y set ddata hon ei diweddaru",
        designation: "Dynodiad",
        relevant_topics: "Materion perthnasol"
      },
      translation: {
        subheading: "Cyfieithiad",
        export: "Allgludo meysydd testun i'w cyfieithu",
        import: "Mewngludo cyfieithiadau"
      },
      publishing: {
        subheading: "Cyhoeddi",
        organisation: "Sefydliad sy'n cyhoeddi a manylion cyswllt",
        when: "Pryd ddylid cyhoeddi'r set ddata hon",
        submit: "Cyflwyno i'w chymeradwyo"
      },
      submit: {
        subheading: "Trwy barhau, rydych chi'n cadarnhau bod yr holl ddata a'r metadata wedi cael ei wirio a'i fod yn gywir.",
        button: "Cyflwyno i'w chyhoeddi"
      }
    },
    change_data: {
      title: "Beth mae angen i chi ei wneud?",
      note: "Dylai'r ffeil fod mewn fformat CSV",
      change_table: {
        label: "Lanlwytho tabl data gwahanol",
        description: "Bydd hyn yn gwaredu data cyfeirio o bob dimensiwn"
      },
      change_columns: {
        label: "Newid y cynnwys ym mhob colofn yn y tabl data",
        description: "Bydd hyn yn gwaredu data cyfeirio ar gyfer unrhyw golofnau sy'n cynnwys dimensiynau y byddwch yn eu newid"
      }
    },
    point_in_time: {
      heading: "Pa fformat dyddiad a ddefnyddir?",
      example: "Er enghraifft: {{example}}"
    },
    overview: {
      scheduled: {
        notification: {
          header: "Llwyddiant",
          content: "Cyflwynwyd y set ddata yn llwyddiannus i'w chyhoeddi"
        },
        publish_at: "Cyhoeddi wedi'i amserlennu: <strong>{{publish_at}}</strong>",
        what_next: "Beth ydych yn dymuno ei wneud?",
        buttons: {
          view_published_dataset: "Gweld y set ddata a gyhoeddwyd (bydd yn agor mewn tab newydd)",
          update_dataset: "Diweddaru'r set ddata hon",
          withdraw_first_revision: "Newid y set ddata cyn ei chyhoeddi",
          withdraw_update_revision: "Newid y diweddariad cyn ei gyhoeddi",
          continue_update: "Parhau gyda'r diweddariad",
          continue: "Parhau gyda'r set ddata"
        }
      },
      error: {
        withdraw: "Nid oedd modd atal y set ddata rhag cael ei chyhoeddi, cysylltwch â chymorth"
      }
    },
    update_type: {
      heading: "Beth mae angen i chi ei wneud?",
      add: "Ychwanegu data newydd yn unig",
      add_revise: "Ychwanegu data newydd a diwygio'r data presennol",
      revise: "Diwygio'r data presennol yn unig",
      replace_all: "Disodli'r holl ddata presennol",
      errors: {
        missing: "Bydd angen i chi ddewis y math o ddiweddariad yr hoffech ei wneud"
      }
    }
  },
  translations: {
    export: {
      heading: "Allgludo meysydd testun i'w cyfieithu",
      table: {
        field: "Maes testun",
        value: "Testun",
        action: "Newid dolen"
      },
      field: {
        title: "Teitl",
        description: "Crynodeb",
        collection: "Casglu data",
        quality: "Ansawdd ystadegol",
        roundingDescription: "Wedi'i dalgrynnu"
      },
      dimension: "{{value}} enw dimensiwn",
      buttons: {
        export: "Allgludo CSV",
        change: "Newid"
      }
    },
    import: {
      heading: "Mewngludo ffeil cyfieithiad",
      heading_preview: "Gwirio'r testun wedi'i gyfieithu",
      note: "Dim ond os yw wedi cael ei llenwi'n llawn y gallwch chi fewngludo ffeil y cyfieithiad.",
      form: {
        file: {
          label: "Rhaid i'r ffeil fod mewn fformat CSV",
          error: {
            missing: "Dewiswch y ffeil cyfieithiad wedi'i llenwi i'w lanlwytho",
            values: "Rhaid i'r ffeil cyfieithiad fod wedi'i llenwi ar gyfer y ddwy iaith"
          }
        }
      },
      buttons: {
        import: "Mewngludo CSV",
        confirm: "Parhau"
      },
      table: {
        field: "Maes testun",
        english: "Testun (Saesneg)",
        welsh: "Testun (Cymraeg)"
      }
    }
  },
  developer: {
    heading: "Offerynnau Datblygwr",
    list: {
      heading: "Rhestru Setiau Data",
      details: "Manylion",
      tasklist: "Rhestr Tasgau",
      error: {
        no_datasets: "Nid oes unrhyw setiau data wedi'u rhestru yn y gronfa ddata ar hyn o bryd.  Os oes angen help arnoch, holwch aelod o'r tîm datblygu."
      }
    },
    display: {
      heading: "Dangos Set Ddata",
      title: "Teitl",
      description: "Disgrifiad",
      notes: "Nodiadau",
      contents: "Cynnwys",
      summary: "Crynodeb",
      dimension: "Dimensiwn",
      start_revision: "Cychwyn Cod Adnabod Diwygio",
      index: "Mynegai",
      type: "Math",
      created_at: "Dyddiad Creu",
      created_by: "Crëwyd Gan",
      revision: "Diwygio",
      import: "Ffeil a Fewngludwyd",
      imports: "Ffeiliau a Fewngludwyd",
      download: "Lawrlwytho",
      download_file: "Lawrlwytho Ffeil",
      location: "Lleoliad",
      filename: "Enw ffeil",
      mime_type: "Math Mime",
      fact_tables: "Tablau Ffeithiau",
      error: {
        no_dimensions: "Nid yw'r set ddata hon wedi cael ei chwblhau gyda dimensiynau",
        no_revisions: "Nid yw'r set ddata hon wedi cael ei chwblhau gyda diwygiadau",
        no_description: "Nid oes disgrifiad ar gael"
      }
    }
  },
  errors: {
    confirm: {
      missing: "Mae angen i chi gadarnhau neu wrthod y ffeil a lanlwythwyd gan ddefnyddio'r botymau ar ddiwedd y rhagolwg"
    },
    session: {
      current_dataset_missing: "Mae'r set ddata gyfredol ar goll o'r sesiwn",
      current_revision_missing: "Mae'r diwygiad cyfredol ar goll o'r sesiwn",
      current_import_missing: "Mae'r mewngludiad cyfredol ar goll o'r sesiwn",
      no_sources_on_import: "Nid yw'r mewngludiad cyfredol yn cynnwys unrhyw ffynonellau, a oedd y CSV yn wag?"
    },
    sources: {
      unknowns_found: "Mae angen i chi ddweud wrthym beth mae pob colofn yn ei gynnwys",
      multiple_datavalues: "Dim ond un golofn y gallwch ei nodi fel un sy'n cynnwys gwerthoedd data",
      multiple_footnotes: "Dim ond un golofn y gallwch ei nodi fel un sy'n cynnwys nodiadau",
      dimension_creation_failed: "Aeth rhywbeth o'i le wrth geisio creu'r dimensiynau.  Rhowch gynnig arall arno."
    },
    preview: {
      failed_to_get_preview: "Nid oeddem yn gallu creu rhagolwg o'r CSV a lanlwythwyd.  A yw hwn yn CSV dilys?",
      remove_error: "Nid oeddem yn gallu gwaredu eich ffeil a lanlwythwyd o'r gweinydd.  Aeth rhywbeth o'i le.  Rhowch gynnig arall arno",
      confirm_error: "Mae angen i chi gadarnhau neu wrthod y ffeil a lanlwythwyd gan ddefnyddio'r botymau ar ddiwedd y rhagolwg",
      revision_missing: "Mae diwygiad ar goll o'r set ddata hon",
      import_missing: "Mae mewngludiad ar goll o'r set ddata hon",
      invalid_download_format: "Nodwch fformat ffeil dilys (csv, excel, parquet, duckdb)"
    },
    datalake_error: "Ni ellir cysylltu â'r Llyn data",
    blob_storage_errror: "Ni ellir cysylltu â Gwasanaeth Storio Blob",
    problem: "Mae problem wedi codi",
    try_later: "Rhowch gynnig arall yn nes ymlaen",
    name_missing: "Mae Enw'r Set Ddata ar Goll",
    dataset_missing: "Ni chanfuwyd set ddata gyda'r cod adnabod hwn",
    dimension: {
      name_to_short: "Mae enw'r Dimensiwn yn rhy fyr neu ar goll",
      name_to_long: "Mae enw Dimensiwn wedi'i gyfyngu i 1024 nod",
      naming_failed: "Aeth rhywbeth o'i le wrth geisio gosod yr enw.  Rhowch gynnig arall ar hyn"
    },
    upload: {
      no_csv: "Ni ddarparwyd data CSV",
      no_csv_data: "Nid oes data CSV ar gael"
    },
    not_found: "Nid yw'r dudalen ar gael",
    server_error: "Mae camgymeriad anhysbys wedi codi, rhowch gynnig arall yn nes ymlaen",
    forbidden: "Nid ydych chi wedi sicrhau caniatâd i droi at y dudalen hon",
    dimension_reset: "Aeth rhywbeth o'i le wrth geisio ailosod y dimensiwn"
  },
  routes: {
    healthcheck: "gwiriad iechyd",
    feedback: "adborth",
    dataset: "set ddata",
    publish: "cyhoeddi",
    start: "cychwyn",
    title: "teitl",
    preview: "rhagolwg",
    upload: "lanlwytho",
    confirm: "cadarnhau",
    sources: "ffynonellau",
    source_confirmation: "cadarnhad-ffynhonnell",
    tasklist: "rhestr tasgau"
  },
  consumer: {
    global: {
      home_label: "Hafan",
      heading: "StatsCymru",
      phase_banner: {
        beta: "Beta",
        feedback: "Rydych chi'n gweld fersiwn newydd o StatsCymru"
      }
    },
    list: {
      heading: "Chwilio am ystadegau a data gan Lywodraeth Cymru",
      total_datasets: "setiau data"
    }
  }
});
const config$4 = appConfig();
config$4.language.supportedLocales;
const ignoreRoutes = ["/public", "/css", "/assets", "/healthcheck", "/api", "/server"];
const localeCookie = createCookie("lang", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true
});
const [i18nextMiddleware, getLocale, getInstance] = unstable_createI18nextMiddleware({
  detection: {
    supportedLanguages: config$4.language.supportedLocales,
    fallbackLanguage: config$4.language.fallback,
    order: ["searchParams", "custom", "cookie", "header"],
    searchParamKey: "lang",
    cookie: localeCookie,
    async findLocale(request) {
      const ignoreUrls = new RegExp(`^(${ignoreRoutes.join("|")})`);
      if (ignoreUrls.test(request.url)) {
        return null;
      }
      let locale = new URL(request.url).pathname.split("/").at(1);
      return locale ?? null;
    }
  },
  i18next: {
    preload: config$4.language.availableTranslations,
    resources: { en: { translation: enTranslation }, cy: { translation: cyTranslation } }
    // Other i18next options are available here
  },
  plugins: [initReactI18next]
});
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, entryContext, routerContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || entryContext.isSpaMode ? "onAllReady" : "onShellReady";
    let { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(I18nextProvider, { i18n: getInstance(routerContext), children: /* @__PURE__ */ jsx(ServerRouter, { context: entryContext, url: request.url }) }),
      {
        [readyOption]() {
          shellRendered = true;
          let body = new PassThrough();
          let stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const PhaseBanner = () => {
  const { t, i18n } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "govuk-phase-banner", children: /* @__PURE__ */ jsx("div", { className: "govuk-width-container", children: /* @__PURE__ */ jsxs("p", { className: "govuk-phase-banner__content", children: [
    /* @__PURE__ */ jsx("strong", { className: "govuk-tag govuk-phase-banner__content__tag", children: t("consumer.global.phase_banner.beta") }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "govuk-phase-banner__text",
        dangerouslySetInnerHTML: {
          __html: t("consumer.global.phase_banner.feedback", {
            feedback_url: `/${i18n.language}/${t("routes.feedback")}`
          })
        }
      }
    )
  ] }) }) });
};
const localeUrl = (path2, locale, query, anchor) => {
  const locales = [Locale.English, Locale.EnglishGb, Locale.Welsh, Locale.WelshGb];
  const pathElements = path2.split("/").filter(Boolean).filter((element) => !locales.includes(element));
  const newPath = isEmpty(pathElements) ? "" : `/${pathElements.join("/")}`;
  const queryString = !(query == null ? void 0 : query.size) ? "" : `?${query}`;
  const anchorString = isEmpty(anchor) ? "" : `#${anchor}`;
  return `/${locale}${newPath}${queryString}${anchorString}`;
};
const LocaleLink = ({ children, path: path2, query, anchor, ...props }) => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsx(
    Link,
    {
      to: localeUrl(
        path2 || pathname,
        i18n.language,
        query ? createSearchParams(query) : void 0,
        anchor
      ),
      ...props,
      children
    }
  );
};
function T({ children, fallback, className, raw, ...props }) {
  const { t } = useTranslation();
  const key = Array.isArray(children) ? children.join("") : children;
  const content = t(key, props);
  if (fallback && content === key) {
    return /* @__PURE__ */ jsx("span", { className, children: fallback });
  }
  if (raw) {
    return /* @__PURE__ */ jsx("span", { className, dangerouslySetInnerHTML: { __html: content } });
  }
  return /* @__PURE__ */ jsx("span", { className, children: content });
}
const Header = () => {
  const { i18n } = useTranslation();
  return /* @__PURE__ */ jsx("header", { id: "wg-header", className: "wg-header", style: { backgroundColor: "#323232" }, children: /* @__PURE__ */ jsx("div", { className: "layout-container", children: /* @__PURE__ */ jsx("div", { className: "header", id: "header", children: /* @__PURE__ */ jsxs("div", { className: "header__components container-fluid", children: [
    /* @__PURE__ */ jsx("div", { id: "block-govwales-branding", children: /* @__PURE__ */ jsx(
      LocaleLink,
      {
        path: "/published",
        title: "Welsh Government",
        className: "header__logo",
        id: "logo",
        children: /* @__PURE__ */ jsx(T, { className: "visually-hidden", children: "consumer.global.home_label" })
      }
    ) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "language-switcher-language-url",
        id: "block-govwales-languageswitcher",
        role: "navigation",
        "aria-label": "Language",
        children: /* @__PURE__ */ jsx("ul", { className: "links", children: [Locale.English, Locale.EnglishGb].includes(i18n.language) ? /* @__PURE__ */ jsx("li", { className: "cy", children: /* @__PURE__ */ jsx(
          LocaleLink,
          {
            className: "language-link",
            lang: "cy",
            hrefLang: "cy",
            query: { lang: Locale.WelshGb },
            role: "button",
            children: "Cymraeg"
          }
        ) }) : /* @__PURE__ */ jsx("li", { className: "en", children: /* @__PURE__ */ jsx(
          LocaleLink,
          {
            className: "language-link",
            lang: "en",
            hrefLang: "en",
            query: { lang: Locale.EnglishGb },
            role: "button",
            children: "English"
          }
        ) }) })
      }
    )
  ] }) }) }) });
};
const config$3 = appConfig();
let session;
if (config$3.session.store === SessionStore.Redis) {
  logger$2.debug("Initializing Redis session store...");
  const redisClient = createClient({
    url: config$3.session.redisUrl,
    password: config$3.session.redisPassword,
    disableOfflineQueue: true,
    pingInterval: 1e3,
    socket: {
      reconnectStrategy: 1e3,
      connectTimeout: 7500,
      family: 4
    }
  });
  logger$2.debug(`Connecting to redis server: ${config$3.session.redisUrl}`);
  redisClient.on("connect", () => logger$2.info("Redis session store initialized"));
  redisClient.on(
    "error",
    (err) => logger$2.error(`An error occurred with Redis with the following error: ${err}`)
  );
  redisClient.connect();
  session = createRedisSessionStorage({
    cookie: {
      path: "/",
      name: "statswales.frontend",
      secure: config$3.session.secure,
      maxAge: config$3.session.maxAge,
      secrets: [config$3.session.secret]
    },
    options: {
      redisClient
    }
  });
} else {
  logger$2.info("In-memory session store initialized");
  session = createMemorySessionStorage({
    cookie: {
      path: "/",
      name: "statswales.frontend",
      secure: config$3.session.secure,
      maxAge: config$3.session.maxAge,
      secrets: [config$3.session.secret]
    }
  });
}
const { getSession, commitSession, destroySession } = session;
const sessionContext = unstable_createContext();
const sessionMiddleware = async ({
  context,
  request
}) => {
  let session2 = await getSession(request.headers.get("Cookie"));
  context.set(sessionContext, session2);
};
const languageSwitcher = ({ request, context }, next) => {
  let locale = getLocale(context);
  const ignoreUrls = new RegExp(`^(${ignoreRoutes.join("|")})`);
  const url = new URL(request.url);
  const query = url.searchParams;
  if (ignoreUrls.test(url.pathname)) {
    return next();
  }
  query.delete("lang");
  if ([Locale.English, Locale.EnglishGb].includes(locale) && !/^\/en-GB/.test(url.pathname)) {
    const newUrl = localeUrl(url.pathname, Locale.EnglishGb, query);
    logger$2.debug(
      `Language detected as '${locale}' but not present in path, redirecting to ${newUrl}`
    );
    throw redirect(newUrl);
  }
  if ([Locale.Welsh, Locale.WelshGb].includes(locale) && !/^\/cy-GB/.test(url.pathname)) {
    const newUrl = localeUrl(url.pathname, Locale.WelshGb, query);
    logger$2.debug(
      `Language detected as '${locale}' but not present in path, redirecting to ${newUrl}`
    );
    throw redirect(newUrl);
  }
};
var GlobalRole = /* @__PURE__ */ ((GlobalRole2) => {
  GlobalRole2["ServiceAdmin"] = "service_admin";
  GlobalRole2["Developer"] = "developer";
  return GlobalRole2;
})(GlobalRole || {});
const initialContext = {
  isAdmin: false,
  isDeveloper: false,
  isAuthenticated: false
};
const authContext = unstable_createContext(initialContext);
const authMiddleware = ({ context, request }) => {
  var _a, _b;
  const config2 = context.get(appConfigContext);
  const cookiesHeader = request.headers.get("Cookie");
  try {
    if (!cookiesHeader) {
      throw new Error("Cookie header not set");
    }
    const { jwt: token } = parse(cookiesHeader);
    if (!token) {
      throw new Error("JWT cookie not found");
    }
    const secret = config2.auth.jwt.secret;
    let decoded = null;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      throw new Error("Error decoding JWT");
    }
    if (!decoded) {
      throw new Error("Unable to verify JWT token");
    }
    if (decoded.exp && decoded.exp <= Date.now() / 1e3) {
      throw new Error("JWT token has expired");
    }
    const auth = {
      jwt: token,
      expires: decoded.exp,
      user: decoded.user,
      isAdmin: !!((_a = decoded.user) == null ? void 0 : _a.global_roles.includes(GlobalRole.ServiceAdmin)),
      isDeveloper: !!((_b = decoded.user) == null ? void 0 : _b.global_roles.includes(GlobalRole.Developer)),
      isAuthenticated: true
    };
    context.set(authContext, auth);
  } catch (err) {
    logger$2.info(err.message);
    context.set(authContext, initialContext);
  }
};
const unstable_middleware$8 = [authMiddleware, sessionMiddleware, i18nextMiddleware, languageSwitcher];
async function loader$k({
  context
}) {
  let locale = getLocale(context);
  return data({
    locale
  }, {
    headers: {
      "Set-Cookie": await localeCookie.serialize(locale)
    }
  });
}
function Layout({
  children
}) {
  let {
    i18n
  } = useTranslation();
  return /* @__PURE__ */ jsxs("html", {
    lang: i18n.language,
    dir: i18n.dir(i18n.language),
    className: "govuk-template wg",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover"
      }), /* @__PURE__ */ jsx("meta", {
        name: "theme-color",
        content: "#0b0c0c"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        sizes: "48x48",
        href: "/assets/images/favicon.ico"
      }), /* @__PURE__ */ jsx("link", {
        rel: "mask-icon",
        href: "/assets/images/govuk-icon-mask.svg",
        color: "#0b0c0c"
      }), /* @__PURE__ */ jsx("link", {
        rel: "apple-touch-icon",
        href: "/assets/images/govuk-icon-180.png"
      }), /* @__PURE__ */ jsx("link", {
        rel: "manifest",
        href: "/assets/manifest.json"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "govuk-template__body app-body-className",
      "data-test": "My value",
      "data-other": "report:details",
      suppressHydrationWarning: true,
      children: [/* @__PURE__ */ jsx("a", {
        id: "top"
      }), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `
              document.body.classList.add('js-enabled');
              if ('noModule' in HTMLScriptElement.prototype) {
                  document.body.classList.add('govuk-frontend-supported');
              }`
        }
      }), /* @__PURE__ */ jsx("a", {
        href: "#main-content",
        className: "govuk-skip-link",
        "data-module": "govuk-skip-link",
        children: "Skip to main content"
      }), /* @__PURE__ */ jsx(PhaseBanner, {}), /* @__PURE__ */ jsx(Header, {}), children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {}), /* @__PURE__ */ jsx("script", {
        type: "module",
        dangerouslySetInnerHTML: {
          __html: `
              import { initAll } from '/assets/js/govuk-frontend.min.js'
              initAll();
              `
        }
      }), /* @__PURE__ */ jsx("script", {
        type: "module",
        src: "/assets/js/govuk-frontend.min.js"
      }), /* @__PURE__ */ jsx("script", {
        src: "https://kit.fontawesome.com/f6f4af2d4c.js",
        crossOrigin: "anonymous"
      })]
    })]
  });
}
const root = withComponentProps(function App({
  loaderData
}) {
  useChangeLanguage(loaderData.locale);
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary$1 = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), "asdasdad", stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: ErrorBoundary$1,
  Layout,
  default: root,
  loader: loader$k,
  unstable_middleware: unstable_middleware$8
}, Symbol.toStringTag, { value: "Module" }));
const NavLink = ({ children, to, ...props }) => {
  const { i18n } = useTranslation();
  return /* @__PURE__ */ jsx(NavLink$1, { to: localeUrl(to, i18n.language), ...props, children });
};
const PublisherNav = ({
  isAuthenticated,
  isAdmin,
  isDeveloper
}) => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("nav", { className: "primary js-primary-nav", "aria-label": "Primary Navigation", children: [
    /* @__PURE__ */ jsxs("div", { className: "govuk-width-container nav__toggle", children: [
      /* @__PURE__ */ jsx(LocaleLink, { path: "/", children: /* @__PURE__ */ jsx("div", { className: "statsWales-logo", role: "img", "aria-label": t("header.logo") }) }),
      isAuthenticated && /* @__PURE__ */ jsx(
        LocaleLink,
        {
          path: "/auth/logout",
          className: "button button--secondary ignore-external helper-menu__sign-out",
          children: t("header.navigation.logout")
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "nav__content", children: /* @__PURE__ */ jsx("div", { className: "govuk-width-container", children: /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/", end: true, children: t("header.navigation.home") }) }),
      isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/admin/group", children: /* @__PURE__ */ jsx(T, { children: "header.navigation.groups" }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/admin/user", children: /* @__PURE__ */ jsx(T, { children: "header.navigation.users" }) }) })
      ] }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/guidance", children: /* @__PURE__ */ jsx(T, { children: "header.navigation.guidance" }) }) }),
      isDeveloper && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/developer", children: /* @__PURE__ */ jsx(T, { children: "header.navigation.developer" }) }) })
    ] }) }) })
  ] });
};
const links = () => [
  {
    rel: "icon",
    type: "image/ico",
    href: "/assets/images/favicon.ico"
  },
  {
    rel: "shortcut icon",
    href: "/assets/images/favicon.ico",
    type: "image/x-icon"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "180x180",
    href: "/assets/images/apple-touch-icon-180x180-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "152x152",
    href: "/assets/images/apple-touch-icon-152x152-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "144x144",
    href: "/assets/images/apple-touch-icon-144x144-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "120x120",
    href: "/assets/images/apple-touch-icon-120x120-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "114x114",
    href: "/assets/images/apple-touch-icon-114x114-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "76x76",
    href: "/assets/images/apple-touch-icon-76x76-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "72x72",
    href: "/assets/images/apple-touch-icon-72x72-precomposed.png"
  },
  {
    rel: "apple-touch-icon-precomposed",
    href: "/assets/images/apple-touch-icon-precomposed.png"
  },
  {
    rel: "icon",
    sizes: "192x192",
    href: "/assets/images/touch-icon-192.png"
  },
  {
    rel: "icon",
    sizes: "32x32",
    href: "/assets/images/favicon-32.png"
  },
  {
    rel: "icon",
    sizes: "48x48",
    href: "/assets/images/favicon-48.png"
  },
  {
    rel: "manifest",
    href: "/assets/manifest.json"
  }
  // FIXME: {isDeveloper && (
  //   <>
  //     <link rel="stylesheet" href="/css/highlight.css" />
  //     <link
  //       rel="stylesheet"
  //       href="https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css"
  //     />
  //   </>
  // )}
];
const meta = () => {
  return [
    {
      name: "msapplication-TileColor",
      content: "#b60404"
    },
    {
      name: "msapplication-TileImage",
      content: "/assets/images/ms-icon-144x144.png"
    },
    {
      property: "og:image",
      content: "/images/govuk-opengraph-image.png"
    },
    {
      name: "theme-color",
      content: "#323232"
    },
    {
      name: "theme-color",
      content: "#323232",
      media: "(prefers-color-scheme: light)"
    },
    {
      name: "theme-color",
      content: "#323232",
      media: "(prefers-color-scheme: dark)"
    },
    {
      name: "msapplication-navbutton-color",
      content: "#323232"
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes"
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "#323232"
    }
    // { title: <T>app_title')} <T>beta')} {title ? ` - ${title}` : </T>
  ];
};
const loader$j = ({
  context
}) => {
  const auth = context.get(authContext);
  return {
    isAdmin: auth.isAdmin,
    isDeveloper: auth.isDeveloper,
    isAuthenticated: auth.isAuthenticated
  };
};
const publisher = withComponentProps(function PublisherLayout({
  loaderData
}) {
  const {
    t
  } = useTranslation();
  const formPage = false;
  const supportEmail = "";
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(PublisherNav, {
      isAdmin: loaderData.isAdmin,
      isAuthenticated: loaderData.isAuthenticated,
      isDeveloper: loaderData.isDeveloper
    }), /* @__PURE__ */ jsx("main", {
      className: clsx("govuk-main-wrapper", {
        "form-background": formPage
      }),
      id: "main-content",
      role: "main",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-width-container",
        children: /* @__PURE__ */ jsx(Outlet, {})
      })
    }), /* @__PURE__ */ jsxs("footer", {
      className: "wg-footer",
      children: [/* @__PURE__ */ jsx("div", {
        className: "footer-top",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-width-container",
          children: /* @__PURE__ */ jsx("a", {
            href: "#top",
            role: "button",
            className: "govuk-button govuk-button--secondary govuk-button--top",
            children: /* @__PURE__ */ jsx(T, {
              children: "footer.top_of_page"
            })
          })
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "govuk-width-container govuk-!-padding-top-9",
        children: [/* @__PURE__ */ jsxs("ul", {
          className: "footer-menu govuk-list",
          children: [/* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: `mailto:${supportEmail}`,
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.contact_us"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/accessibility-statement-govwales",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.accessibility"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/copyright-statement",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.copyright_statement"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx(LocaleLink, {
              path: "/cookies",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.cookies"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/website-privacy-policy",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.privacy"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/terms-and-conditions",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.terms_conditions"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/welsh-government-modern-slavery-statement",
              children: /* @__PURE__ */ jsx(T, {
                children: "footer.modern_slavery"
              })
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "menu__item",
            children: /* @__PURE__ */ jsx("a", {
              href: "https://www.gov.wales/alternative-languages",
              children: "Alternative languages"
            })
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "wg-footer-logo"
        })]
      })]
    })]
  });
});
const ErrorBoundary = withErrorBoundaryProps(({
  error
}) => {
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs("h1", {
        children: [error.status, " ", error.statusText]
      }), /* @__PURE__ */ jsx("p", {
        children: error.data
      })]
    });
  } else if (error instanceof Error) {
    return /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("h1", {
        children: "Error"
      }), /* @__PURE__ */ jsx("p", {
        children: error.message
      }), /* @__PURE__ */ jsx("p", {
        children: "The stack trace is:"
      }), /* @__PURE__ */ jsx("pre", {
        children: error.stack
      })]
    });
  } else {
    return /* @__PURE__ */ jsx("h1", {
      children: "Unknown Error"
    });
  }
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: publisher,
  links,
  loader: loader$j,
  meta
}, Symbol.toStringTag, { value: "Module" }));
var HttpMethod = /* @__PURE__ */ ((HttpMethod2) => {
  HttpMethod2["Get"] = "GET";
  HttpMethod2["Post"] = "POST";
  HttpMethod2["Put"] = "PUT";
  HttpMethod2["Patch"] = "PATCH";
  HttpMethod2["Delete"] = "DELETE";
  return HttpMethod2;
})(HttpMethod || {});
class ApiException extends Error {
  constructor(message, status, body, tag) {
    super(message);
    this.message = message;
    this.status = status;
    this.body = body;
    this.tag = tag;
    this.name = "ApiException";
    this.status = status;
    this.body = body;
    this.tag = tag;
  }
}
class ViewException extends ApiException {
  constructor(message, status, errors) {
    super(message, status);
    this.message = message;
    this.status = status;
    this.errors = errors;
    this.name = "ViewException";
    this.errors = errors;
  }
}
var FileFormat = /* @__PURE__ */ ((FileFormat2) => {
  FileFormat2["Csv"] = "csv";
  FileFormat2["Parquet"] = "parquet";
  FileFormat2["Xlsx"] = "xlsx";
  FileFormat2["DuckDb"] = "duckdb";
  FileFormat2["Json"] = "json";
  FileFormat2["Odf"] = "odf";
  FileFormat2["Sqlite"] = "sqlite";
  FileFormat2["Zip"] = "zip";
  return FileFormat2;
})(FileFormat || {});
var DatasetInclude = /* @__PURE__ */ ((DatasetInclude2) => {
  DatasetInclude2["All"] = "all";
  DatasetInclude2["Meta"] = "metadata";
  DatasetInclude2["Data"] = "data";
  DatasetInclude2["Measure"] = "measure";
  DatasetInclude2["Dimensions"] = "dimensions";
  DatasetInclude2["Overview"] = "overview";
  return DatasetInclude2;
})(DatasetInclude || {});
var UserStatus = /* @__PURE__ */ ((UserStatus2) => {
  UserStatus2["Active"] = "active";
  UserStatus2["Inactive"] = "inactive";
  return UserStatus2;
})(UserStatus || {});
const config$2 = appConfig();
const logger$1 = logger$2.child({ service: "publisher-api" });
const logRequestTime = (method, url, start2) => {
  const end = performance.now();
  const time = Math.round(end - start2);
  const SLOW_RESPONSE_MS = 500;
  if (time > SLOW_RESPONSE_MS) {
    logger$1.warn(`SLOW: ${method} /${url} (${time}ms)`);
  } else {
    logger$1.debug(`${method} /${url} (${time}ms)`);
  }
};
class PublisherApi {
  constructor(lang = Locale.English, token) {
    __publicField(this, "backendUrl", config$2.backend.url);
    this.lang = lang;
    this.token = token;
    this.lang = lang;
    this.token = token;
  }
  async fetch({
    url,
    method = HttpMethod.Get,
    body,
    json,
    headers
  }) {
    const head = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Accept-Language": this.lang,
      ...this.token ? { Authorization: `Bearer ${this.token}` } : {},
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...json ? { "Content-Type": "application/json; charset=UTF-8" } : {},
      ...headers
    };
    const data2 = json ? JSON.stringify(json) : body;
    const start2 = performance.now();
    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data2 }).then((response) => {
      logRequestTime(method, url, start2);
      return response;
    }).then(async (response) => {
      if (!response.ok) {
        const body2 = await new Response(response.body).text();
        if (body2) {
          throw new ApiException(response.statusText, response.status, body2);
        }
        throw new ApiException(response.statusText, response.status);
      }
      return response;
    }).catch((error) => {
      logger$1.error(
        `An api error occurred with status '${error.status}' and message '${error.message}'`
      );
      throw new ApiException(error.message, error.status, error.body);
    });
  }
  async ping() {
    logger$1.debug(`Pinging backend...`);
    return this.fetch({ url: "healthcheck" }).then(() => {
      logger$1.debug("API responded to ping");
      return true;
    });
  }
  async getEnabledAuthProviders() {
    return this.fetch({ url: "auth/providers" }).then((response) => response.json()).then((body) => body.enabled);
  }
  async createDataset(title2, userGroupId, language) {
    logger$1.debug(`Creating new dataset...`);
    const json = { title: title2, user_group_id: userGroupId, language };
    return this.fetch({ url: "dataset", method: HttpMethod.Post, json }).then(
      (response) => response.json()
    );
  }
  async moveDatasetGroup(datasetId, userGroupId) {
    logger$1.debug(`Moving dataset ${datasetId} to user group ${userGroupId}...`);
    const json = { user_group_id: userGroupId };
    return this.fetch({ url: `dataset/${datasetId}/group`, method: HttpMethod.Patch, json }).then(
      (response) => response.json()
    );
  }
  async getDataset(datasetId, include) {
    const qs = include ? `${new URLSearchParams({ hydrate: include }).toString()}` : void 0;
    const url = `dataset/${datasetId}${qs ? `?${qs}` : ""}`;
    return this.fetch({ url }).then((response) => response.json());
  }
  uploadDataToDataset(datasetId, file, filename) {
    logger$1.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set("csv", file, filename);
    return this.fetch({ url: `dataset/${datasetId}/data`, method: HttpMethod.Post, body }).then(
      (response) => response.json()
    );
  }
  uploadCSVToUpdateDataset(datasetId, revisionId, file, filename, updateType) {
    logger$1.debug(`Uploading file ${filename} to revision: ${revisionId}`);
    const body = new FormData();
    body.set("csv", file, filename);
    body.set("update_action", updateType);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json());
  }
  uploadLookupTable(datasetId, dimensionId, file, filename) {
    logger$1.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set("csv", file, filename);
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/lookup`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json());
  }
  uploadMeasureLookup(datasetId, file, filename) {
    logger$1.debug(`Uploading file ${filename} to dataset: ${datasetId}`);
    const body = new FormData();
    body.set("csv", file, filename);
    return this.fetch({
      url: `dataset/${datasetId}/measure`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json());
  }
  async getDatasetView(datasetId, pageNumber, pageSize) {
    logger$1.debug(
      `Fetching view for dataset: ${datasetId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );
    return this.fetch({
      url: `dataset/${datasetId}/view?page_number=${pageNumber}&page_size=${pageSize}`
    }).then((response) => response.json());
  }
  async getUserDatasetList(page = 1, limit = 20) {
    logger$1.debug(`Fetching user dataset list...`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    return this.fetch({ url: `dataset?${qs}` }).then(
      (response) => response.json()
    );
  }
  // should only be used for developer view
  async getFullDatasetList(page = 1, limit = 20) {
    logger$1.debug(`Fetching full dataset list...`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    return this.fetch({ url: `developer/dataset?${qs}` }).then(
      (response) => response.json()
    );
  }
  async getDatasetFileList(datasetId) {
    logger$1.debug(`Fetching file list for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/list-files` }).then(
      (response) => response.json()
    );
  }
  async getOriginalUpload(datasetId, revisionId) {
    logger$1.debug(`Fetching raw file import for revision: ${revisionId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/raw`
    }).then((response) => response.body);
  }
  async getOriginalUploadMeasure(datasetId) {
    logger$1.debug(`Fetching raw file import for measure on dataset: ${datasetId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/measure/lookup/raw`
    }).then((response) => response.body);
  }
  async getOriginalUploadDimension(datasetId, dimensionId) {
    logger$1.debug(`Fetching raw file import for dimension: ${dimensionId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/lookup/raw`
    }).then((response) => response.body);
  }
  async getAllDatasetFiles(datasetId) {
    logger$1.debug(`Fetching zip file of assets for dataset ${datasetId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/download`
    }).then((response) => response.body);
  }
  async getCubeFileStream(datasetId, revisionId, format2) {
    logger$1.debug(`Fetching ${format2} stream for revision: ${revisionId}...`);
    const url = format2 === FileFormat.DuckDb ? `dataset/${datasetId}/revision/by-id/${revisionId}/cube` : `dataset/${datasetId}/revision/by-id/${revisionId}/cube/${format2}`;
    return this.fetch({ url }).then((response) => response.body);
  }
  async confirmDataTable(datasetId, revisionId) {
    logger$1.debug(`Confirming data table import for revision: ${revisionId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/confirm`,
      method: HttpMethod.Patch
    }).then((response) => response.json());
  }
  async getSourcesForDataset(datasetId) {
    logger$1.debug(`Fetching sources for dataset: ${datasetId}...`);
    return this.fetch({
      url: `dataset/${datasetId}/sources`
    }).then((response) => response.json());
  }
  async resetDimension(datasetId, dimensionId) {
    logger$1.debug(`Resetting dimension: ${dimensionId}`);
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/reset`,
      method: HttpMethod.Delete
    }).then((response) => response.json());
  }
  async resetMeasure(datasetId) {
    logger$1.debug(`Resetting measure on dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/measure/reset`,
      method: HttpMethod.Delete
    }).then((response) => response.json());
  }
  async getImportPreview(datasetId, revisionId, pageNumber, pageSize) {
    logger$1.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/data-table/preview?page_number=${pageNumber}&page_size=${pageSize}`
    }).then((response) => response.json());
  }
  async getRevision(datasetId, revisionId) {
    logger$1.debug(`Fetching revision: ${revisionId}`);
    return this.fetch({ url: `dataset/${datasetId}/revision/by-id/${revisionId}` }).then(
      (response) => response.json()
    );
  }
  async getRevisionPreview(datasetId, revisionId, pageNumber, pageSize) {
    logger$1.debug(
      `Fetching preview for dataset: ${datasetId}, revision: ${revisionId}, page: ${pageNumber}, pageSize: ${pageSize}`
    );
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/preview?page_number=${pageNumber}&page_size=${pageSize}`
    }).then((response) => response.json());
  }
  async assignSources(datasetId, sourceTypeAssignment) {
    logger$1.debug(`Assigning source types for dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/sources`,
      method: HttpMethod.Patch,
      json: sourceTypeAssignment
    }).then((response) => response.json());
  }
  async patchDimension(datasetId, dimensionId, dimensionPatch) {
    logger$1.debug(`sending patch request for dimension: ${dimensionId}`);
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}`,
      method: HttpMethod.Patch,
      json: dimensionPatch
    }).then((response) => response.json());
  }
  async updateDimensionMetadata(datasetId, dimensionId, metadata) {
    return this.fetch({
      url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json());
  }
  async updateMeasureMetadata(datasetId, metadata) {
    return this.fetch({
      url: `dataset/${datasetId}/measure/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json());
  }
  async updateMetadata(datasetId, metadata) {
    return this.fetch({
      url: `dataset/${datasetId}/metadata`,
      method: HttpMethod.Patch,
      json: metadata
    }).then((response) => response.json());
  }
  async getTaskList(datasetId) {
    logger$1.debug(`Fetching tasklist for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/tasklist` }).then(
      (response) => response.json()
    );
  }
  async getDimensionPreview(datasetId, dimensionId) {
    logger$1.debug(`Fetching dimension preview for dimension: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/preview` }).then(
      (response) => response.json()
    );
  }
  async getMeasurePreview(datasetId) {
    logger$1.debug(`Fetching measure preview for dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}/measure/preview` }).then(
      (response) => response.json()
    );
  }
  async getDimension(datasetId, dimensionId) {
    logger$1.debug(`Fetching dimension: ${dimensionId}`);
    return this.fetch({ url: `dataset/${datasetId}/dimension/by-id/${dimensionId}/` }).then(
      (response) => response.json()
    );
  }
  async uploadCSVtoCreateDataset(file, filename, title2) {
    logger$1.debug(`Uploading CSV to create dataset with title '${title2}'`);
    const body = new FormData();
    body.set("csv", file, filename);
    body.set("title", title2);
    return this.fetch({ url: "dataset", method: HttpMethod.Post, body }).then((response) => response.json()).catch((error) => {
      throw new ViewException(error.message, error.status, [
        {
          field: "csv",
          message: {
            key: "errors.upload.no_csv_data",
            params: {}
          }
        }
      ]);
    });
  }
  async uploadCSVToFixDataset(datasetId, revisionId, file, filename) {
    logger$1.debug(`Uploading CSV to fix dataset: ${datasetId}`);
    const body = new FormData();
    body.set("csv", file, filename);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/fact-table`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json()).catch((error) => {
      throw new ViewException(error.message, error.status, [
        {
          field: "csv",
          message: {
            key: "errors.upload.no_csv_data",
            params: {}
          }
        }
      ]);
    });
  }
  async addDatasetProvider(datasetId, provider) {
    return this.fetch({
      url: `dataset/${datasetId}/providers`,
      method: HttpMethod.Post,
      json: provider
    }).then((response) => response.json());
  }
  async updateAssignedProviders(datasetId, providers) {
    return this.fetch({
      url: `dataset/${datasetId}/providers`,
      method: HttpMethod.Patch,
      json: providers
    }).then((response) => response.json());
  }
  async getAssignedProviders(datasetId) {
    logger$1.debug("Fetching assigned data providers...");
    return this.fetch({ url: `dataset/${datasetId}/providers`, method: HttpMethod.Get }).then(
      (response) => response.json()
    );
  }
  async getAllProviders() {
    logger$1.debug("Fetching all data providers...");
    return this.fetch({ url: "provider" }).then(
      (response) => response.json()
    );
  }
  async getSourcesByProvider(providerId) {
    logger$1.debug("Fetching data provider sources...");
    return this.fetch({ url: `provider/${providerId}/sources` }).then(
      (response) => response.json()
    );
  }
  async getDatasetTopics(datasetId) {
    logger$1.debug("Fetching dataset topics...");
    return this.fetch({ url: `dataset/${datasetId}/topics`, method: HttpMethod.Get }).then(
      (response) => response.json()
    );
  }
  async getAllTopics() {
    logger$1.debug("Fetching all topics...");
    return this.fetch({ url: "topic" }).then(
      (response) => response.json()
    );
  }
  async updateDatasetTopics(datasetId, topics) {
    return this.fetch({
      url: `dataset/${datasetId}/topics`,
      method: HttpMethod.Patch,
      json: { topics }
    }).then((response) => response.json());
  }
  async updatePublishDate(datasetId, revisionId, publishDate) {
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/publish-at`,
      method: HttpMethod.Patch,
      json: { publish_at: publishDate }
    }).then((response) => response.json());
  }
  async getAllOrganisations() {
    logger$1.debug("Fetching organisations...");
    return this.fetch({ url: "organisation" }).then(
      (response) => response.json()
    );
  }
  async getTranslationPreview(datasetId) {
    logger$1.debug("Fetching translation preview...");
    return this.fetch({ url: `translation/${datasetId}/preview` }).then(
      (response) => response.json()
    );
  }
  async getTranslationExport(datasetId) {
    logger$1.debug("Fetching translation export...");
    return this.fetch({ url: `translation/${datasetId}/export` }).then(
      (response) => response.body
    );
  }
  async uploadTranslationImport(datasetId, file) {
    logger$1.debug(`Uploading translations to dataset: ${datasetId}`);
    const body = new FormData();
    body.set("csv", file);
    return this.fetch({
      url: `translation/${datasetId}/import`,
      method: HttpMethod.Post,
      body
    }).then((response) => response.json());
  }
  async updateTranslations(datasetId) {
    logger$1.debug(`Updating translations for dataset: ${datasetId}`);
    return this.fetch({ url: `translation/${datasetId}/import`, method: HttpMethod.Patch }).then(
      (response) => response.json()
    );
  }
  async submitForPublication(datasetId, revisionId) {
    logger$1.debug(`Attempting to submit draft revision for publication`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/submit`,
      method: HttpMethod.Post
    }).then((response) => response.json());
  }
  async deleteDraftDataset(datasetId) {
    logger$1.debug(`Deleting draft dataset: ${datasetId}`);
    return this.fetch({ url: `dataset/${datasetId}`, method: HttpMethod.Delete }).then(() => true);
  }
  async deleteDraftRevision(datasetId, revisionId) {
    logger$1.debug(`Deleting draft dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}`,
      method: HttpMethod.Delete
    }).then(() => true);
  }
  async withdrawFromPublication(datasetId, revisionId) {
    logger$1.debug(`Attempting to withdraw scheduled revision from publication`);
    return this.fetch({
      url: `dataset/${datasetId}/revision/by-id/${revisionId}/withdraw`,
      method: HttpMethod.Post
    }).then((response) => response.json());
  }
  async createRevision(datasetId) {
    logger$1.debug(`Creating new revision for dataset: ${datasetId}`);
    return this.fetch({
      url: `dataset/${datasetId}/revision`,
      method: HttpMethod.Post
    }).then((response) => response.json());
  }
  async listUserGroups(page = 1, limit = 20) {
    logger$1.debug(`Fetching user group list...`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    return this.fetch({ url: `admin/group/list?${qs}` }).then(
      (response) => response.json()
    );
  }
  async getAllUserGroups() {
    logger$1.debug(`Fetching all user groups...`);
    return this.fetch({ url: `admin/group` }).then(
      (response) => response.json()
    );
  }
  async getUserGroup(groupId) {
    logger$1.debug(`Fetching user group...`);
    return this.fetch({ url: `admin/group/${groupId}` }).then(
      (response) => response.json()
    );
  }
  async createUserGroup(meta2) {
    logger$1.debug(`Creating new user group`);
    return this.fetch({ url: `admin/group`, method: HttpMethod.Post, json: meta2 }).then(
      (response) => response.json()
    );
  }
  async updateUserGroup(group2) {
    logger$1.debug(`Updating user group`);
    return this.fetch({
      url: `admin/group/${group2.id}`,
      method: HttpMethod.Patch,
      json: group2
    }).then((response) => response.json());
  }
  async listUsers(page = 1, limit = 20) {
    logger$1.debug(`Fetching user list...`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    return this.fetch({ url: `admin/user?${qs}` }).then(
      (response) => response.json()
    );
  }
  async createUser(userCreate) {
    logger$1.debug(`Creating new user`);
    return this.fetch({ url: `admin/user`, method: HttpMethod.Post, json: userCreate }).then(
      (response) => response.json()
    );
  }
  async getUser(userId) {
    logger$1.debug(`Fetching user...`);
    return this.fetch({ url: `admin/user/${userId}` }).then(
      (response) => response.json()
    );
  }
  async getAvailableUserRoles() {
    logger$1.debug(`Fetching available user roles...`);
    return this.fetch({ url: `admin/role` }).then(
      (response) => response.json()
    );
  }
  async updateUserRoles(userId, selectedRoles) {
    logger$1.debug(`Updating user roles`);
    return this.fetch({
      url: `admin/user/${userId}/role`,
      method: HttpMethod.Patch,
      json: selectedRoles
    }).then((response) => response.json());
  }
  async updateUserStatus(userId, status) {
    logger$1.debug(`Updating user status to ${status}...`);
    const json = { status };
    return this.fetch({ url: `admin/user/${userId}/status`, method: HttpMethod.Patch, json }).then(
      (response) => response.json()
    );
  }
  async getTaskById(taskId) {
    logger$1.debug(`Fetching task by id: ${taskId}`);
    return this.fetch({ url: `task/${taskId}` }).then(
      (response) => response.json()
    );
  }
  async taskDecision(taskId, decisionDTO) {
    logger$1.debug(`Decision made on task ${taskId}: ${decisionDTO.decision}`);
    return this.fetch({ url: `task/${taskId}`, method: HttpMethod.Patch, json: decisionDTO }).then(
      (response) => response.json()
    );
  }
  async getDatasetHistory(datasetId) {
    logger$1.debug(`Fetching history for dataset ${datasetId}...`);
    return this.fetch({ url: `dataset/${datasetId}/history` }).then(
      (response) => response.json()
    );
  }
}
const config$1 = appConfig();
const domain = new URL(config$1.auth.jwt.cookieDomain).hostname;
const jwtCookie = createCookie("jwt", {
  secure: false,
  httpOnly: true,
  domain
});
const deleteCookie = async (cookie) => {
  return cookie.serialize(null, { maxAge: 1 });
};
const getJwtCookie = (request) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }
  return parse(cookieHeader).jwt;
};
const publisherApi = unstable_createContext(new PublisherApi());
const publisherApiMiddleware = async ({
  context,
  request
}) => {
  const locale = getLocale(context);
  const cookie = getJwtCookie(request);
  if (cookie) {
    const api = new PublisherApi(locale, cookie);
    context.set(publisherApi, api);
  }
};
const Context = createContext(null);
const ErrorProvider = ({
  children,
  errors
}) => {
  return /* @__PURE__ */ jsx(Context.Provider, { value: errors ?? null, children });
};
const useErrors = () => {
  const context = useContext(Context);
  if (context === void 0) {
    throw new Error("useErrors be used in an ErrorProvider");
  }
  return context;
};
function ErrorHandler() {
  const errors = useErrors();
  if (!errors || !errors.length) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "govuk-error-summary", "data-module": "govuk-error-summary", children: /* @__PURE__ */ jsxs("div", { role: "alert", children: [
    /* @__PURE__ */ jsx("h2", { className: "govuk-error-summary__title", children: /* @__PURE__ */ jsx(T, { children: "errors.problem" }) }),
    /* @__PURE__ */ jsx("div", { className: "govuk-error-summary__body", children: /* @__PURE__ */ jsx("ul", { className: "govuk-list govuk-error-summary__list", children: errors.map((error) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `#${String(error.field)}`, children: /* @__PURE__ */ jsx(T, { ...error.message.params, children: error.message.key }) }) }, error.message.key)) }) })
  ] }) });
}
const loader$i = async ({
  context,
  request
}) => {
  let providers;
  const api = context.get(publisherApi);
  const config2 = appConfig();
  const error = new URL(request.url).searchParams.get("error");
  let errors = [];
  try {
    providers = await api.getEnabledAuthProviders();
  } catch (err) {
    logger$2.error(err, "Could not fetch auth providers from backend");
    providers = config2.auth.providers;
  }
  if (error) {
    errors = error === "expired" ? ["login.error.expired"] : [error];
    logger$2.error(`Authentication token has expired`);
    errors = ["login.error.expired"];
    return data({
      providers,
      errors
    }, {
      status: 400
    });
  }
  return {
    providers,
    errors
  };
};
const login = withComponentProps(function Auth({
  loaderData
}) {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: /* @__PURE__ */ jsx(T, {
        children: "login.heading"
      })
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsx("div", {
      className: "govuk-button-group",
      children: loaderData.providers.map((provider, index) => /* @__PURE__ */ jsx(LocaleLink, {
        path: `/auth/${provider}`,
        className: "govuk-button",
        children: /* @__PURE__ */ jsxs(T, {
          children: ["login.buttons.", provider]
        })
      }, index))
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login,
  loader: loader$i
}, Symbol.toStringTag, { value: "Module" }));
const loader$h = async ({
  context
}) => {
  const locale = getLocale(context);
  logger$2.debug("logging out user");
  await deleteCookie(jwtCookie);
  throw redirect(localeUrl(`/auth/login`, locale), {
    headers: {
      "Set-Cookie": await deleteCookie(jwtCookie)
    }
  });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$h
}, Symbol.toStringTag, { value: "Module" }));
const loader$g = ({
  context
}) => {
  const config2 = appConfig();
  const locale = getLocale(context);
  logger$2.debug("Sending user to backend for entraid authentication");
  throw redirect(`${config2.backend.url}/auth/entraid?lang=${locale}`);
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$g
}, Symbol.toStringTag, { value: "Module" }));
const loader$f = async ({
  context,
  request
}) => {
  const config2 = context.get(appConfigContext);
  const api = context.get(publisherApi);
  const locale = getLocale(context);
  logger$2.debug("returning from auth backend");
  let providers;
  const query = new URL(request.url).searchParams;
  try {
    providers = await api.getEnabledAuthProviders();
  } catch (err) {
    logger$2.error(err, "Could not fetch auth providers from backend");
    providers = config2.auth.providers;
  }
  try {
    const error = query.get("error");
    if (error) {
      throw new Error(`auth backend returned an error: ${error}`);
    }
  } catch (err) {
    logger$2.error(`problem authenticating user ${err}`);
    throw redirect(localeUrl("/auth/login", locale, createSearchParams({
      error: ["login.error.generic"]
    })));
  }
  logger$2.debug("User successfully logged in");
  throw redirect(localeUrl("/", locale));
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
const ensureAuthenticated = ({ request, context }) => {
  const locale = getLocale(context);
  const auth = context.get(authContext);
  logger$2.debug(`Checking if user is authenticated for route ${request.url}...`);
  try {
    if (!auth.jwt) {
      throw new Error("JWT cookie not found");
    }
    if (auth.expires && auth.expires <= Date.now() / 1e3) {
      throw new Error("JWT token has expired");
    }
    logger$2.info("user is authenticated");
  } catch (err) {
    logger$2.error(`authentication failed: ${err.message}`);
    throw redirect(localeUrl("/auth/login", locale));
  }
};
const unstable_middleware$7 = [ensureAuthenticated, publisherApiMiddleware];
const requireAuth = withComponentProps(Outlet);
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: requireAuth,
  unstable_middleware: unstable_middleware$7
}, Symbol.toStringTag, { value: "Module" }));
function Pagination({
  total_pages,
  current_page,
  page_size,
  pagination,
  hideLineCount,
  hide_pagination_hint,
  anchor,
  page_info
}) {
  const { pathname } = useLocation();
  if (total_pages <= 1) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "govuk-grid-row", children: /* @__PURE__ */ jsx("div", { className: "govuk-grid-column-full", children: /* @__PURE__ */ jsxs("nav", { className: "govuk-pagination", "aria-label": "Pagination", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: clsx("govuk-pagination__prev", {
            "govuk-pagination__inactive": current_page === 1
          }),
          children: current_page === 1 ? /* @__PURE__ */ jsx("span", { className: "govuk-pagination__link-title", children: /* @__PURE__ */ jsx(T, { children: "pagination.previous" }) }) : /* @__PURE__ */ jsx(
            LocaleLink,
            {
              path: pathname,
              query: { page_number: String(current_page - 1), page_size: String(page_size) },
              rel: "previous",
              className: "govuk-link govuk-pagination__link",
              preventScrollReset: true,
              children: /* @__PURE__ */ jsx("span", { className: "govuk-pagination__link-title", children: /* @__PURE__ */ jsx(T, { children: "pagination.previous" }) })
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("ul", { className: "govuk-pagination__list", children: pagination.map((item, index) => {
        if (item === "...") {
          return /* @__PURE__ */ jsx(
            "li",
            {
              className: "govuk-pagination__item govuk-pagination__item--ellipses",
              children: "⋯"
            },
            index
          );
        } else if (item === current_page) {
          return /* @__PURE__ */ jsx(
            "li",
            {
              className: "govuk-pagination__item govuk-pagination__item--current govuk-pagination__inactive",
              children: /* @__PURE__ */ jsx("span", { "aria-current": "page", children: item })
            },
            index
          );
        } else {
          return /* @__PURE__ */ jsx("li", { className: "govuk-pagination__item", children: /* @__PURE__ */ jsx(
            LocaleLink,
            {
              path: pathname,
              query: { page_number: String(item), page_size: String(page_size) },
              "aria-label": `Page ${item}`,
              className: "govuk-link govuk-pagination__link",
              preventScrollReset: true,
              children: item
            }
          ) }, index);
        }
      }) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: clsx("govuk-pagination__next", {
            "govuk-pagination__inactive": current_page >= total_pages
          }),
          children: current_page < total_pages ? /* @__PURE__ */ jsx(
            LocaleLink,
            {
              path: pathname,
              rel: "next",
              query: { page_number: String(current_page + 1), page_size: String(page_size) },
              className: "govuk-link govuk-pagination__link",
              preventScrollReset: true,
              children: /* @__PURE__ */ jsx("span", { className: "govuk-pagination__link-title", children: /* @__PURE__ */ jsx(T, { children: "pagination.next" }) })
            }
          ) : /* @__PURE__ */ jsx("span", { className: "govuk-pagination__link-title", children: /* @__PURE__ */ jsx(T, { children: "pagination.next" }) })
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "govuk-pagination__summary", children: [
      "Page ",
      current_page,
      " of ",
      total_pages
    ] }),
    !hideLineCount && /* @__PURE__ */ jsx("div", { className: "govuk-grid-row govuk-!-margin-bottom-2", children: !hide_pagination_hint && /* @__PURE__ */ jsx("div", { className: "govuk-grid-column-full govuk-!-text-align-centre govuk-hint", children: /* @__PURE__ */ jsx(
      T,
      {
        start: page_info.start_record,
        end: page_info.end_record,
        total: page_info.total_records,
        children: "publish.preview.showing_rows"
      }
    ) }) })
  ] });
}
function Table({
  columns,
  rows,
  colgroup,
  inverted,
  isSticky,
  i18nBase
}) {
  return /* @__PURE__ */ jsx("div", { className: "govuk-table__container", children: /* @__PURE__ */ jsxs("table", { className: clsx("govuk-table", { "sticky-table": isSticky }), children: [
    colgroup && /* @__PURE__ */ jsx("colgroup", { children: colgroup }),
    inverted ? /* @__PURE__ */ jsx("tbody", { className: "govuk-table__body", children: rows.map(
      (row, rIx) => columns.map((col, cIx) => {
        const hasLabel = typeof col === "object" && "label" in col;
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "row", className: "govuk-table__header", children: hasLabel ? col.label : /* @__PURE__ */ jsxs(T, { children: [
            i18nBase,
            ".",
            typeof col === "object" ? col.key : col
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "govuk-table__cell", children: typeof col === "object" ? col.format ? col.format(row[col.key], row) : row[col.key] : row[col] })
        ] }, `${rIx}-${cIx}`);
      })
    ) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("thead", { className: "govuk-table__head", children: /* @__PURE__ */ jsx("tr", { className: "govuk-table__row", children: columns.map((col, index) => {
        const isObject = typeof col === "object";
        const hasLabel = isObject && "label" in col;
        return /* @__PURE__ */ jsx(
          "th",
          {
            scope: "col",
            className: clsx("govuk-table__header", isObject && col.className),
            style: isObject ? col.style : void 0,
            children: hasLabel ? col.label : /* @__PURE__ */ jsxs(T, { children: [
              i18nBase,
              ".",
              typeof col === "object" ? col.key : col
            ] })
          },
          index
        );
      }) }) }),
      /* @__PURE__ */ jsx("tbody", { className: "govuk-table__body", children: rows.map((row, index) => /* @__PURE__ */ jsx("tr", { className: "govuk-table__row", children: columns.map((col, index2) => {
        const isObject = typeof col === "object";
        return /* @__PURE__ */ jsx(
          "td",
          {
            className: clsx("govuk-table__cell", isObject && col.cellClassName),
            children: isObject ? col.format ? col.format(row[col.key], row) : row[col.key] : row[col]
          },
          index2
        );
      }) }, index)) })
    ] })
  ] }) });
}
var GroupRole = /* @__PURE__ */ ((GroupRole2) => {
  GroupRole2["Editor"] = "editor";
  GroupRole2["Approver"] = "approver";
  return GroupRole2;
})(GroupRole || {});
const getEditorUserGroups = (user) => {
  var _a;
  return ((_a = user == null ? void 0 : user.groups) == null ? void 0 : _a.filter((g) => g.roles.includes(GroupRole.Editor))) || [];
};
const getApproverUserGroups = (user) => {
  var _a;
  return ((_a = user == null ? void 0 : user.groups) == null ? void 0 : _a.filter((g) => g.roles.includes(GroupRole.Approver))) || [];
};
const isEditorForDataset = (user, dataset) => {
  if (!user.groups || !dataset.user_group_id) return false;
  return getEditorUserGroups(user).some((g) => g.group.id === dataset.user_group_id);
};
const isApproverForDataset = (user, dataset) => {
  if (!user.groups || !dataset.user_group_id) return false;
  return getApproverUserGroups(user).some(
    (g) => g.group.id === dataset.user_group_id
  );
};
function generateSequenceForNumber(highlight, end) {
  const sequence = [];
  if (highlight < 1 || highlight > end) {
    throw new Error(`Highlighted number must be between 1 and ${end}.`);
  }
  if (end - 1 < 3) {
    sequence.push(
      ...Array.from({ length: end - 1 + 1 }, (_, index) => 1 + index).map((num) => num === highlight ? num : num)
    );
    return sequence;
  }
  if (highlight <= 3) {
    sequence.push(...Array.from({ length: 3 }, (_, index) => 1 + index));
    sequence[highlight - 1] = highlight;
    if (end > 4) {
      sequence.push("...");
      sequence.push(end);
    }
    return sequence;
  }
  if (highlight >= end - 2) {
    if (end - 3 > 1) {
      sequence.push(1, "...");
    }
    for (let i = end - 3; i <= end; i++) {
      if (i === highlight) {
        sequence.push(i);
      } else {
        sequence.push(i);
      }
    }
    return sequence;
  }
  if (highlight - 2 > 1) {
    sequence.push(1, "...");
    sequence.push(highlight - 1);
  } else {
    sequence.push(...Array.from({ length: highlight - 1 }, (_, index) => index + 1));
  }
  sequence.push(highlight);
  if (highlight + 1 < end) {
    sequence.push(highlight + 1, "...", end);
  } else {
    sequence.push(...Array.from({ length: end - highlight }, (_, index) => highlight + 1 + index));
  }
  return sequence;
}
const getPaginationProps = (page, limit, totalRows) => {
  const totalPages = Math.ceil(totalRows / limit);
  return {
    current_page: page,
    total_pages: totalPages,
    page_size: limit,
    page_info: {
      total_records: totalRows,
      start_record: (page - 1) * limit + 1,
      end_record: Math.min(page * limit, totalRows)
    },
    pagination: totalPages > 1 ? generateSequenceForNumber(page, totalPages) : []
  };
};
const dateFormat = (date, formatStr, options) => {
  const tzDate = new TZDate(date, "Europe/London");
  if (options == null ? void 0 : options.locale) {
    options.locale = options.locale.includes("cy") ? cy : enGB;
  }
  return format(tzDate, formatStr, options);
};
var DatasetStatus$1 = /* @__PURE__ */ ((DatasetStatus2) => {
  DatasetStatus2["New"] = "new";
  DatasetStatus2["Live"] = "live";
  DatasetStatus2["Migrated"] = "migrated";
  return DatasetStatus2;
})(DatasetStatus$1 || {});
var PublishingStatus = /* @__PURE__ */ ((PublishingStatus2) => {
  PublishingStatus2["Incomplete"] = "incomplete";
  PublishingStatus2["UpdateIncomplete"] = "update_incomplete";
  PublishingStatus2["PendingApproval"] = "pending_approval";
  PublishingStatus2["UpdatePendingApproval"] = "update_pending_approval";
  PublishingStatus2["ChangesRequested"] = "changes_requested";
  PublishingStatus2["Scheduled"] = "scheduled";
  PublishingStatus2["UpdateScheduled"] = "update_scheduled";
  PublishingStatus2["Published"] = "published";
  return PublishingStatus2;
})(PublishingStatus || {});
var TaskListStatus = /* @__PURE__ */ ((TaskListStatus2) => {
  TaskListStatus2["CannotStart"] = "cannot_start";
  TaskListStatus2["Available"] = "available";
  TaskListStatus2["NotRequired"] = "not_required";
  TaskListStatus2["NotStarted"] = "not_started";
  TaskListStatus2["Incomplete"] = "incomplete";
  TaskListStatus2["Completed"] = "completed";
  TaskListStatus2["Unchanged"] = "unchanged";
  TaskListStatus2["Updated"] = "updated";
  return TaskListStatus2;
})(TaskListStatus || {});
const statusToColour = (status) => {
  switch (status) {
    case DatasetStatus$1.Migrated:
      return "yellow";
    case DatasetStatus$1.New:
    case PublishingStatus.Incomplete:
    case PublishingStatus.UpdateIncomplete:
    case TaskListStatus.Incomplete:
      return "blue";
    case TaskListStatus.NotStarted:
    case UserStatus.Inactive:
    case PublishingStatus.ChangesRequested:
      return "red";
    case TaskListStatus.Updated:
    case PublishingStatus.PendingApproval:
    case PublishingStatus.UpdatePendingApproval:
    case PublishingStatus.Scheduled:
    case PublishingStatus.UpdateScheduled:
      return "orange";
    case DatasetStatus$1.Live:
    case PublishingStatus.Published:
    case TaskListStatus.Completed:
    case UserStatus.Active:
      return "green";
    case TaskListStatus.Unchanged:
      return "grey";
    default:
      return "";
  }
};
const loader$e = async ({
  context,
  request
}) => {
  const {
    user
  } = context.get(authContext);
  const api = context.get(publisherApi);
  const searchParams = new URL(request.url).searchParams;
  try {
    const page = parseInt(searchParams.get("page_number"), 10) || 1;
    const limit = parseInt(searchParams.get("page_size"), 10) || 20;
    const canCreate = getEditorUserGroups(user).length > 0;
    const results = await api.getUserDatasetList(page, limit);
    const {
      data: data2,
      count
    } = results;
    const pagination = getPaginationProps(page, limit, count);
    return {
      data: data2,
      pagination,
      // flash,
      canCreate
      // errors
    };
  } catch (err) {
    return {
      data: [],
      canCreate: false
    };
  }
};
const homepage = withComponentProps(function Homepage({
  loaderData
}) {
  const {
    t
  } = useTranslation();
  const {
    i18n
  } = useTranslation();
  const columns = [{
    key: "title",
    label: t("homepage.table.title"),
    format: (value, row) => {
      const content = value || `${row.title_alt} [${t("homepage.table.not_translated")}]`;
      return /* @__PURE__ */ jsx(LocaleLink, {
        path: `/publish/${row.id}/overview`,
        className: "govuk-link",
        children: content
      });
    }
  }, {
    key: "group_name",
    label: t("homepage.table.group"),
    cellClassName: "group nowrap"
  }, {
    key: "last_updated",
    label: t("homepage.table.last_updated"),
    style: {
      width: "15%"
    },
    format: (value) => dateFormat(value, "d MMMM yyyy", {
      locale: i18n.language
    }),
    cellClassName: "date nowrap"
  }, {
    key: "status",
    label: t("homepage.table.dataset_status"),
    format: (value) => value ? /* @__PURE__ */ jsx("strong", {
      className: `govuk-tag max-width-none govuk-tag--${statusToColour(value)}`,
      children: t(`homepage.status.${value}`)
    }) : null,
    cellClassName: "status nowrap"
  }, {
    key: "publishing_status",
    label: t("homepage.table.publish_status"),
    format: (value) => value ? /* @__PURE__ */ jsx("strong", {
      className: `govuk-tag max-width-none govuk-tag--${statusToColour(value)}`,
      children: t(`homepage.publishing_status.${value}`)
    }) : null,
    cellClassName: "status nowrap"
  }];
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-full",
        children: /* @__PURE__ */ jsx("h1", {
          className: "govuk-heading-xl",
          children: t("homepage.heading")
        })
      })
    }), loaderData.canCreate && /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-one-half",
        children: /* @__PURE__ */ jsx(LocaleLink, {
          path: "/publish",
          className: "govuk-button",
          children: t("homepage.buttons.create")
        })
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-full",
        children: loaderData.data && loaderData.data.length > 0 ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(Table, {
            columns,
            rows: loaderData.data
          }), /* @__PURE__ */ jsx(Pagination, {
            ...loaderData.pagination
          })]
        }) : /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("p", {
            className: "govuk-body",
            children: t("homepage.no_results.summary")
          }), /* @__PURE__ */ jsxs("ul", {
            className: "govuk-list govuk-list--bullet",
            children: [/* @__PURE__ */ jsx("li", {
              children: t("homepage.no_results.summary_1")
            }), /* @__PURE__ */ jsx("li", {
              children: t("homepage.no_results.summary_2")
            })]
          })]
        })
      })
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: homepage,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
const loader$d = ({
  context,
  request
}) => {
  const {
    user
  } = context.get(authContext);
  const editorGroups = getEditorUserGroups(user);
  const datasetGroup = editorGroups[0].group;
  const nextStep = editorGroups.length === 1 ? `title?group_id=${datasetGroup.id}` : "group";
  return {
    nextStep
  };
};
const start = withComponentProps(function Start({
  loaderData
}) {
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: t("publish.start.title")
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsx("p", {
      className: "govuk-body",
      children: t("publish.start.p1")
    }), /* @__PURE__ */ jsxs("ul", {
      className: "govuk-list govuk-list--bullet",
      children: [/* @__PURE__ */ jsx("li", {
        children: t("publish.start.data_table")
      }), /* @__PURE__ */ jsx("li", {
        children: t("publish.start.lookup_table")
      }), /* @__PURE__ */ jsx("li", {
        children: t("publish.start.metadata")
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "govuk-button-group",
      children: /* @__PURE__ */ jsx(LocaleLink, {
        path: `/publish/${loaderData.nextStep}`,
        className: "govuk-button",
        children: t("buttons.continue")
      })
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: start,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
function RadioGroup({
  name,
  label,
  hint,
  options,
  value,
  labelledBy,
  errorMessage
}) {
  const errors = useErrors();
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clsx("govuk-form-group", {
        "govuk-form-group--error": errors == null ? void 0 : errors.find((e) => e.field === name)
      }),
      children: /* @__PURE__ */ jsxs("fieldset", { className: "govuk-fieldset", "aria-labelledby": labelledBy, children: [
        label && /* @__PURE__ */ jsx("legend", { className: "govuk-fieldset__legend govuk-fieldset__legend--l", children: /* @__PURE__ */ jsx("h2", { className: "govuk-fieldset__heading govuk-heading-m", children: label }) }),
        hint && /* @__PURE__ */ jsx("p", { className: "govuk-hint", children: hint }),
        errorMessage && (errors == null ? void 0 : errors.find((e) => e.field === name)) && /* @__PURE__ */ jsxs("p", { id: `${name}-error`, className: "govuk-error-message", children: [
          /* @__PURE__ */ jsx("span", { className: "govuk-visually-hidden", children: "Error:" }),
          " ",
          errorMessage
        ] }),
        /* @__PURE__ */ jsx("div", { className: "govuk-radios", "data-module": "govuk-radios", children: options.map((option, index) => {
          const isDivider = "divider" in option;
          if (isDivider) {
            return /* @__PURE__ */ jsx("div", { className: "govuk-radios__divider", children: option.divider }, index);
          }
          return /* @__PURE__ */ jsxs(Fragment$1, { children: [
            /* @__PURE__ */ jsxs("div", { className: "govuk-radios__item", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "govuk-radios__input",
                  id: option.value,
                  name,
                  type: "radio",
                  value: option.value,
                  disabled: option.disabled,
                  defaultChecked: option.value === value,
                  "data-aria-controls": option.children && `conditional-${option.value}`
                }
              ),
              /* @__PURE__ */ jsx("label", { className: "govuk-label govuk-radios__label", htmlFor: option.value, children: option.label }),
              option.hint && /* @__PURE__ */ jsx(
                "div",
                {
                  id: `${option.value}-hint`,
                  className: "govuk-hint govuk-radios__hint govuk-radios__hint-gel",
                  children: option.hint
                }
              )
            ] }),
            option.children && /* @__PURE__ */ jsx(
              "div",
              {
                className: "govuk-radios__conditional govuk-radios__conditional--hidden",
                id: `conditional-${option.value}`,
                children: option.children
              }
            )
          ] }, index);
        }) })
      ] })
    }
  );
}
var Designation = /* @__PURE__ */ ((Designation2) => {
  Designation2["Official"] = "official";
  Designation2["Accredited"] = "accredited";
  Designation2["InDevelopment"] = "in_development";
  Designation2["Management"] = "management";
  Designation2["None"] = "none";
  return Designation2;
})(Designation || {});
var DurationUnit = /* @__PURE__ */ ((DurationUnit2) => {
  DurationUnit2["Day"] = "day";
  DurationUnit2["Week"] = "week";
  DurationUnit2["Month"] = "month";
  DurationUnit2["Year"] = "year";
  return DurationUnit2;
})(DurationUnit || {});
const datasetIdValidator = z.object({
  datasetId: z.uuidv4().trim().nonempty()
});
const titleValidator = z.object({
  title: z.string().trim().nonempty("missing").min(3, "too_short").max(1e3, "too_long")
});
z.object({
  summary: z.string().trim().nonempty()
});
z.object({
  collection: z.string().trim().nonempty()
});
z.object({
  quality: z.string().trim().nonempty(),
  rounding_applied: z.boolean().nonoptional(),
  rounding_description: z.string().trim().optional()
}).refine((input) => {
  if (input.rounding_applied === true && !input.rounding_description) {
    return false;
  }
  return true;
});
z.object({
  is_updated: z.coerce.boolean().nonoptional(),
  frequency_value: z.coerce.number().int().optional(),
  frequency_unit: z.enum(Object.values(DurationUnit)).optional()
}).refine((input) => {
  if (input.is_updated) {
    return input.frequency_value && input.frequency_unit;
  }
});
z.object({
  link_id: z.string().trim().nonempty(),
  link_url: z.url({ protocol: /^https?$/, hostname: z.regexes.domain }).trim(),
  link_label: z.string().trim().nonempty()
});
z.object({
  designation: z.enum(Object.values(Designation))
});
z.object({
  provider_id: z.uuidv4().trim().nonempty()
});
z.object({
  topics: z.array(z.string()).min(1)
});
z.object({
  day: z.coerce.number().int().min(1).max(31),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min((/* @__PURE__ */ new Date()).getFullYear()),
  hour: z.coerce.number().int().min(0).max(23),
  minute: z.coerce.number().int().min(0).max(59)
});
z.object({
  organisation: z.uuidv4().trim().nonempty()
});
const getGroupIdValidator = (groupIds) => z.object({
  group_id: z.enum(groupIds).nonoptional()
});
z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().optional()
}).refine((input) => {
  if (input.decision === "reject" && !input.decision) {
    return false;
  }
  return true;
});
const singleLangUserGroup = (group2, lang) => {
  var _a, _b;
  const meta2 = (_a = group2.metadata) == null ? void 0 : _a.find((meta22) => meta22.language === lang);
  return {
    ...pick(group2, ["id", "users", "datasets", "created_at", "updated_at"]),
    name: meta2 == null ? void 0 : meta2.name,
    email: meta2 == null ? void 0 : meta2.email,
    organisation: (_b = group2.organisation) == null ? void 0 : _b.name
  };
};
const loader$c = async ({
  context
}) => {
  const {
    user
  } = context.get(authContext);
  const locale = getLocale(context);
  const availableGroups = getEditorUserGroups(user).map((g) => singleLangUserGroup(g.group, locale)) || [];
  console.log(getEditorUserGroups(user));
  return {
    availableGroups
  };
};
const action$5 = async ({
  context,
  request
}) => {
  const locale = getLocale(context);
  const {
    user
  } = context.get(authContext);
  const availableGroups = getEditorUserGroups(user).map((g) => singleLangUserGroup(g.group, locale)) || [];
  const validGroupIds = availableGroups.map((group2) => group2.id);
  let errors = [];
  const values = getGroupIdValidator(validGroupIds).safeParse(Object.fromEntries(await request.formData()));
  if (values.success) {
    console.log("SUCCESS");
    throw redirect(localeUrl(`/publish/title?group_id=${values.data.group_id}`, locale));
  } else {
    errors = values.error.issues.map((issue) => ({
      field: issue.path[0],
      message: {
        key: `publish.group.form.group_id.error.${issue.input ? "invalid" : "missing"}`
      }
    }));
  }
  return {
    errors
  };
};
const group = withComponentProps(function SelectGroup({
  loaderData,
  actionData
}) {
  console.log(actionData);
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsx(ErrorProvider, {
    errors: actionData == null ? void 0 : actionData.errors,
    children: /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-column-two-thirds",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "govuk-heading-xl",
          id: "group-id",
          children: t("publish.group.heading")
        }), /* @__PURE__ */ jsxs(Form, {
          method: "POST",
          children: [/* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsx(RadioGroup, {
            name: "group_id",
            labelledBy: "group-id",
            options: loaderData.availableGroups.map((group2) => ({
              value: group2.id || "",
              label: group2.name || ""
            }))
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            className: "govuk-button",
            "data-module": "govuk-button",
            children: t("buttons.continue")
          })]
        })]
      })
    })
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: group,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const InputText = ({ name, value, labelledBy }) => {
  const errors = useErrors();
  return /* @__PURE__ */ jsx("div", { className: "govuk-form-group", children: /* @__PURE__ */ jsx(
    "input",
    {
      className: clsx("govuk-input", {
        "govuk-input--error": errors == null ? void 0 : errors.find((e) => e.field === name)
      }),
      id: name,
      name,
      type: "text",
      value,
      "aria-labelledby": labelledBy
    }
  ) });
};
const SubmitButton = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("button", { type: "submit", className: "govuk-button", "data-module": "govuk-button", children: t("buttons.continue") });
};
const action$4 = async ({
  context,
  request
}) => {
  var _a;
  let errors = [];
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const searchParams = new URL(request.url).searchParams;
  const groupId = searchParams.get("group_id");
  const formData = Object.fromEntries(await request.formData());
  const result = titleValidator.safeParse(formData);
  let datasetId = void 0;
  console.log(result);
  try {
    if (result.success) {
      const title2 = result.data.title;
      if (!groupId) {
        errors.push({
          field: "",
          message: {
            key: "publish.title.form.group_id.error.missing"
          }
        });
        throw new Error();
      }
      const dataset = await api.createDataset(title2, groupId, locale);
      datasetId = dataset.id;
    } else {
      errors = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: {
          key: `publish.title.form.title.error.${issue.message}`
        }
      }));
    }
  } catch (err) {
    if (err instanceof ApiException) {
      errors = [{
        field: "api",
        message: {
          key: "errors.try_later"
        }
      }];
    }
  }
  if (errors.length) {
    return {
      errors,
      title: ((_a = result.data) == null ? void 0 : _a.title) || formData.title
    };
  }
  throw redirect(localeUrl(`/publish/${datasetId}/upload`, locale));
};
const title = withComponentProps(function Title({
  actionData
}) {
  console.log({
    actionData
  });
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxs(ErrorProvider, {
    errors: actionData == null ? void 0 : actionData.errors,
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      id: "title-label",
      children: t("publish.title.heading")
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsxs("ul", {
      className: "govuk-list govuk-list--bullet",
      children: [/* @__PURE__ */ jsx("li", {
        children: t("publish.title.appear")
      }), /* @__PURE__ */ jsx("li", {
        children: t("publish.title.descriptive")
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "govuk-hint",
      children: t("publish.title.form.title.hint")
    }), /* @__PURE__ */ jsxs(Form, {
      method: "POST",
      children: [/* @__PURE__ */ jsx(InputText, {
        name: "title",
        value: actionData == null ? void 0 : actionData.title,
        labelledBy: "title-label"
      }), /* @__PURE__ */ jsx(SubmitButton, {})]
    })]
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: title
}, Symbol.toStringTag, { value: "Module" }));
class NotFoundException extends Error {
  constructor(message = "Not Found", status = 404) {
    super(message);
    this.message = message;
    this.status = status;
    this.name = "NotFoundException";
    this.status = status;
  }
}
const datasetContext = unstable_createContext();
const fetchDatasetMiddleware = (include) => async ({ context, params }) => {
  const api = context.get(publisherApi);
  const result = datasetIdValidator.safeParse(params);
  if (!result.success) {
    logger$2.error("Invalid or missing datasetId");
    throw new NotFoundException("errors.dataset_missing");
  }
  try {
    const dataset = await api.getDataset(result.data.datasetId, include);
    context.set(datasetContext, {
      datasetId: dataset.id,
      dataset
    });
  } catch (err) {
    if ([401, 403].includes(err.status)) {
      throw err;
    }
    throw new NotFoundException("errors.dataset_missing");
  }
};
var TaskAction = /* @__PURE__ */ ((TaskAction2) => {
  TaskAction2["Publish"] = "publish";
  TaskAction2["Unpublish"] = "unpublish";
  TaskAction2["Archive"] = "archive";
  TaskAction2["Unarchive"] = "unarchive";
  return TaskAction2;
})(TaskAction || {});
function FlashMessages() {
  const flash = [];
  if (!flash || !flash.length) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "govuk-notification-banner govuk-notification-banner--success",
      role: "region",
      "data-module": "govuk-notification-banner",
      children: /* @__PURE__ */ jsx("div", { className: "govuk-notification-banner__content", children: flash == null ? void 0 : flash.map((msg, index) => {
        if (typeof msg == "string") {
          return /* @__PURE__ */ jsx("p", { className: "govuk-notification-banner__heading", children: /* @__PURE__ */ jsx(T, { children: msg }) }, index);
        } else if (msg != null && typeof msg == "object") {
          return /* @__PURE__ */ jsx("p", { className: "govuk-notification-banner__heading", children: /* @__PURE__ */ jsx(T, { ...msg.params, children: msg.key }) }, index);
        }
      }) })
    }
  );
}
function DatasetStatus({ publishingStatus, datasetStatus }) {
  return /* @__PURE__ */ jsxs("div", { className: "govuk-!-margin-bottom-8", children: [
    /* @__PURE__ */ jsx("strong", { className: clsx("govuk-tag", `govuk-tag--${statusToColour(datasetStatus)}`), children: /* @__PURE__ */ jsxs(T, { children: [
      "badge.dataset_status.",
      datasetStatus
    ] }) }),
    " ",
    publishingStatus && /* @__PURE__ */ jsx("strong", { className: clsx("govuk-tag", `govuk-tag--${statusToColour(publishingStatus)}`), children: /* @__PURE__ */ jsxs(T, { children: [
      "badge.publishing_status.",
      publishingStatus
    ] }) })
  ] });
}
function Tabs({ tabs, tabIndexBase = 0 }) {
  useEffect(() => {
    (async () => {
      const { initAll } = await import("govuk-frontend/dist/govuk/govuk-frontend.min.js");
      initAll();
    })();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "govuk-tabs", "data-module": "govuk-tabs", children: [
    /* @__PURE__ */ jsx("div", { className: "tabs", children: /* @__PURE__ */ jsx("div", { className: "govuk-width-container", children: /* @__PURE__ */ jsx("div", { className: "govuk-main-wrapper govuk-!-padding-bottom-0", children: /* @__PURE__ */ jsx("ul", { className: "govuk-tabs__list", role: "tablist", children: tabs.map((tab, i) => /* @__PURE__ */ jsx(
      "li",
      {
        className: clsx("govuk-tabs__list-item", {
          "govuk-tabs__list-item--selected": i === 0
        }),
        role: "presentation",
        suppressHydrationWarning: true,
        children: /* @__PURE__ */ jsx(
          "a",
          {
            className: "govuk-tabs__tab",
            href: `#${tab.id}`,
            id: `tab_${tab.id}`,
            role: "tab",
            "aria-controls": tab.id,
            tabIndex: tabIndexBase + i,
            suppressHydrationWarning: true,
            children: tab.label
          }
        )
      },
      i
    )) }) }) }) }),
    tabs.filter((t) => t.children).map((tab, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "govuk-tabs__panel",
        id: tab.id,
        role: "tabpanel",
        "aria-labelledby": `tab_${tab.id}`,
        suppressHydrationWarning: true,
        children: tab.children
      },
      i
    ))
  ] });
}
const isPublished = (revision) => {
  return Boolean(revision.approved_at && revision.publish_at && isBefore(revision.publish_at, /* @__PURE__ */ new Date()));
};
const createdAtDesc = (revA, revB) => revB.created_at < revA.created_at ? -1 : 1;
const getLatestRevision = (dataset) => {
  var _a;
  return first((_a = dataset.revisions) == null ? void 0 : _a.sort(createdAtDesc));
};
var TaskStatus = /* @__PURE__ */ ((TaskStatus2) => {
  TaskStatus2["Requested"] = "requested";
  TaskStatus2["Withdrawn"] = "withdrawn";
  TaskStatus2["Approved"] = "approved";
  TaskStatus2["Rejected"] = "rejected";
  return TaskStatus2;
})(TaskStatus || {});
const getDatasetStatus = (dataset) => {
  return dataset.live && isBefore(dataset.live, /* @__PURE__ */ new Date()) ? DatasetStatus$1.Live : DatasetStatus$1.New;
};
const getPublishingStatus = (dataset, revision) => {
  var _a;
  revision = revision ?? getLatestRevision(dataset);
  const datasetStatus = getDatasetStatus(dataset);
  const openPublishingTask = (_a = dataset.tasks) == null ? void 0 : _a.find(
    (task) => task.open && task.action === TaskAction.Publish
  );
  if (openPublishingTask) {
    if (openPublishingTask.status === TaskStatus.Requested) {
      return datasetStatus === DatasetStatus$1.Live ? PublishingStatus.UpdatePendingApproval : PublishingStatus.PendingApproval;
    }
    if (openPublishingTask.status === TaskStatus.Rejected) return PublishingStatus.ChangesRequested;
  }
  if (datasetStatus === DatasetStatus$1.New) {
    return (revision == null ? void 0 : revision.approved_at) ? PublishingStatus.Scheduled : PublishingStatus.Incomplete;
  }
  if ((revision == null ? void 0 : revision.approved_at) && revision.publish_at && isBefore(revision.publish_at, /* @__PURE__ */ new Date())) {
    return PublishingStatus.Published;
  }
  return (revision == null ? void 0 : revision.approved_at) ? PublishingStatus.UpdateScheduled : PublishingStatus.UpdateIncomplete;
};
const singleLangRevision = (revision, lang) => {
  var _a, _b;
  if (!revision || !lang) return void 0;
  return {
    ...revision,
    metadata: (_a = revision.metadata) == null ? void 0 : _a.find((meta2) => meta2.language === lang),
    providers: (revision.providers || []).filter(
      (provider) => provider.language === (lang == null ? void 0 : lang.toLowerCase())
    ),
    related_links: (_b = revision.related_links) == null ? void 0 : _b.map((link) => ({
      ...link,
      label: lang.includes(Locale.English) ? link.label_en : link.label_cy
    }))
  };
};
const singleLangDataset = (dataset, lang) => {
  var _a, _b, _c, _d;
  return {
    ...dataset,
    start_revision: singleLangRevision(dataset.start_revision, lang),
    end_revision: singleLangRevision(dataset.end_revision, lang),
    draft_revision: singleLangRevision(dataset.draft_revision, lang),
    published_revision: singleLangRevision(dataset.published_revision, lang),
    revisions: (_a = dataset.revisions) == null ? void 0 : _a.map((rev) => singleLangRevision(rev, lang)),
    dimensions: (_b = dataset.dimensions) == null ? void 0 : _b.map((dimension) => {
      var _a2;
      return {
        ...dimension,
        metadata: (_a2 = dimension.metadata) == null ? void 0 : _a2.find((meta2) => meta2.language === lang)
      };
    }),
    measure: dataset.measure ? {
      ...dataset.measure,
      metadata: (_c = dataset.measure.metadata) == null ? void 0 : _c.find((meta2) => meta2.language === lang),
      measure_table: (_d = dataset.measure.measure_table) == null ? void 0 : _d.filter(
        (row) => row.language === lang.toLowerCase()
      )
    } : void 0
  };
};
const unstable_middleware$6 = [fetchDatasetMiddleware()];
const loader$b = async ({
  context,
  request
}) => {
  var _a, _b, _c;
  const locale = getLocale(context);
  const {
    user
  } = context.get(authContext);
  if (!user) {
    throw redirect(localeUrl("/auth/login", locale));
  }
  const {
    dataset,
    datasetId
  } = context.get(datasetContext);
  const api = context.get(publisherApi);
  const query = new URL(request.url).searchParams;
  let errors = [];
  const canMoveGroup = getApproverUserGroups(user).length > 1;
  const canEdit = isEditorForDataset(user, dataset);
  const canApprove = isApproverForDataset(user, dataset);
  try {
    const [dataset2, history] = await Promise.all([api.getDataset(datasetId, DatasetInclude.Overview), api.getDatasetHistory(datasetId)]);
    const revision2 = singleLangRevision(dataset2.end_revision, locale);
    if (query.get("withdraw")) {
      try {
        await api.withdrawFromPublication(dataset2.id, revision2.id);
      } catch (err) {
        logger$2.error(err, `Failed to withdraw dataset`);
        errors = [{
          field: "withdraw",
          message: {
            key: "publish.overview.error.withdraw"
          }
        }];
      }
      throw redirect(localeUrl(`/publish/${dataset2.id}/tasklist`, locale));
    }
    const title2 = (_a = revision2 == null ? void 0 : revision2.metadata) == null ? void 0 : _a.title;
    const datasetStatus2 = getDatasetStatus(dataset2);
    const publishingStatus2 = getPublishingStatus(dataset2, revision2);
    const openPublishTask = (_b = dataset2.tasks) == null ? void 0 : _b.find((task) => task.open && task.action === TaskAction.Publish);
    return {
      dataset: dataset2,
      revision: revision2,
      title: title2,
      datasetStatus: datasetStatus2,
      publishingStatus: publishingStatus2,
      canMoveGroup,
      canEdit,
      canApprove,
      openPublishTask,
      history
    };
  } catch (err) {
    if (err instanceof ApiException) {
      logger$2.error(err, `Failed to fetch the dataset overview`);
      throw new NotFoundException();
    }
  }
  const revision = singleLangRevision(dataset.end_revision, locale);
  const datasetStatus = getDatasetStatus(dataset);
  const publishingStatus = getPublishingStatus(dataset, revision);
  return {
    errors,
    dataset,
    title: (_c = revision.metadata) == null ? void 0 : _c.title,
    datasetStatus,
    publishingStatus
  };
};
function ActionLink({
  path: path2,
  action: action2,
  newTab,
  queryParams
}) {
  return /* @__PURE__ */ jsx(LocaleLink, {
    className: "govuk-link govuk-link--no-underline",
    path: path2,
    query: queryParams,
    target: newTab ? "_blank" : void 0,
    children: /* @__PURE__ */ jsxs(T, {
      children: ["publish.overview.actions.", action2]
    })
  });
}
function ActionsTab({
  datasetId,
  canEdit,
  canApprove,
  canMoveGroup,
  datasetStatus,
  publishingStatus,
  openPublishTask
}) {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "task-decision-buttons",
      children: [canApprove && ["pending_approval", "update_pending_approval"].includes(publishingStatus) && /* @__PURE__ */ jsx(LocaleLink, {
        path: `/publish/${datasetId}/task-decision/${openPublishTask == null ? void 0 : openPublishTask.id}`,
        className: "govuk-button govuk-!-margin-top-4",
        children: /* @__PURE__ */ jsx(T, {
          children: "publish.overview.buttons.pending_approval"
        })
      }), canEdit && (openPublishTask == null ? void 0 : openPublishTask.status) === "rejected" && /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx("p", {
          className: "govuk-body",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.overview.rejected.summary"
          })
        }), /* @__PURE__ */ jsx("p", {
          className: "govuk-body",
          children: openPublishTask == null ? void 0 : openPublishTask.comment
        }), /* @__PURE__ */ jsx(LocaleLink, {
          path: `/publish/${datasetId}/tasklist`,
          className: "govuk-button govuk-!-margin-top-4",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.overview.buttons.fix"
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs("ul", {
      className: "govuk-list",
      children: [canEdit && publishingStatus === "incomplete" && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/publish/${datasetId}/tasklist`,
          action: "continue"
        })
      }), canEdit && publishingStatus === "update_incomplete" && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/publish/${datasetId}/tasklist`,
          action: "continue_update"
        })
      }), datasetStatus === "live" && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/published/${datasetId}`,
          action: "view_published_dataset",
          newTab: true
        })
      }), canEdit && publishingStatus === "published" && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/publish/${datasetId}/update`,
          action: "update_dataset"
        })
      }), publishingStatus !== "published" && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/publish/${datasetId}/cube-preview`,
          action: "preview"
        })
      }), canEdit && ["pending_approval", "update_pending_approval", "scheduled", "update_scheduled"].includes(publishingStatus) && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: `/publish/${datasetId}/overview`,
          action: ["update_scheduled", "update_pending_approval"].includes(publishingStatus) ? "withdraw_update_revision" : "withdraw_first_revision",
          queryParams: {
            withdraw: "true"
          }
        })
      }), canMoveGroup && /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx(ActionLink, {
          path: "move",
          action: "move"
        })
      })]
    })]
  });
}
function HistoryTab({
  history
}) {
  const {
    i18n
  } = useTranslation();
  const columns = [{
    key: "created_at",
    label: /* @__PURE__ */ jsx(T, {
      children: "publish.overview.history.table.created_at"
    }),
    format: (createdAt, event) => {
      return /* @__PURE__ */ jsx("span", {
        "data-eventid": event.id,
        children: dateFormat(createdAt, "h:mmaaa, d MMMM yyyy", {
          locale: i18n.language
        })
      });
    }
  }, {
    key: "action",
    label: /* @__PURE__ */ jsx(T, {
      children: "publish.overview.history.table.action"
    }),
    format: (action2, event) => {
      if (event.entity === "dataset") {
        return /* @__PURE__ */ jsxs(T, {
          children: ["publish.overview.history.event.dataset.", action2]
        });
      }
      if (event.entity === "revision") {
        return /* @__PURE__ */ jsxs(T, {
          children: ["publish.overview.history.event.revision.", action2]
        });
      }
      if (event.entity === "task") {
        const {
          action: action22,
          status,
          isUpdate
        } = event.data;
        if (action22 === "publish") {
          return /* @__PURE__ */ jsxs(T, {
            children: ["publish.overview.history.event.task.publish.", isUpdate ? `update_${status}` : status]
          });
        }
      }
    }
  }, {
    key: "created_by",
    label: /* @__PURE__ */ jsx(T, {
      children: "publish.overview.history.table.user"
    }),
    format: (createdBy) => {
      return createdBy === "system" ? /* @__PURE__ */ jsx(T, {
        children: "publish.overview.history.event.created_by.system"
      }) : createdBy;
    }
  }, {
    key: "comment",
    label: /* @__PURE__ */ jsx(T, {
      children: "publish.overview.history.table.comment"
    }),
    format: (value, row) => {
      var _a;
      if (row.entity === "task") {
        return (_a = row.data) == null ? void 0 : _a.comment;
      }
    }
  }];
  return /* @__PURE__ */ jsx(Table, {
    columns,
    rows: history
  });
}
const overview = withComponentProps(function Overview({
  loaderData
}) {
  var _a, _b, _c, _d, _e, _f;
  (_a = loaderData.dataset) == null ? void 0 : _a.id;
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsx(ErrorProvider, {
    errors: loaderData.errors,
    children: /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-column-full",
        children: [/* @__PURE__ */ jsx(FlashMessages, {}), /* @__PURE__ */ jsx("span", {
          className: "region-subhead",
          children: t("publish.overview.subheading")
        }), /* @__PURE__ */ jsx("h1", {
          className: "govuk-heading-xl govuk-!-margin-bottom-2",
          children: loaderData.title
        }), /* @__PURE__ */ jsx(DatasetStatus, {
          publishingStatus: loaderData.publishingStatus,
          datasetStatus: loaderData.datasetStatus
        }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsxs("div", {
          className: "overview-details",
          children: [["pending_approval", "update_pending_approval"].includes(loaderData.publishingStatus) && ((_b = loaderData.revision) == null ? void 0 : _b.publish_at) && /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx("p", {
              className: "govuk-body govuk-!-margin-0",
              children: /* @__PURE__ */ jsx(T, {
                publishAt: dateFormat((_c = loaderData.revision) == null ? void 0 : _c.publish_at, "h:mmaaa, d MMMM yyyy"),
                children: "publish.overview.pending.publish_at"
              })
            }), /* @__PURE__ */ jsx("p", {
              className: "govuk-body govuk-!-margin-0",
              children: /* @__PURE__ */ jsx(T, {
                userName: (_d = loaderData.openPublishTask) == null ? void 0 : _d.created_by_name,
                children: "publish.overview.pending.requested_by"
              })
            })]
          }), ["scheduled", "update_scheduled"].includes(loaderData.publishingStatus) && ((_e = loaderData.revision) == null ? void 0 : _e.publish_at) && /* @__PURE__ */ jsx("p", {
            className: "govuk-body",
            children: /* @__PURE__ */ jsx(T, {
              publishAt: dateFormat((_f = loaderData.revision) == null ? void 0 : _f.publish_at, "h:mmaaa, d MMMM yyyy"),
              children: "publish.overview.scheduled.publish_at"
            })
          })]
        }), /* @__PURE__ */ jsx(Tabs, {
          tabs: [{
            id: "actions",
            label: /* @__PURE__ */ jsx(T, {
              children: "publish.overview.tabs.actions"
            }),
            children: /* @__PURE__ */ jsx(ActionsTab, {
              datasetId: loaderData.dataset.id,
              canEdit: loaderData.canEdit,
              canApprove: loaderData.canApprove,
              canMoveGroup: loaderData.canMoveGroup,
              datasetStatus: loaderData.datasetStatus,
              publishingStatus: loaderData.publishingStatus,
              openPublishTask: loaderData.openPublishTask
            })
          }, {
            id: "history",
            label: /* @__PURE__ */ jsx(T, {
              children: "publish.overview.tabs.history"
            }),
            children: /* @__PURE__ */ jsx(HistoryTab, {
              history: loaderData.history
            })
          }]
        })]
      })
    })
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: overview,
  loader: loader$b,
  unstable_middleware: unstable_middleware$6
}, Symbol.toStringTag, { value: "Module" }));
function TasklistStatus({ status }) {
  const colour = statusToColour(status);
  return /* @__PURE__ */ jsx("div", { className: "govuk-task-list__status", children: /* @__PURE__ */ jsx("strong", { className: colour ? `govuk-tag govuk-tag--${colour}` : void 0, children: /* @__PURE__ */ jsxs(T, { children: [
    "publish.tasklist.status.",
    status
  ] }) }) });
}
const unstable_middleware$5 = [fetchDatasetMiddleware(DatasetInclude.Meta)];
const loader$a = async ({
  context
}) => {
  var _a;
  const locale = getLocale(context);
  const {
    dataset: fetchedDataset
  } = context.get(datasetContext);
  const {
    user,
    isDeveloper
  } = context.get(authContext);
  if (!user) {
    throw redirect(localeUrl("/auth/login", locale));
  }
  const api = context.get(publisherApi);
  const dataset = singleLangDataset(fetchedDataset, locale);
  const draftRevision = dataset.draft_revision;
  const datasetStatus = getDatasetStatus(fetchedDataset);
  const publishingStatus = getPublishingStatus(fetchedDataset);
  const canEdit = isEditorForDataset(user, fetchedDataset);
  const datasetTitle = (_a = draftRevision.metadata) == null ? void 0 : _a.title;
  const dimensions = dataset.dimensions;
  let taskList = null;
  if (!draftRevision || !canEdit) {
    throw redirect(localeUrl(`/publish/${dataset.id}/overview`, locale));
  }
  try {
    taskList = await api.getTaskList(dataset.id);
  } catch (err) {
    logger$2.error(err, `Failed to fetch the tasklist`);
    throw redirect("/");
  }
  const canSubmit = canEdit && taskList.canPublish;
  return {
    isDeveloper,
    datasetTitle,
    datasetId: dataset.id,
    taskList,
    revision: draftRevision,
    dimensions,
    datasetStatus,
    publishingStatus,
    canSubmit
  };
};
const action$3 = async ({
  context
}) => {
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const session2 = context.get(sessionContext);
  const {
    dataset: fetchedDataset
  } = context.get(datasetContext);
  const dataset = singleLangDataset(fetchedDataset, locale);
  const draftRevision = dataset.draft_revision;
  try {
    await api.submitForPublication(dataset.id, draftRevision.id);
    session2.flash("flashMessage", [`publish.tasklist.submit.success`]);
    redirect(localeUrl(`/publish/${dataset.id}/overview`, locale));
  } catch (err) {
    logger$2.error(err, `Failed to fetch the tasklist`);
    throw new NotFoundException();
  }
};
function Sidebar({
  isDeveloper,
  datasetId,
  publishingStatus
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "govuk-grid-column-one-third",
    children: /* @__PURE__ */ jsxs("ul", {
      className: "govuk-task-list border-top",
      children: [/* @__PURE__ */ jsx("li", {
        className: "govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-task-list__name-and-hint",
          children: /* @__PURE__ */ jsx(LocaleLink, {
            path: `/publish/${datasetId}/overview`,
            children: /* @__PURE__ */ jsx(T, {
              children: "publish.tasklist.overview"
            })
          })
        })
      }), /* @__PURE__ */ jsx("li", {
        className: "govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-task-list__name-and-hint",
          children: /* @__PURE__ */ jsx(LocaleLink, {
            path: `/publish/${datasetId}/cube-preview`,
            target: "_blank",
            children: /* @__PURE__ */ jsx(T, {
              children: "publish.tasklist.preview"
            })
          })
        })
      }), isDeveloper && /* @__PURE__ */ jsx("li", {
        className: "govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-task-list__name-and-hint",
          children: /* @__PURE__ */ jsx(LocaleLink, {
            path: `/developer/${datasetId}`,
            target: "_blank",
            children: /* @__PURE__ */ jsx(T, {
              children: "publish.tasklist.open_developer_view"
            })
          })
        })
      }), ["incomplete", "update_incomplete"].includes(publishingStatus) && /* @__PURE__ */ jsx("li", {
        className: "govuk-task-list__item govuk-task-list__item--with-link tasklist-no-border",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-task-list__name-and-hint",
          children: /* @__PURE__ */ jsx(LocaleLink, {
            path: `/publish/${datasetId}/delete`,
            children: /* @__PURE__ */ jsxs(T, {
              children: ["publish.tasklist.delete.", publishingStatus === "incomplete" ? "dataset" : "update"]
            })
          })
        })
      })]
    })
  });
}
function TasklistItem({
  id,
  describedBy,
  translationKey = "metadata",
  path: path2,
  status,
  datasetId,
  translation
}) {
  return /* @__PURE__ */ jsxs("li", {
    className: "govuk-task-list__item govuk-task-list__item--with-link",
    children: [/* @__PURE__ */ jsx("div", {
      className: "govuk-task-list__name-and-hint",
      children: /* @__PURE__ */ jsx(LocaleLink, {
        path: `/publish/${datasetId}/${path2 || id}`,
        "aria-describedby": describedBy,
        className: "govuk-link govuk-task-list__link",
        children: translation || /* @__PURE__ */ jsxs(T, {
          children: ["publish.tasklist.", translationKey, ".", id]
        })
      })
    }), /* @__PURE__ */ jsx(TasklistStatus, {
      status
    })]
  });
}
const tasklist = withComponentProps(function Tasklist({
  loaderData
}) {
  var _a;
  function getPath() {
    var _a2;
    if (((_a2 = loaderData.revision) == null ? void 0 : _a2.revision_index) === 0 && !loaderData.revision.data_table_id) {
      return "update-type";
    } else if (!loaderData.revision.data_table_id) {
      return "upload";
    } else {
      return "preview";
    }
  }
  return /* @__PURE__ */ jsxs(ErrorProvider, {
    children: [/* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-column-two-thirds",
        children: [/* @__PURE__ */ jsx("span", {
          className: "region-subhead",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.tasklist.subheading"
          })
        }), /* @__PURE__ */ jsx("h1", {
          className: "govuk-heading-xl govuk-!-margin-bottom-2",
          children: loaderData.datasetTitle
        })]
      })
    }), /* @__PURE__ */ jsx(DatasetStatus, {
      publishingStatus: loaderData.publishingStatus,
      datasetStatus: loaderData.datasetStatus
    }), /* @__PURE__ */ jsxs("div", {
      className: "govuk-grid-row",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-column-two-thirds",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "govuk-heading-l",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.tasklist.data.subheading"
          })
        }), /* @__PURE__ */ jsxs("ul", {
          className: "govuk-task-list",
          children: [/* @__PURE__ */ jsx(TasklistItem, {
            id: "datatable",
            translationKey: "data",
            path: getPath(),
            describedBy: "prepare-application-1-status",
            status: loaderData.taskList.datatable,
            datasetId: loaderData.datasetId
          }), loaderData.taskList.measure && /* @__PURE__ */ jsx(TasklistItem, {
            id: "measure",
            describedBy: "prepare-application-1-status",
            status: loaderData.taskList.measure.status,
            datasetId: loaderData.datasetId,
            translation: loaderData.taskList.measure.name
          }), (_a = loaderData.taskList.dimensions) == null ? void 0 : _a.map((dimension, index) => /* @__PURE__ */ jsx(TasklistItem, {
            id: "dimension",
            path: `dimension/${dimension.id}`,
            describedBy: "prepare-application-1-status",
            status: dimension.status,
            datasetId: loaderData.datasetId,
            translation: dimension.name
          }, index))]
        }), /* @__PURE__ */ jsx("h2", {
          className: "govuk-heading-l govuk-!-margin-top-5",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.tasklist.metadata.subheading"
          })
        }), /* @__PURE__ */ jsxs("ul", {
          className: "govuk-task-list",
          children: [/* @__PURE__ */ jsx(TasklistItem, {
            id: "title",
            describedBy: "prepare-application-3-status",
            status: loaderData.taskList.metadata.title,
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "summary",
            describedBy: "prepare-application-3-status",
            status: loaderData.taskList.metadata.summary,
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "data_collection",
            path: "collection",
            status: loaderData.taskList.metadata.collection,
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "statistical_quality",
            path: "quality",
            status: loaderData.taskList.metadata.quality,
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "data_sources",
            path: "providers",
            status: loaderData.taskList.metadata.sources,
            describedBy: "prepare-application-4-status",
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "related_reports",
            path: "related",
            status: loaderData.taskList.metadata.related,
            describedBy: "prepare-application-5-status",
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "update_frequency",
            path: "update-frequency",
            status: loaderData.taskList.metadata.frequency,
            describedBy: "prepare-application-5-status",
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "designation",
            status: loaderData.taskList.metadata.designation,
            describedBy: "prepare-application-5-status",
            datasetId: loaderData.datasetId
          }), /* @__PURE__ */ jsx(TasklistItem, {
            id: "relevant_topics",
            path: "topics",
            status: loaderData.taskList.metadata.topics,
            describedBy: "prepare-application-5-status",
            datasetId: loaderData.datasetId
          })]
        }), /* @__PURE__ */ jsx("h2", {
          className: "govuk-heading-l govuk-!-margin-top-5",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.tasklist.translation.subheading"
          })
        }), /* @__PURE__ */ jsxs("ul", {
          className: "govuk-task-list",
          children: [/* @__PURE__ */ jsxs("li", {
            className: "govuk-task-list__item govuk-task-list__item--with-link",
            children: [/* @__PURE__ */ jsx("div", {
              className: "govuk-task-list__name-and-hint",
              children: loaderData.taskList.translation.export === "cannot_start" ? /* @__PURE__ */ jsx("p", {
                className: "govkuk-body govuk-!-margin-0",
                children: /* @__PURE__ */ jsx(T, {
                  children: "publish.tasklist.translation.export"
                })
              }) : /* @__PURE__ */ jsx(LocaleLink, {
                path: `/publish/${loaderData.datasetId}/translation/export`,
                className: "govuk-link govuk-task-list__link",
                "aria-describedby": "prepare-application-5-status",
                children: /* @__PURE__ */ jsx(T, {
                  children: "publish.tasklist.translation.export"
                })
              })
            }), /* @__PURE__ */ jsx(TasklistStatus, {
              status: loaderData.taskList.translation.export
            })]
          }), /* @__PURE__ */ jsxs("li", {
            className: "govuk-task-list__item govuk-task-list__item--with-link",
            children: [/* @__PURE__ */ jsx("div", {
              className: "govuk-task-list__name-and-hint",
              children: loaderData.taskList.translation.import === "cannot_start" ? /* @__PURE__ */ jsx("p", {
                className: "govkuk-body govuk-!-margin-0",
                children: /* @__PURE__ */ jsx(T, {
                  children: "publish.tasklist.translation.import"
                })
              }) : /* @__PURE__ */ jsx(LocaleLink, {
                path: `/publish/${loaderData.datasetId}/translation/import`,
                className: "govuk-link govuk-task-list__link",
                "aria-describedby": "prepare-application-5-status",
                children: /* @__PURE__ */ jsx(T, {
                  children: "publish.tasklist.translation.import"
                })
              })
            }), /* @__PURE__ */ jsx(TasklistStatus, {
              status: loaderData.taskList.translation.import
            })]
          })]
        }), /* @__PURE__ */ jsx("h2", {
          className: "govuk-heading-l govuk-!-margin-top-5",
          children: /* @__PURE__ */ jsx(T, {
            children: "publish.tasklist.publishing.subheading"
          })
        }), /* @__PURE__ */ jsx("ul", {
          className: "govuk-task-list",
          children: /* @__PURE__ */ jsx(TasklistItem, {
            id: "when",
            datasetId: loaderData.datasetId,
            translation: `publish.tasklist.publishing.${loaderData.taskList.isUpdate ? "when_update" : "when"}`,
            path: "schedule",
            status: loaderData.taskList.publishing.when,
            describedBy: "prepare-application-5-status"
          })
        }), loaderData.canSubmit && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h2", {
            className: "govuk-heading-l govuk-!-margin-top-5",
            children: /* @__PURE__ */ jsx(T, {
              children: "publish.tasklist.submit.subheading"
            })
          }), /* @__PURE__ */ jsx(Form, {
            method: "post",
            children: /* @__PURE__ */ jsx("button", {
              type: "submit",
              className: "govuk-button",
              "data-module": "govuk-button",
              children: /* @__PURE__ */ jsx(T, {
                children: "publish.tasklist.submit.button"
              })
            })
          })]
        })]
      }), /* @__PURE__ */ jsx(Sidebar, {
        isDeveloper: loaderData.isDeveloper,
        datasetId: loaderData.datasetId,
        publishingStatus: loaderData.publishingStatus
      })]
    })]
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: tasklist,
  loader: loader$a,
  unstable_middleware: unstable_middleware$5
}, Symbol.toStringTag, { value: "Module" }));
var DuckDBSupportFileFormats = /* @__PURE__ */ ((DuckDBSupportFileFormats2) => {
  DuckDBSupportFileFormats2["csv"] = ".csv, text/csv";
  DuckDBSupportFileFormats2["parquet"] = ".parquet,application/vnd.apache.parquet, application/parquet";
  DuckDBSupportFileFormats2["json"] = ".json,application/json";
  DuckDBSupportFileFormats2["xlsx"] = ".xlsx, application/vnd.ms-excel,application, vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msexcel";
  DuckDBSupportFileFormats2["gz"] = ".gz, application/gzip";
  return DuckDBSupportFileFormats2;
})(DuckDBSupportFileFormats || {});
function fileMimeTypeHandler(mimetype, originalFileName) {
  let ext = "unknown";
  if (mimetype === "application/octet-stream") {
    ext = path.extname(originalFileName);
    switch (ext) {
      case ".parquet":
        return "application/vnd.apache.parquet";
      case ".json":
        return "application/json";
      case ".xls":
      case ".xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case ".csv":
        return "text/csv";
      default:
        throw new Error(`unsupported format ${ext}`);
    }
  } else if (mimetype === "application/x-gzip") {
    ext = originalFileName.split(".").reverse()[1];
    switch (ext) {
      case "json":
      case "csv":
        return "application/x-gzip";
      default:
        throw new Error(`unsupported format ${ext}`);
    }
  }
  return mimetype;
}
const unstable_middleware$4 = [fetchDatasetMiddleware(DatasetInclude.Data)];
const loader$9 = ({
  context
}) => {
  var _a;
  const {
    dataset
  } = context.get(datasetContext);
  const revisit = (((_a = dataset.dimensions) == null ? void 0 : _a.length) || 0) > 0;
  const supportedFormats = Object.values(DuckDBSupportFileFormats).map((format2) => format2.toLowerCase());
  return {
    revisit,
    supportedFormats: supportedFormats.join(", "),
    uploadType: false
  };
};
const action$2 = async ({
  context,
  request
}) => {
  var _a;
  logger$2.debug("User is uploading a fact table.");
  let errors = [];
  const {
    dataset
  } = context.get(datasetContext);
  const session2 = context.get(sessionContext);
  const api = context.get(publisherApi);
  const locale = getLocale(context);
  const sessionItem = session2.get(`dataset[${dataset.id}]`) || {
    updateType: void 0
  };
  const revision = dataset.draft_revision;
  const uploadHandler = async (fileUpload) => {
    if (fileUpload.fieldName === "csv") {
      const fileName = fileUpload.name;
      const mimeType = fileMimeTypeHandler(fileUpload.type, fileUpload.name);
      const fileData = new Blob([await fileUpload.arrayBuffer()], {
        type: mimeType
      });
      logger$2.debug("Sending file to backend");
      if (sessionItem.updateType) {
        logger$2.info("Performing an update to the dataset");
        await api.uploadCSVToUpdateDataset(dataset.id, revision.id, fileData, fileName, sessionItem.updateType);
      } else {
        await api.uploadDataToDataset(dataset.id, fileData, fileName);
      }
      session2.set(`dataset[${dataset.id}]`, void 0);
    } else {
      logger$2.error("No file is present in the request");
      errors.push({
        field: "csv",
        message: {
          key: "publish.upload.errors.missing"
        }
      });
      throw new Error();
    }
  };
  try {
    await parseFormData(request, uploadHandler);
  } catch (err) {
    logger$2.error(err, `There was a problem uploading the file`);
    if (err instanceof ApiException) {
      let body = {
        status: err.status || 500,
        dataset_id: dataset.id,
        errors: [{
          field: "csv",
          message: {
            key: "errors.fact_table_validation.unknown_error"
          }
        }]
      };
      try {
        body = JSON.parse(((_a = err.body) == null ? void 0 : _a.toString()) || "{}");
      } catch (parseError) {
        logger$2.error(parseError, "Failed to parse error body as JSON");
      }
      errors = body.errors || [{
        field: "csv",
        message: {
          key: "errors.fact_table_validation.unknown_error"
        }
      }];
    } else {
      errors = errors.length ? errors : [{
        field: "csv",
        message: {
          key: "errors.fact_table_validation.unknown_error"
        }
      }];
    }
  }
  if (errors.length) {
    return {
      errors
    };
  }
  throw redirect(localeUrl(`/publish/${dataset.id}/preview`, locale));
};
const uploadDataset = withComponentProps(function UploadDataset({
  loaderData,
  actionData
}) {
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxs(ErrorProvider, {
    errors: actionData == null ? void 0 : actionData.errors,
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: t("publish.upload.title")
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsxs(Form, {
      method: "POST",
      encType: "multipart/form-data",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "govuk-form-group",
        children: [/* @__PURE__ */ jsx("label", {
          className: "govuk-label govuk-label--m",
          htmlFor: "csv",
          children: t("publish.upload.form.file.label")
        }), /* @__PURE__ */ jsx("input", {
          className: "govuk-file-upload",
          id: "csv",
          name: "csv",
          type: "file",
          placeholder: "Upload file",
          accept: loaderData.supportedFormats
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "govuk-button-group",
        children: /* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "govuk-button",
          "data-module": "govuk-button",
          style: {
            verticalAlign: "unset"
          },
          "data-prevent-double-click": "true",
          children: t("publish.upload.buttons.upload")
        })
      })]
    })]
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: uploadDataset,
  loader: loader$9,
  unstable_middleware: unstable_middleware$4
}, Symbol.toStringTag, { value: "Module" }));
function Select({
  label,
  className,
  labelStyle,
  name,
  hint,
  options,
  inline,
  value,
  labelClassName
}) {
  return /* @__PURE__ */ jsxs("div", { className: clsx("govuk-form-group", { "govuk-form-group--inline": inline }, className), children: [
    label && /* @__PURE__ */ jsxs(
      "label",
      {
        className: clsx("govuk-label", labelClassName),
        htmlFor: name,
        style: labelStyle || (inline ? { display: "inline-block" } : void 0),
        children: [
          label,
          inline ? ":" : null
        ]
      }
    ),
    hint && /* @__PURE__ */ jsx("div", { className: "govuk-hint", id: `${name}-hint`, children: hint }),
    inline ? " " : null,
    /* @__PURE__ */ jsx(
      "select",
      {
        className: "govuk-select",
        id: name,
        name,
        "aria-describedby": hint ? `${name}-hint` : void 0,
        defaultValue: value,
        children: options.map((opt, index) => /* @__PURE__ */ jsx(
          "option",
          {
            value: typeof opt === "object" ? opt.value : opt,
            disabled: typeof opt === "object" && opt.disabled,
            children: typeof opt === "object" ? opt.label : opt
          },
          index
        ))
      }
    )
  ] });
}
var SourceType = /* @__PURE__ */ ((SourceType2) => {
  SourceType2["Unknown"] = "unknown";
  SourceType2["Dimension"] = "dimension";
  SourceType2["Measure"] = "measure";
  SourceType2["DataValues"] = "data_values";
  SourceType2["NoteCodes"] = "note_codes";
  SourceType2["Ignore"] = "ignore";
  SourceType2["LineNumber"] = "line_number";
  return SourceType2;
})(SourceType || {});
class UnknownException extends Error {
  constructor(message = "Server Error", status = 500) {
    super(message);
    this.message = message;
    this.status = status;
    this.name = "UnknownException";
    this.status = status;
  }
}
const unstable_middleware$3 = [fetchDatasetMiddleware(DatasetInclude.Data)];
const loader$8 = async ({
  context,
  request
}) => {
  var _a;
  const {
    dataset
  } = context.get(datasetContext);
  const api = context.get(publisherApi);
  const revision = dataset.draft_revision;
  const dataTable = revision == null ? void 0 : revision.data_table;
  const hasUnknownColumns = (_a = dataset.fact_table) == null ? void 0 : _a.some((col) => col.type === "unknown");
  const isUpdate = Boolean(revision == null ? void 0 : revision.previous_revision_id);
  const revisit = !isUpdate && !hasUnknownColumns;
  const query = new URL(request.url).searchParams;
  let errors;
  let previewData;
  let ignoredCount = 0;
  let pagination = [];
  if (!dataset || !revision || !dataTable) {
    logger$2.error("Fact table not found");
    throw new UnknownException("errors.preview.import_missing");
  }
  try {
    const pageNumber = Number.parseInt(query.get("page_number"), 10) || 1;
    const pageSize = Number.parseInt(query.get("page_size"), 10) || 10;
    previewData = await api.getImportPreview(dataset.id, revision.id, pageNumber, pageSize);
    ignoredCount = previewData.headers.filter((header) => header.source_type === SourceType.Ignore).length;
    if (!previewData) {
      throw new Error("No preview data found.");
    }
    pagination = generateSequenceForNumber(previewData.current_page, previewData.total_pages);
  } catch (_err) {
    errors = [{
      field: "preview",
      message: {
        key: "errors.preview.failed_to_get_preview"
      }
    }];
  }
  return {
    ...previewData,
    ignoredCount,
    pagination,
    revisit,
    errors
  };
};
const actionChooserSchema = z.object({
  actionChooser: z.enum(["replace-table", "replace-sources"]).nonoptional()
});
const confirmSchema = z.object({
  confirm: z.coerce.boolean()
});
const action$1 = async ({
  context,
  request
}) => {
  var _a;
  const {
    dataset
  } = context.get(datasetContext);
  const locale = getLocale(context);
  const api = context.get(publisherApi);
  const session2 = context.get(sessionContext);
  const fromSession = session2.get(`dataset[${dataset.id}]`) || {
    updateType: void 0
  };
  logger$2.debug(`User is confirming the fact table upload and source_type = ${fromSession.updateType}`);
  const revision = dataset.draft_revision;
  const isUpdate = Boolean(revision == null ? void 0 : revision.previous_revision_id);
  const hasUnknownColumns = (_a = dataset.fact_table) == null ? void 0 : _a.some((col) => col.type === "unknown");
  const revisit = !isUpdate && !hasUnknownColumns;
  const formData = Object.fromEntries(await request.formData());
  let errors;
  if (revisit) {
    const result = actionChooserSchema.safeParse(formData);
    if (result.success) {
      switch (result.data.actionChooser) {
        case "replace-table":
          throw redirect(localeUrl(`/publish/${dataset.id}/upload`, locale));
        case "replace-sources":
          throw redirect(localeUrl(`/publish/${dataset.id}/sources`, locale));
      }
    } else {
      errors = [{
        field: "actionChooserTable",
        message: {
          key: "errors.preview.select_action"
        }
      }];
    }
  } else {
    const result = confirmSchema.safeParse(formData);
    if (result.success && result.data.confirm) {
      if ((revision == null ? void 0 : revision.revision_index) === 0) {
        redirect(localeUrl(`/publish/${dataset.id}/tasklist`, locale));
      } else {
        try {
          await api.confirmDataTable(dataset.id, revision.id);
        } catch {
          errors = [{
            field: "confirm",
            message: {
              key: "errors.preview.confirm_error"
            }
          }];
        }
        if (errors == null ? void 0 : errors.length) {
          return {
            errors
          };
        }
        throw redirect(localeUrl(`/publish/${dataset.id}/sources`, locale));
      }
    } else if ((revision == null ? void 0 : revision.revision_index) === 0) {
      redirect(localeUrl(`/publish/${dataset.id}/update-type`, locale));
    } else {
      redirect(localeUrl(`/publish/${dataset.id}/upload`, locale));
    }
    return;
  }
};
const preview = withComponentProps(function Preview({
  loaderData
}) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const {
    i18n
  } = useTranslation();
  const returnLink = loaderData.revisit && ((_a = loaderData.dataset) == null ? void 0 : _a.id) && localeUrl(`/publish/${(_b = loaderData.dataset) == null ? void 0 : _b.id}/tasklist`, i18n.language);
  loaderData.revisit && returnLink;
  const colgroup = /* @__PURE__ */ jsx(Fragment, {
    children: (_c = loaderData.headers) == null ? void 0 : _c.map((header, index) => /* @__PURE__ */ jsx("col", {
      className: header.source_type === "ignore" ? "ignore-column" : ""
    }, index))
  });
  const columns = (_d = loaderData.headers) == null ? void 0 : _d.map((header, index) => {
    return {
      key: index,
      label: header.source_type === SourceType.LineNumber ? /* @__PURE__ */ jsx("span", {
        className: "govuk-visually-hidden",
        children: /* @__PURE__ */ jsx(T, {
          children: "publish.preview.row_number"
        })
      }) : (() => {
        const type = header.source_type && header.source_type !== SourceType.Unknown ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("span", {
            className: "region-subhead",
            children: /* @__PURE__ */ jsxs(T, {
              children: ["publish.preview.source_type.", header.source_type]
            })
          }), /* @__PURE__ */ jsx("br", {})]
        }) : null;
        return /* @__PURE__ */ jsxs("div", {
          children: [type, /* @__PURE__ */ jsx("span", {
            children: header.name || /* @__PURE__ */ jsx(T, {
              colNum: index + 1,
              children: "publish.preview.unnamed_column"
            })
          })]
        });
      })(),
      cellClassNameName: header.source_type
    };
  });
  return /* @__PURE__ */ jsxs(ErrorProvider, {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: /* @__PURE__ */ jsx(T, {
        children: loaderData.revisit ? "publish.preview.heading_summary" : "publish.preview.heading"
      })
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsxs("div", {
      className: "govuk-grid-row",
      children: [/* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-one-half",
        style: {
          paddingTop: "7px"
        },
        children: /* @__PURE__ */ jsx("p", {
          className: "govuk-body",
          children: loaderData.revisit ? /* @__PURE__ */ jsx(T, {
            cols: (((_e = loaderData.headers) == null ? void 0 : _e.length) || 0) - loaderData.ignoredCount,
            rows: (_f = loaderData.page_info) == null ? void 0 : _f.total_records,
            ignored: loaderData.ignoredCount,
            children: "publish.preview.upload_summary"
          }) : /* @__PURE__ */ jsx(T, {
            cols: ((_g = loaderData.headers) == null ? void 0 : _g.length) || 0,
            rows: (_h = loaderData.page_info) == null ? void 0 : _h.total_records,
            children: "publish.preview.preview_summary"
          })
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-one-half",
        style: {
          textAlign: "right"
        },
        children: /* @__PURE__ */ jsxs(Form, {
          role: "page-size",
          className: "govuk-!-margin-bottom-0",
          children: [/* @__PURE__ */ jsx(Select, {
            name: "page_size",
            label: /* @__PURE__ */ jsx(T, {
              children: "pagination.page_size"
            }),
            options: [5, 10, 25, 50, 100, 250, 500],
            value: loaderData.page_size ? String(loaderData.page_size) : void 0,
            inline: true
          }), " ", /* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "file",
            value: loaderData.datafile_id
          }), /* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "page_number",
            value: "1"
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            className: "govuk-button govuk-button-small govuk-!-display-inline",
            "data-module": "govuk-button",
            children: /* @__PURE__ */ jsx(T, {
              children: "pagination.update"
            })
          })]
        })
      })]
    }), loaderData.data && /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx("div", {
        className: "govuk-grid-row",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-full with-overflow",
          children: /* @__PURE__ */ jsx(Table, {
            isSticky: true,
            columns,
            rows: loaderData.data,
            colgroup
          })
        })
      }), /* @__PURE__ */ jsx(Pagination, {
        total_pages: loaderData.total_pages,
        current_page: loaderData.current_page,
        page_size: loaderData.page_size,
        pagination: loaderData.pagination,
        page_info: loaderData.page_info
      }), loaderData.revisit ? /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-row",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-full",
          children: /* @__PURE__ */ jsxs("form", {
            method: "post",
            role: "continue",
            children: [/* @__PURE__ */ jsx(RadioGroup, {
              name: "actionChooser",
              label: /* @__PURE__ */ jsx(T, {
                children: "publish.preview.revisit_question"
              }),
              options: [{
                value: "replace-table",
                label: /* @__PURE__ */ jsx(T, {
                  children: "publish.preview.upload_different"
                }),
                hint: /* @__PURE__ */ jsx(T, {
                  children: "publish.preview.upload_different_hint"
                })
              }, {
                value: "replace-sources",
                label: /* @__PURE__ */ jsx(T, {
                  children: "publish.preview.change_source"
                }),
                hint: /* @__PURE__ */ jsx(T, {
                  children: "publish.preview.change_source_hint"
                })
              }]
            }), /* @__PURE__ */ jsx("div", {
              className: "govuk-button-group",
              children: /* @__PURE__ */ jsx("button", {
                type: "submit",
                name: "confirm",
                value: "true",
                className: "govuk-button",
                "data-module": "govuk-button",
                style: {
                  verticalAlign: "unset"
                },
                "data-prevent-double-click": "true",
                children: /* @__PURE__ */ jsx(T, {
                  children: "buttons.continue"
                })
              })
            })]
          })
        })
      }) : /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-row",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-full",
          children: /* @__PURE__ */ jsx("form", {
            method: "post",
            role: "continue",
            children: /* @__PURE__ */ jsxs("fieldset", {
              className: "govuk-fieldset",
              children: [/* @__PURE__ */ jsx("legend", {
                className: "govuk-fieldset__legend govuk-fieldset__legend--m",
                children: /* @__PURE__ */ jsx("h2", {
                  className: "govuk-fieldset__heading",
                  children: /* @__PURE__ */ jsx(T, {
                    children: "publish.preview.confirm_correct"
                  })
                })
              }), /* @__PURE__ */ jsx("div", {
                className: "govuk-button-group",
                children: /* @__PURE__ */ jsx("button", {
                  type: "submit",
                  name: "confirm",
                  value: "true",
                  className: "govuk-button",
                  "data-module": "govuk-button",
                  style: {
                    verticalAlign: "unset"
                  },
                  "data-prevent-double-click": "true",
                  children: /* @__PURE__ */ jsx(T, {
                    children: "buttons.continue"
                  })
                })
              })]
            })
          })
        })
      })]
    })]
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: preview,
  loader: loader$8,
  unstable_middleware: unstable_middleware$3
}, Symbol.toStringTag, { value: "Module" }));
const unstable_middleware$2 = [fetchDatasetMiddleware(DatasetInclude.Data)];
const loader$7 = async ({
  context
}) => {
  var _a;
  const {
    dataset
  } = context.get(datasetContext);
  const revision = dataset.draft_revision;
  const factTable = (_a = dataset.fact_table) == null ? void 0 : _a.sort((colA, colB) => colA.index - colB.index);
  const revisit = factTable.filter((column) => column.type === SourceType.Unknown).length === 0;
  if (!dataset || !revision || !factTable) {
    logger$2.error("Fact table not found");
    throw new UnknownException("errors.preview.import_missing");
  }
  return {
    dataset,
    factTable,
    sourceTypes: Object.values(SourceType).filter((s) => s !== SourceType.LineNumber),
    revisit
  };
};
const sourceTypeSchema = z.enum(SourceType).nonoptional();
const action = async ({
  context,
  request
}) => {
  var _a;
  logger$2.debug("Validating the source definition");
  const api = context.get(publisherApi);
  const {
    dataset
  } = context.get(datasetContext);
  const locale = getLocale(context);
  dataset.draft_revision;
  const factTable = (_a = dataset.fact_table) == null ? void 0 : _a.sort((colA, colB) => colA.index - colB.index);
  let error;
  let errors;
  const formData = Object.fromEntries(await request.formData());
  const counts = {
    unknown: 0,
    dataValues: 0,
    footnotes: 0,
    measure: 0
  };
  const sourceAssignment = factTable.map((column) => {
    const result = sourceTypeSchema.safeParse(formData[`column-${column.index}`]);
    if (result.error) {
      counts.unknown++;
    } else {
      if (result.data === SourceType.Unknown) counts.unknown++;
      if (result.data === SourceType.DataValues) counts.dataValues++;
      if (result.data === SourceType.NoteCodes) counts.footnotes++;
      if (result.data === SourceType.Measure) counts.measure++;
    }
    return {
      column_index: column.index,
      column_name: column.name,
      column_type: result.data
    };
  });
  factTable.forEach((column) => {
    var _a2;
    column.type = ((_a2 = sourceAssignment.find((assignment) => assignment.column_index === column.index)) == null ? void 0 : _a2.column_type) || SourceType.Unknown;
  });
  if (counts.unknown > 0) {
    logger$2.error("User failed to identify all sources");
    error = {
      field: "source",
      message: {
        key: "errors.sources.unknowns_found"
      }
    };
  }
  if (counts.footnotes === 0) {
    logger$2.error("User failed to identify the mandated footnotes column");
    error = {
      field: "source",
      message: {
        key: "errors.sources.no_notes_column"
      }
    };
  }
  if (counts.dataValues > 1) {
    logger$2.error("User tried to specify multiple data value sources");
    error = {
      field: "source",
      message: {
        key: "errors.sources.multiple_datavalues"
      }
    };
  }
  if (counts.footnotes > 1) {
    logger$2.error("User tried to specify multiple footnote sources");
    error = {
      field: "source",
      message: {
        key: "errors.sources.multiple_footnotes"
      }
    };
  }
  if (counts.measure > 1) {
    logger$2.error("User tried to specify multiple measure sources");
    error = {
      field: "source",
      message: {
        key: "errors.sources.multiple_measures"
      }
    };
  }
  let viewErr = null;
  if (error) {
    logger$2.error("There were errors validating the fact table");
    errors = [error];
  } else {
    logger$2.debug("Sending request to the backend.");
    try {
      await api.assignSources(dataset.id, sourceAssignment);
    } catch (err) {
      const error2 = err;
      viewErr = JSON.parse(error2.body || "{}");
      if (viewErr.errors) {
        errors = viewErr.errors;
      } else {
        errors = [{
          field: "source",
          message: {
            key: "errors.sources.assign_failed"
          }
        }];
      }
      logger$2.error(err, `There was a problem assigning source types`);
    }
  }
  if (errors == null ? void 0 : errors.length) {
    return {
      errors,
      viewErr
    };
  }
  throw redirect(localeUrl(`/publish/${dataset.id}/tasklist`, locale));
};
const sources = withComponentProps(function Sources({
  loaderData,
  actionData
}) {
  var _a, _b, _c;
  const {
    i18n
  } = useTranslation();
  loaderData.revisit && loaderData.dataset.id && localeUrl(`/publish/${loaderData.dataset.id}/tasklist`, i18n.language);
  if (((_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a[0].message.key) === "errors.fact_table_validation.incomplete_fact") ;
  if (((_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b[0].message.key) === "errors.fact_table_validation.duplicate_fact") ;
  if (((_c = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c[0].message.key) === "errors.fact_table_validation.bad_note_codes") ;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: /* @__PURE__ */ jsx(T, {
        children: "publish.sources.heading"
      })
    }), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "source-list",
        style: {
          marginBottom: "2em"
        },
        children: loaderData.factTable.map((source, idx) => /* @__PURE__ */ jsx("div", {
          className: "source-list-item",
          style: {
            borderBottom: "1px solid #0b0c0c",
            paddingBottom: "0.5em",
            marginBottom: "0.5em"
          },
          children: /* @__PURE__ */ jsx("div", {
            className: "govuk-grid-row",
            children: /* @__PURE__ */ jsx("div", {
              className: "govuk-grid-column-full",
              children: /* @__PURE__ */ jsx(Select, {
                name: `column-${source.index}`,
                className: "govuk-!-display-inline",
                label: source.name || /* @__PURE__ */ jsx(T, {
                  colNum: idx + 1,
                  children: "publish.preview.unnamed_column"
                }),
                labelClassName: "govuk-label--s",
                labelStyle: {
                  minWidth: "30%",
                  display: "inline-block"
                },
                options: loaderData.sourceTypes.map((val) => ({
                  value: val,
                  label: /* @__PURE__ */ jsxs(T, {
                    children: ["publish.sources.types.", val]
                  })
                })),
                value: source.type
              })
            })
          })
        }, idx))
      }), /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-row",
        children: /* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-full",
          children: /* @__PURE__ */ jsx("p", {
            className: "govuk-body",
            children: /* @__PURE__ */ jsx("button", {
              type: "submit",
              className: "govuk-button",
              "data-module": "govuk-button",
              children: /* @__PURE__ */ jsx(T, {
                children: "buttons.continue"
              })
            })
          })
        })
      })]
    })]
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: sources,
  loader: loader$7,
  unstable_middleware: unstable_middleware$2
}, Symbol.toStringTag, { value: "Module" }));
class ForbiddenException extends Error {
  constructor(message = "Permission Denied", status = 403) {
    super(message);
    this.message = message;
    this.status = status;
    this.name = "ForbiddenException";
    this.status = status;
  }
}
const ensureAdmin$1 = ({ context }) => {
  logger$2.debug(`checking if user is a service admin...`);
  const { isAdmin } = context.get(authContext);
  if (!isAdmin) {
    throw new ForbiddenException("user is not a service admin");
  }
  logger$2.info(`user is a service admin`);
};
const noCache = async (_, next) => {
  const res = await next();
  res.headers.set("Cache-Control", "no-cache, must-revalidate, proxy-revalidate");
  return res;
};
const unstable_middleware$1 = [ensureAdmin$1, noCache];
const ensureAdmin = withComponentProps(Outlet);
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ensureAdmin,
  unstable_middleware: unstable_middleware$1
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({
  request,
  context
}) => {
  const api = context.get(publisherApi);
  const session2 = context.get(sessionContext);
  const flash = session2.get("flash");
  const query = new URL(request.url).searchParams;
  const page = parseInt(query.get("page_number"), 10) || 1;
  const limit = parseInt(query.get("page_size"), 10) || 10;
  try {
    const {
      data: data2,
      count
    } = await api.listUserGroups(page, limit);
    const pagination = getPaginationProps(page, limit, count);
    return {
      groups: data2,
      pagination,
      flash
    };
  } catch (err) {
    console.log(err);
  }
};
const list$1 = withComponentProps(function UserGroupList({
  loaderData
}) {
  const columns = [{
    key: "name",
    format: (value, row) => /* @__PURE__ */ jsx(LocaleLink, {
      path: `/admin/group/${row.id}`,
      className: "govuk-link",
      children: value
    })
  }, "email", "user_count", "dataset_count"];
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(FlashMessages, {}), /* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: /* @__PURE__ */ jsx(T, {
        children: "admin.group.list.heading"
      })
    }), /* @__PURE__ */ jsx(LocaleLink, {
      path: "/admin/group/create",
      className: "govuk-button",
      children: /* @__PURE__ */ jsx(T, {
        children: "admin.group.list.buttons.add"
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-full",
        children: (loaderData == null ? void 0 : loaderData.groups) && (loaderData == null ? void 0 : loaderData.groups.length) > 0 && /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(Table, {
            i18nBase: "admin.group.list.table",
            columns,
            rows: loaderData.groups
          }), loaderData.pagination.total_pages > 1 && /* @__PURE__ */ jsx(Pagination, {
            ...loaderData.pagination
          })]
        })
      })
    })]
  });
});
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: list$1,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({
  context,
  request
}) => {
  const api = context.get(publisherApi);
  const query = new URL(request.url).searchParams;
  try {
    const page = parseInt(query.get("page_number"), 10) || 1;
    const limit = parseInt(query.get("page_size"), 10) || 10;
    const {
      data: data2,
      count
    } = await api.listUsers(page, limit);
    const pagination = getPaginationProps(page, limit, count);
    return {
      users: data2,
      count,
      pagination
    };
  } catch (err) {
    return {
      errors: [err]
    };
  }
};
const list = withComponentProps(function UserList({
  loaderData
}) {
  const columns = [{
    key: "full_name",
    label: /* @__PURE__ */ jsx(T, {
      children: "admin.user.list.table.name"
    }),
    format: (value, row) => /* @__PURE__ */ jsx(LocaleLink, {
      path: `/admin/user/${row.id}`,
      className: "govuk-link",
      children: value || row.email
    })
  }, {
    key: "groups",
    format: (value) => (value == null ? void 0 : value.length) || 0
  }, {
    key: "last_login_at",
    label: /* @__PURE__ */ jsx(T, {
      children: "admin.user.list.table.login"
    }),
    format: (value) => value ? dateFormat(value, "d MMMM yyyy h:mm a") : /* @__PURE__ */ jsx(T, {
      children: "admin.user.view.login_never"
    })
  }, {
    key: "status",
    format: (value) => /* @__PURE__ */ jsx("strong", {
      className: `govuk-tag govuk-tag--${statusToColour(value)}`,
      children: /* @__PURE__ */ jsxs(T, {
        children: ["admin.user.badge.status.", value]
      })
    })
  }];
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(FlashMessages, {}), /* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: /* @__PURE__ */ jsx(T, {
        children: "admin.user.list.heading"
      })
    }), /* @__PURE__ */ jsx(LocaleLink, {
      path: `/admin/user/create`,
      className: "govuk-button",
      children: /* @__PURE__ */ jsx(T, {
        children: "admin.user.list.buttons.add"
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-row",
      children: /* @__PURE__ */ jsx("div", {
        className: "govuk-grid-column-full",
        children: (loaderData == null ? void 0 : loaderData.users) && (loaderData == null ? void 0 : loaderData.users.length) > 0 && /* @__PURE__ */ jsx(Table, {
          i18nBase: "admin.user.list.table",
          columns,
          rows: loaderData.users
        })
      })
    })]
  });
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: list,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const baseDocsPath = path.resolve(
  process.env.NODE_ENV === "production" ? "~/../build/client/docs" : "~/../public/docs"
);
async function getContents(locale, directory) {
  const docsPath = path.join(baseDocsPath, directory);
  let fullDocsPath = path.join(docsPath, "en");
  for (const dir of fs.readdirSync(docsPath)) {
    if (dir === locale.split("-")[0].toLowerCase()) {
      fullDocsPath = path.join(docsPath, dir);
      break;
    }
  }
  const fileList = fs.readdirSync(fullDocsPath);
  return Promise.all(
    fileList.map(async (file) => {
      const title2 = await getTitle(path.join(fullDocsPath, file));
      const filename = path.parse(file).name;
      return {
        title: title2,
        filename
      };
    })
  );
}
async function getDoc(filename, directory, locale) {
  const docsPath = path.join(baseDocsPath, directory);
  let fullDocsPath = path.join(docsPath, "en");
  for (const dir of fs.readdirSync(docsPath)) {
    if (dir === locale.split("-")[0].toLowerCase()) {
      fullDocsPath = path.join(docsPath, dir);
      break;
    }
  }
  const requestedFilePath = path.join(fullDocsPath, `${filename}.md`);
  const normalizedFilePath = path.resolve(requestedFilePath);
  if (!fs.existsSync(normalizedFilePath)) {
    logger$2.error(`File does not exist in ${directory}: ${filename}`);
    throw new NotFoundException();
  }
  await getTitle(normalizedFilePath);
  const markdownFile = fs.readFileSync(normalizedFilePath, "utf8");
  logger$2.debug("Generating html from markdown");
  return markdownFile;
}
async function getTitle(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on("line", (line2) => {
      if (line2.startsWith("#")) {
        reader.close();
        resolve(line2);
      }
    });
  });
  readable.close();
  return line.split("#")[1].trim();
}
function createToc(mdText) {
  const result = [];
  const stack = [];
  for (const item of marked.lexer(mdText).filter((x) => x.type === "heading")) {
    const newItem = { text: item.text, depth: item.depth, children: [] };
    while (stack.length > 0 && newItem.depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      result.push(newItem);
    } else {
      const parent = stack[stack.length - 1];
      parent.children.push(newItem);
    }
    stack.push(newItem);
  }
  return result;
}
const loader$4 = async ({
  context
}) => {
  const locale = getLocale(context);
  const contents2 = await getContents(locale, "guidance");
  return {
    contents: contents2
  };
};
const contents = withComponentProps(function Guidance({
  loaderData
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "govuk-grid-row",
    children: /* @__PURE__ */ jsxs("div", {
      className: "govuk-grid-column-two-thirds",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "govuk-heading-xl",
        children: /* @__PURE__ */ jsx(T, {
          children: "guidance.title"
        })
      }), /* @__PURE__ */ jsx("ul", {
        className: "govuk-list govuk-list--bullet",
        children: loaderData.contents.map(({
          title: title2,
          filename
        }, index) => /* @__PURE__ */ jsx("li", {
          children: /* @__PURE__ */ jsx(LocaleLink, {
            path: `/guidance/${filename}`,
            children: title2
          })
        }, index))
      })]
    })
  });
});
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: contents,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function RenderList({ nodes }) {
  return /* @__PURE__ */ jsx("ul", { className: "govuk-list govuk-list--bullet govuk-!-margin-bottom-0", children: nodes.map((node, index) => /* @__PURE__ */ jsxs("li", { children: [
    /* @__PURE__ */ jsx(Link, { to: `#${node.text.replaceAll(".", "").replaceAll(" ", "-").toLowerCase()}`, children: node.text }),
    node.children.length > 0 && node.depth < 3 && /* @__PURE__ */ jsx(RenderList, { nodes: node.children })
  ] }, index)) });
}
const MarkdownDocument = ({ doc: doc2, toc }) => {
  return /* @__PURE__ */ jsxs("div", { className: "govuk-grid-row", children: [
    /* @__PURE__ */ jsx("div", { className: "govuk-grid-column-two-thirds", children: /* @__PURE__ */ jsx(
      Markdown,
      {
        options: {
          overrides: {
            h1: {
              props: {
                className: "govuk-heading-xl"
              }
            },
            h2: {
              props: {
                className: "govuk-heading-l"
              }
            },
            h3: {
              props: {
                className: "govuk-heading-m"
              }
            },
            h4: {
              props: {
                className: "govuk-heading-s"
              }
            },
            h5: {
              props: {
                className: "govuk-heading-xs"
              }
            },
            p: {
              props: {
                className: "govuk-body"
              }
            },
            ol: {
              props: {
                className: "govuk-list govuk-list--number"
              }
            },
            ul: {
              props: {
                className: "govuk-list govuk-list--bullet"
              }
            },
            table: {
              component: ({ children }) => {
                return /* @__PURE__ */ jsx("div", { className: "govuk-table__container", children: /* @__PURE__ */ jsx("table", { className: "govuk-table", children }) });
              }
            },
            th: {
              props: {
                className: "govuk-table__header"
              }
            },
            td: {
              props: {
                className: "govuk-table__cell"
              }
            },
            a: {
              props: {
                className: "govuk-link"
              }
            }
          }
        },
        children: doc2
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { style: { position: "sticky", top: "10px" }, className: "govuk-grid-column-one-third", children: [
      /* @__PURE__ */ jsx("h2", { className: "govuk-heading-s", children: /* @__PURE__ */ jsx(T, { children: "toc" }) }),
      /* @__PURE__ */ jsx(RenderList, { nodes: toc })
    ] })
  ] });
};
const loader$3 = async ({
  context,
  params
}) => {
  const locale = getLocale(context);
  const doc2 = await getDoc(params.doc, "guidance", locale);
  const toc = createToc(doc2);
  return {
    doc: doc2,
    toc
  };
};
const doc = withComponentProps(function Doc({
  loaderData
}) {
  return /* @__PURE__ */ jsx(MarkdownDocument, {
    toc: loaderData.toc,
    doc: loaderData.doc
  });
});
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: doc,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({
  context
}) => {
  const locale = getLocale(context);
  const doc2 = await getDoc("cookie-statement", "cookies", locale);
  const toc = createToc(doc2);
  return {
    doc: doc2,
    toc
  };
};
const cookies = withComponentProps(function Cookies({
  loaderData
}) {
  return /* @__PURE__ */ jsx(MarkdownDocument, {
    toc: loaderData.toc,
    doc: loaderData.doc
  });
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cookies,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const ConsumerNav = () => {
  return /* @__PURE__ */ jsx("nav", { className: "primary js-primary-nav", "aria-label": "Primary Navigation", children: /* @__PURE__ */ jsx("div", { className: "govuk-width-container nav__toggle", children: /* @__PURE__ */ jsx(LocaleLink, { path: "/published", children: /* @__PURE__ */ jsx("div", { className: "statsWales-logo", role: "img", "aria-label": "StatsWales logo" }) }) }) });
};
const consumer = withComponentProps(function Layout2() {
  const {
    t
  } = useTranslation();
  const links2 = ["contact_us", "accessibility", "copyright_statement", "cookies", "privacy", "terms_conditions", "modern_slavery"];
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(ConsumerNav, {}), /* @__PURE__ */ jsx("hr", {
      className: "govuk-section-break govuk-section-break--l govuk-!-margin-bottom-0 govuk-section-break--visible"
    }), /* @__PURE__ */ jsx("main", {
      className: "govuk-main-wrapper govuk-!-padding-top-0",
      id: "main-content",
      role: "main",
      children: /* @__PURE__ */ jsxs("div", {
        className: "govuk-width-container",
        children: [/* @__PURE__ */ jsx(FlashMessages, {}), /* @__PURE__ */ jsx(ErrorHandler, {}), /* @__PURE__ */ jsx(Outlet, {})]
      })
    }), /* @__PURE__ */ jsx("footer", {
      className: "wg-footer",
      children: /* @__PURE__ */ jsxs("div", {
        className: "govuk-width-container govuk-!-padding-top-9",
        children: [/* @__PURE__ */ jsx("ul", {
          className: "footer-menu govuk-list",
          children: links2.map((link, index) => /* @__PURE__ */ jsx("li", {
            className: "govuk-footer__inline-list-item",
            children: /* @__PURE__ */ jsx("a", {
              className: "govuk-footer__link",
              href: "#",
              children: t(`footer.${link}`)
            })
          }, index))
        }), /* @__PURE__ */ jsx("div", {
          className: "wg-footer-logo"
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("br", {})]
        })]
      })
    })]
  });
});
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: consumer
}, Symbol.toStringTag, { value: "Module" }));
function ViewTable(props) {
  const { t } = useTranslation();
  const columns = props.headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value) => col.source_type === "line_number" ? /* @__PURE__ */ jsx("span", { className: "linespan", children: value }) : col.name === t("consumer_view.start_data") || col.name === t("consumer_view.end_data") ? dateFormat(parseISO(value.split("T")[0]), "do MMMM yyyy") : value,
    className: col.source_type === "line_number" ? "line-number" : "",
    cellClassName: col.source_type === "line_number" ? "line-number" : ""
  }));
  return /* @__PURE__ */ jsx(Table, { isSticky: true, columns, rows: props.data });
}
function About({ about }) {
  var _a;
  return /* @__PURE__ */ jsxs("div", { className: "dataset-about", children: [
    /* @__PURE__ */ jsx("h2", { className: "govuk-heading-m", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.overview" }) }),
    /* @__PURE__ */ jsxs("dl", { className: "govuk-summary-list", children: [
      /* @__PURE__ */ jsxs("div", { id: "summary", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.summary" }) }),
        /* @__PURE__ */ jsx(
          "dd",
          {
            className: "govuk-summary-list__value",
            dangerouslySetInnerHTML: {
              __html: about.summary || /* @__PURE__ */ jsx(T, { children: "dataset_view.not_entered" })
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "data-collection", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.data_collection" }) }),
        /* @__PURE__ */ jsx(
          "dd",
          {
            className: "govuk-summary-list__value",
            dangerouslySetInnerHTML: {
              __html: about.collection || /* @__PURE__ */ jsx(T, { children: "dataset_view.not_entered" })
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "data-quality", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.statistical_quality" }) }),
        /* @__PURE__ */ jsx(
          "dd",
          {
            className: "govuk-summary-list__value",
            dangerouslySetInnerHTML: {
              __html: about.quality || /* @__PURE__ */ jsx(T, { children: "dataset_view.not_entered" })
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.related_reports" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: (((_a = about.relatedLinks) == null ? void 0 : _a.length) || 0) > 0 ? /* @__PURE__ */ jsx("ul", { className: "govuk-list", children: about.relatedLinks.map((link, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            className: "govuk-link govuk-link--no-underline",
            href: link.url,
            target: "_blank",
            children: link.label
          }
        ) }, index)) }) : /* @__PURE__ */ jsx(T, { children: "dataset_view.not_entered" }) })
      ] })
    ] })
  ] });
}
function KeyInfo({ keyInfo }) {
  return /* @__PURE__ */ jsxs("div", { className: "dataset-key-information", children: [
    /* @__PURE__ */ jsx("h2", { className: "govuk-heading-m", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.heading" }) }),
    /* @__PURE__ */ jsxs("dl", { className: "govuk-summary-list", children: [
      /* @__PURE__ */ jsxs("div", { id: "last-updated", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.last_update" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: keyInfo.updatedAt ? dateFormat(keyInfo.updatedAt, "d MMMM yyyy") : /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.update_missing" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "next-updated", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.next_update" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: keyInfo.nextUpdateAt ? (
          // FIXME: why can this been a boolean?
          dateFormat(keyInfo.nextUpdateAt, "MMMM yyyy")
        ) : keyInfo.nextUpdateAt === false ? /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.not_updated" }) : /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.next_update_missing" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "designation", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.about.designation" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: keyInfo.designation ? /* @__PURE__ */ jsxs(T, { children: [
          "dataset_view.about.designations.",
          keyInfo.designation
        ] }) : /* @__PURE__ */ jsx(T, { children: "dataset_view.not_selected" }) })
      ] }),
      keyInfo.providers !== void 0 && keyInfo.providers.length > 0 ? keyInfo.providers.map((provider, idx) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
        /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
          /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: keyInfo.providers.length > 1 ? /* @__PURE__ */ jsx(T, { index: idx + 1, children: "dataset_view.key_information.data_providers" }) : /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.data_provider" }) }),
          /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: provider.provider_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
          /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: keyInfo.providers.length > 1 ? /* @__PURE__ */ jsx(T, { index: idx + 1, children: "dataset_view.key_information.data_sources" }) : /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.data_source" }) }),
          /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: provider.source_name ? provider.source_name : /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.no_source" }) })
        ] })
      ] }, idx)) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
          /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.data_provider" }) }),
          /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.not_selected" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
          /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.data_source" }) }),
          /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.not_selected" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "time-period", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.key_information.time_covered" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: keyInfo.timePeriod.start && keyInfo.timePeriod.end ? /* @__PURE__ */ jsx(
          T,
          {
            start: dateFormat(keyInfo.timePeriod.start, "MMMM yyyy"),
            end: dateFormat(keyInfo.timePeriod.end, "MMMM yyyy"),
            raw: true,
            children: "dataset_view.key_information.time_period"
          }
        ) : /* @__PURE__ */ jsx(T, { children: "dataset_view.period_cover_missing" }) })
      ] })
    ] })
  ] });
}
function Notes({ notes }) {
  var _a, _b;
  if (!((_a = notes.publishedRevisions) == null ? void 0 : _a.length) && !notes.roundingApplied) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "dataset-notes", children: [
    /* @__PURE__ */ jsx("h2", { className: "govuk-heading-m govuk-!-margin-top-6", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.notes.heading" }) }),
    /* @__PURE__ */ jsxs("dl", { className: "govuk-summary-list", children: [
      (((_b = notes.publishedRevisions) == null ? void 0 : _b.length) || 0) > 1 && /* @__PURE__ */ jsxs("div", { id: "revisions", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.notes.revisions" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: /* @__PURE__ */ jsx("ul", { className: "govuk-list", children: notes.publishedRevisions.map((revision, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("strong", { children: dateFormat(revision.publish_at, "d MMMM yyyy") }) }, index)) }) })
      ] }),
      notes.roundingApplied && /* @__PURE__ */ jsxs("div", { id: "data-rounding", className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.notes.rounding" }) }),
        /* @__PURE__ */ jsx(
          "dd",
          {
            className: "govuk-summary-list__value",
            dangerouslySetInnerHTML: { __html: notes.roundingDescription }
          }
        )
      ] })
    ] })
  ] });
}
function Published({ published }) {
  var _a;
  return /* @__PURE__ */ jsxs("div", { className: "dataset-published", children: [
    /* @__PURE__ */ jsx("h2", { className: "govuk-heading-m govuk-!-margin-top-6", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.published.heading" }) }),
    /* @__PURE__ */ jsxs("dl", { className: "govuk-summary-list", children: [
      /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.published.org" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value", children: ((_a = published.organisation) == null ? void 0 : _a.name) || /* @__PURE__ */ jsx(T, { children: "dataset_view.not_entered" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "govuk-summary-list__row", children: [
        /* @__PURE__ */ jsx("dt", { className: "govuk-summary-list__key", children: /* @__PURE__ */ jsx(T, { children: "dataset_view.published.contact" }) }),
        /* @__PURE__ */ jsx("dd", { className: "govuk-summary-list__value" })
      ] })
    ] })
  ] });
}
const config = appConfig();
const logger = logger$2.child({ service: "consumer-api" });
class ConsumerApi {
  constructor(lang = Locale.English) {
    __publicField(this, "backendUrl", config.backend.url);
    this.lang = lang;
  }
  async fetch({
    url,
    method = HttpMethod.Get,
    body,
    json,
    headers,
    lang
  }) {
    const head = {
      "Accept-Language": lang || this.lang,
      ...json ? { "Content-Type": "application/json; charset=UTF-8" } : {},
      ...headers
    };
    const data2 = json ? JSON.stringify(json) : body;
    return fetch(`${this.backendUrl}/${url}`, { method, headers: head, body: data2 }).then(async (response) => {
      if (!response.ok) {
        const body2 = await new Response(response.body).text();
        if (body2) {
          throw new ApiException(response.statusText, response.status, body2);
        }
        throw new ApiException(response.statusText, response.status);
      }
      return response;
    }).catch((error) => {
      logger.error(
        `An api error occurred with status '${error.status}' and message '${error.message}'`
      );
      throw new ApiException(error.message, error.status, error.body);
    });
  }
  async ping() {
    return this.fetch({ url: "healthcheck" }).then(() => true);
  }
  async getPublishedTopics(topicId, page = 1, limit = 20) {
    logger.debug(`Fetching published datasets for topic: ${topicId}`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    const url = topicId ? `published/topic/${topicId}?${qs}` : `published/topic`;
    return this.fetch({ url }).then((response) => response.json());
  }
  async getPublishedDatasetList(page = 1, limit = 20) {
    logger.debug(`Fetching published dataset list...`);
    const qs = `${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    }).toString()}`;
    return this.fetch({ url: `published/list?${qs}` }).then(
      (response) => response.json()
    );
  }
  async getPublishedDataset(datasetId) {
    logger.debug(`Fetching published dataset: ${datasetId}`);
    return this.fetch({ url: `published/${datasetId}` }).then(
      (response) => response.json()
    );
  }
  async getPublishedDatasetView(datasetId, pageSize, pageNumber, sortBy) {
    logger.debug(`Fetching published view of dataset: ${datasetId}`);
    const searchParams = new URLSearchParams({
      page_number: pageNumber.toString(),
      page_size: pageSize.toString()
    });
    if (sortBy) searchParams.append("sort_by", sortBy);
    return this.fetch({ url: `published/${datasetId}/view?${searchParams.toString()}` }).then(
      (response) => response.json()
    );
  }
  async getCubeFileStream(datasetId, format2, language) {
    logger.debug(`Fetching ${format2} stream for dataset: ${datasetId}...`);
    return this.fetch({
      url: `published/${datasetId}/download/${format2}`,
      lang: language
    }).then((response) => response.body);
  }
}
const consumerApi = unstable_createContext(new ConsumerApi());
const fetchPublishedDataset = async ({
  context,
  params
}) => {
  const api = context.get(consumerApi);
  const result = datasetIdValidator.safeParse(params);
  if (!result.success) {
    logger$2.error("Invalid or missing datasetId");
    throw new NotFoundException("errors.dataset_missing");
  }
  try {
    const dataset = await api.getPublishedDataset(result.data.datasetId);
    context.set(datasetContext, {
      dataset,
      datasetId: dataset.id
    });
  } catch (_err) {
    throw new NotFoundException("errors.dataset_missing");
  }
};
const nextUpdateAt = (revision) => {
  const update = revision == null ? void 0 : revision.update_frequency;
  if (!update) return void 0;
  if (update.is_updated === false) return false;
  if (!(revision == null ? void 0 : revision.publish_at) || !update.frequency_unit || !update.frequency_value) return void 0;
  return add(revision.publish_at, { [`${update.frequency_unit}s`]: update.frequency_value });
};
const markdownToSafeHTML = async (content) => {
  const { window } = new JSDOM(`<!DOCTYPE html>`);
  const domPurify = DOMPurify(window);
  return domPurify.sanitize(await marked.parse(content ?? ""));
};
const getDatasetPreview = async (dataset, revision) => {
  var _a, _b;
  if (!revision || !revision.metadata) {
    throw new Error("preview requires access to the revision and metadata");
  }
  const { summary, quality, collection, rounding_description } = revision.metadata;
  const { rounding_applied, designation, related_links } = revision;
  const preview2 = {
    title: revision.metadata.title,
    keyInfo: {
      updatedAt: revision == null ? void 0 : revision.publish_at,
      nextUpdateAt: nextUpdateAt(revision),
      designation,
      providers: (_a = revision.providers) == null ? void 0 : _a.map(({ provider_name, source_name }) => ({
        provider_name,
        source_name
      })),
      timePeriod: { start: dataset.start_date, end: dataset.end_date }
    },
    notes: {
      roundingApplied: rounding_applied,
      // TODO: use markdown to JSX for this.
      roundingDescription: await markdownToSafeHTML(rounding_description),
      publishedRevisions: (_b = dataset.revisions) == null ? void 0 : _b.filter((rev) => isPublished(rev))
    },
    about: {
      summary: await markdownToSafeHTML(summary),
      quality: await markdownToSafeHTML(quality),
      collection: await markdownToSafeHTML(collection),
      relatedLinks: related_links
    },
    published: {
      organisation: void 0
    }
  };
  return preview2;
};
const unstable_middleware = [fetchPublishedDataset];
const loader$1 = async ({
  context,
  request
}) => {
  const {
    isDeveloper
  } = context.get(authContext);
  const {
    dataset: loadedDataset
  } = context.get(datasetContext);
  const locale = getLocale(context);
  const api = context.get(consumerApi);
  const dataset = singleLangDataset(loadedDataset, locale);
  const revision = dataset.published_revision;
  const query = new URL(request.url).searchParams;
  const pageNumber = Number.parseInt(query.get("page_number"), 10) || 1;
  const pageSize = Number.parseInt(query.get("page_size"), 10) || 100;
  let pagination = [];
  if (!dataset.live || !revision) {
    throw new NotFoundException("no published revision found");
  }
  const datasetMetadata = await getDatasetPreview(dataset, revision);
  const preview2 = await api.getPublishedDatasetView(dataset.id, pageSize, pageNumber, void 0);
  pagination = generateSequenceForNumber(preview2.current_page, preview2.total_pages);
  return {
    ...preview2,
    datasetMetadata,
    pagination,
    isDeveloper
  };
};
const consumerView = withComponentProps(function ConsumerView({
  loaderData
}) {
  const [searchParams] = useSearchParams();
  const {
    i18n
  } = useTranslation();
  const DataPanel = /* @__PURE__ */ jsx("div", {
    className: "govuk-width-container",
    children: /* @__PURE__ */ jsxs("div", {
      className: "govuk-main-wrapper govuk-!-padding-top-0",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-row govuk-!-margin-bottom-0",
        children: [/* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-one-half",
          children: /* @__PURE__ */ jsxs("form", {
            method: "get",
            children: [/* @__PURE__ */ jsx(Select, {
              name: "dataViewsChoice",
              label: /* @__PURE__ */ jsx(T, {
                children: "consumer_view.data_view"
              }),
              labelClassName: "govuk-label--s",
              options: [{
                value: "",
                label: /* @__PURE__ */ jsx(T, {
                  children: "consumer_view.select_view"
                })
              }, {
                value: "default",
                label: /* @__PURE__ */ jsx(T, {
                  children: "consumer_view.data_table"
                })
              }],
              value: searchParams.get("dataViewsChoice"),
              inline: true
            }), " ", /* @__PURE__ */ jsx("button", {
              type: "submit",
              className: "govuk-button button-black govuk-button-small",
              "data-module": "govuk-button",
              children: /* @__PURE__ */ jsx(T, {
                children: "consumer_view.apply_view"
              })
            })]
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-one-half govuk-!-text-align-right",
          children: /* @__PURE__ */ jsx(T, {
            start: loaderData.page_info.start_record,
            end: loaderData.page_info.end_record,
            total: loaderData.page_info.total_records,
            children: "publish.preview.showing_rows"
          })
        })]
      }), /* @__PURE__ */ jsx("hr", {
        className: "govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-padding-top-0"
      }), /* @__PURE__ */ jsxs("div", {
        className: "govuk-grid-row",
        children: [/* @__PURE__ */ jsx("div", {
          className: "govuk-grid-column-one-quarter",
          children: /* @__PURE__ */ jsxs("form", {
            method: "get",
            children: [/* @__PURE__ */ jsx("h3", {
              children: /* @__PURE__ */ jsx(T, {
                children: "consumer_view.filters"
              })
            }), /* @__PURE__ */ jsx(Select, {
              name: "page_size",
              label: /* @__PURE__ */ jsx(T, {
                children: "pagination.page_size"
              }),
              value: String(loaderData.page_size),
              options: [5, 10, 25, 50, 100, 250, 500].map((size) => ({
                value: size,
                label: String(size)
              }))
            }), /* @__PURE__ */ jsx("button", {
              name: "dataViewsChoice",
              value: "filter",
              type: "submit",
              className: "govuk-button button-black",
              "data-module": "govuk-button",
              children: /* @__PURE__ */ jsx(T, {
                children: "consumer_view.apply_filters"
              })
            })]
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "govuk-grid-column-three-quarters",
          children: [/* @__PURE__ */ jsx("div", {
            className: "govuk-!-padding-top-5 govuk-!-margin-bottom-2",
            children: /* @__PURE__ */ jsx(ViewTable, {
              ...loaderData
            })
          }), /* @__PURE__ */ jsx(Pagination, {
            ...loaderData,
            hideLineCount: true
          })]
        })]
      })]
    })
  });
  const AboutPanel = /* @__PURE__ */ jsx("div", {
    className: "govuk-grid-row",
    children: /* @__PURE__ */ jsxs("div", {
      className: "govuk-grid-column-full",
      children: [/* @__PURE__ */ jsx(KeyInfo, {
        keyInfo: loaderData.datasetMetadata.keyInfo
      }), /* @__PURE__ */ jsx(Notes, {
        notes: loaderData.datasetMetadata.notes
      }), /* @__PURE__ */ jsx(About, {
        about: loaderData.datasetMetadata.about
      }), /* @__PURE__ */ jsx(Published, {
        published: loaderData.datasetMetadata.published
      })]
    })
  });
  const DownloadPanel = /* @__PURE__ */ jsx("div", {
    className: "govuk-grid-row",
    children: /* @__PURE__ */ jsx("div", {
      className: "govuk-grid-column-full",
      children: /* @__PURE__ */ jsxs("form", {
        method: "get",
        action: localeUrl(`/published/${loaderData.dataset.id}/download`, i18n.language),
        children: [/* @__PURE__ */ jsx(RadioGroup, {
          name: "view_type",
          label: /* @__PURE__ */ jsx(T, {
            children: "consumer_view.download_heading"
          }),
          options: [{
            value: "filtered",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.filtered_download"
            }),
            disabled: true
          }, {
            value: "default",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.default_download"
            })
          }],
          value: "default"
        }), /* @__PURE__ */ jsx(RadioGroup, {
          name: "format",
          label: /* @__PURE__ */ jsx(T, {
            children: "consumer_view.download_format"
          }),
          options: [{
            value: "csv",
            label: "CSV",
            hint: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.data_only_hint"
            })
          }, {
            value: "xlsx",
            label: "Excel",
            hint: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.data_metadata_hint"
            })
          }, {
            value: "parquet",
            label: "Parquet",
            hint: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.data_metadata_hint"
            })
          }, {
            value: "duckdb",
            label: "DuckDB",
            hint: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.everything_hint"
            })
          }]
        }), /* @__PURE__ */ jsx(RadioGroup, {
          name: "number_format",
          label: /* @__PURE__ */ jsx(T, {
            children: "consumer_view.number_formating"
          }),
          options: [{
            value: "default",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.formatted_numbers"
            }),
            hint: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.formatted_numbers_hint"
            })
          }, {
            value: "raw",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.unformatted_numbers"
            }),
            disabled: true
          }],
          value: "default"
        }), /* @__PURE__ */ jsx(RadioGroup, {
          name: "download_language",
          label: /* @__PURE__ */ jsx(T, {
            children: "consumer_view.select_language"
          }),
          options: [{
            value: "en-GB",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.english"
            })
          }, {
            value: "cy-GB",
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.welsh"
            })
          }]
        }), /* @__PURE__ */ jsx("button", {
          name: "action",
          value: "download",
          type: "submit",
          className: "govuk-button button-blue",
          "data-module": "govuk-button",
          children: /* @__PURE__ */ jsx(T, {
            children: "consumer_view.download_button"
          })
        })]
      })
    })
  });
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "govuk-heading-xl",
      children: loaderData.datasetMetadata.title
    }), (loaderData.preview || (loaderData == null ? void 0 : loaderData.isDeveloper) && (loaderData == null ? void 0 : loaderData.ShowDeveloperTab)) && // FIXME: fix types
    /* @__PURE__ */ jsx(DatasetStatus, {
      ...loaderData
    }), loaderData.preview && /* @__PURE__ */ jsx("div", {
      className: "govuk-panel",
      children: /* @__PURE__ */ jsx("p", {
        className: "govuk-panel__title-m",
        children: /* @__PURE__ */ jsx(T, {
          children: "publish.cube_preview.panel"
        })
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "govuk-tabs",
      "data-module": "govuk-tabs",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "govuk-tabs__title",
        children: /* @__PURE__ */ jsx(T, {
          children: "toc"
        })
      }), /* @__PURE__ */ jsx(Tabs, {
        tabs: [
          // TODO: fix this
          // ...(props?.isDeveloper && props?.showDeveloperTab
          //   ? [
          //       {
          //         label:<T>developer.heading</T>
          //         id: 'developer',
          //         children: <DeveloperView {...loaderData} />
          //       }
          //     ]
          //   : []),
          {
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.data"
            }),
            id: "data",
            children: DataPanel
          },
          {
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.about_this_dataset"
            }),
            id: "about_dataset",
            children: AboutPanel
          },
          {
            label: /* @__PURE__ */ jsx(T, {
              children: "consumer_view.download"
            }),
            id: "download_dataset",
            children: DownloadPanel
          }
        ]
      })]
    })]
  });
});
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: consumerView,
  loader: loader$1,
  unstable_middleware
}, Symbol.toStringTag, { value: "Module" }));
const resources = {
  en: {
    translation: enTranslation
  },
  cy: {
    translation: cyTranslation
  }
};
async function loader({
  params
}) {
  const lng = z$1.string().refine((lng2) => Object.keys(resources).includes(lng2)).safeParse(params.lng);
  console.log({
    lng
  });
  if (lng.error) return data({
    error: lng.error
  }, {
    status: 400
  });
  const namespaces = resources[lng.data];
  const ns = z$1.string().refine((ns2) => {
    return Object.keys(resources[lng.data]).includes(ns2);
  }).safeParse(params.ns);
  if (ns.error) return data({
    error: ns.error
  }, {
    status: 400
  });
  const headers = new Headers();
  if (process.env.NODE_ENV === "production") {
    headers.set("Cache-Control", cacheHeader({
      maxAge: "5m",
      // Cache in the browser for 5 minutes
      sMaxage: "1d",
      // Cache in the CDN for 1 day
      // Serve stale content while revalidating for 7 days
      staleWhileRevalidate: "7d",
      // Serve stale content if there's an error for 7 days
      staleIfError: "7d"
    }));
  }
  return data(namespaces[ns.data], {
    headers
  });
}
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const notFound = withComponentProps(function NotFound() {
  return /* @__PURE__ */ jsx("h1", {
    className: "govuk-heading-xl",
    children: /* @__PURE__ */ jsx(T, {
      children: "errors.not_found"
    })
  });
});
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: notFound
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DWxsXtjz.js", "imports": ["/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-uyVH9ZvI.js", "imports": ["/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/with-props-daUcymKh.js", "/assets/T-CQIXqhPq.js", "/assets/locale-url-yD_AyXRN.js", "/assets/LocaleLink-CIhOCkNj.js"], "css": ["/assets/root-DfpSAdo-.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/layouts/publisher": { "id": "routes/layouts/publisher", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/publisher--GFGOYBf.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/clsx-B-dksMZM.js", "/assets/T-CQIXqhPq.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/login": { "id": "routes/auth/login", "parentId": "routes/layouts/publisher", "path": ":lang/auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-CXj4rW8G.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/T-CQIXqhPq.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/ErrorProvider-Cxuz4RMS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/logout": { "id": "routes/auth/logout", "parentId": "routes/layouts/publisher", "path": ":lang/auth/logout", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/entraid": { "id": "routes/auth/entraid", "parentId": "routes/layouts/publisher", "path": ":lang/auth/entraid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/entraid-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/callback": { "id": "routes/auth/callback", "parentId": "routes/layouts/publisher", "path": ":lang/auth/callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/callback-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/require-auth": { "id": "routes/auth/require-auth", "parentId": "routes/layouts/publisher", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/require-auth-CTfqmr1m.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/homepage": { "id": "routes/homepage", "parentId": "routes/auth/require-auth", "path": ":lang", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/homepage-BZJGQ05A.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/Pagination-CTQ2at6l.js", "/assets/Table-BHT1KmCI.js", "/assets/date-format-trgs2e0w.js", "/assets/status-to-colour-CUWEJy7V.js", "/assets/T-CQIXqhPq.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/start": { "id": "routes/publish/start", "parentId": "routes/auth/require-auth", "path": ":lang/publish", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/start-Ct0xU9MO.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/T-CQIXqhPq.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/locale-url-yD_AyXRN.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/group": { "id": "routes/publish/group", "parentId": "routes/auth/require-auth", "path": ":lang/publish/group", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/group-DW9vWpTB.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/RadioGroup-DktJgkR6.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/T-CQIXqhPq.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/title": { "id": "routes/publish/title", "parentId": "routes/auth/require-auth", "path": ":lang/publish/title", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/title-hzxG71xX.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/clsx-B-dksMZM.js", "/assets/T-CQIXqhPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/dataset/overview": { "id": "routes/publish/dataset/overview", "parentId": "routes/auth/require-auth", "path": ":lang/publish/:datasetId/overview", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/overview-B1Q6kug-.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/T-CQIXqhPq.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/FlashMessages-Dg7CLHPF.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/DatasetStatus-BlR5j9Z6.js", "/assets/Tabs-BPtvNYv5.js", "/assets/Table-BHT1KmCI.js", "/assets/date-format-trgs2e0w.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js", "/assets/status-to-colour-CUWEJy7V.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/dataset/tasklist": { "id": "routes/publish/dataset/tasklist", "parentId": "routes/auth/require-auth", "path": ":lang/publish/:datasetId/tasklist", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/tasklist-Cj7g6aLE.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/T-CQIXqhPq.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/status-to-colour-CUWEJy7V.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/DatasetStatus-BlR5j9Z6.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/dataset/upload-dataset": { "id": "routes/publish/dataset/upload-dataset", "parentId": "routes/auth/require-auth", "path": ":lang/publish/:datasetId/upload", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/upload-dataset-DwGjKw29.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/T-CQIXqhPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/dataset/preview": { "id": "routes/publish/dataset/preview", "parentId": "routes/auth/require-auth", "path": ":lang/publish/:datasetId/preview", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/preview-CEn9Xz7R.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/Pagination-CTQ2at6l.js", "/assets/RadioGroup-DktJgkR6.js", "/assets/Select-DL5FhX3p.js", "/assets/T-CQIXqhPq.js", "/assets/Table-BHT1KmCI.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js", "/assets/LocaleLink-CIhOCkNj.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/publish/dataset/sources": { "id": "routes/publish/dataset/sources", "parentId": "routes/auth/require-auth", "path": ":lang/publish/:datasetId/sources", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/sources-CHvmqIE1.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/Select-DL5FhX3p.js", "/assets/T-CQIXqhPq.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js", "/assets/ErrorProvider-Cxuz4RMS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/ensure-admin": { "id": "routes/admin/ensure-admin", "parentId": "routes/auth/require-auth", "path": ":lang/admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/ensure-admin-u3bP9W74.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/groups/list": { "id": "routes/admin/groups/list", "parentId": "routes/admin/ensure-admin", "path": "group", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/list-BPTcrXgZ.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/FlashMessages-Dg7CLHPF.js", "/assets/T-CQIXqhPq.js", "/assets/Table-BHT1KmCI.js", "/assets/Pagination-CTQ2at6l.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/users/list": { "id": "routes/admin/users/list", "parentId": "routes/admin/ensure-admin", "path": "user", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/list-8MZ74iAN.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/T-CQIXqhPq.js", "/assets/FlashMessages-Dg7CLHPF.js", "/assets/Table-BHT1KmCI.js", "/assets/date-format-trgs2e0w.js", "/assets/status-to-colour-CUWEJy7V.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/guidance/contents": { "id": "routes/guidance/contents", "parentId": "routes/layouts/publisher", "path": ":lang/guidance", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/contents-DOgOHi7j.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/T-CQIXqhPq.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/locale-url-yD_AyXRN.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/guidance/doc": { "id": "routes/guidance/doc", "parentId": "routes/layouts/publisher", "path": ":lang/guidance/:doc", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/doc-Dlwmp_pr.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/MarkdownDocument-C3N7CTC7.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/T-CQIXqhPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/cookies": { "id": "routes/cookies", "parentId": "routes/layouts/publisher", "path": ":lang/cookies", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/cookies-Dlwmp_pr.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/MarkdownDocument-C3N7CTC7.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/T-CQIXqhPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/layouts/consumer": { "id": "routes/layouts/consumer", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/consumer-BkoKZ4OU.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/FlashMessages-Dg7CLHPF.js", "/assets/ErrorHandler-Dy9h9pDk.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/T-CQIXqhPq.js", "/assets/ErrorProvider-Cxuz4RMS.js", "/assets/locale-url-yD_AyXRN.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/published/consumer-view": { "id": "routes/published/consumer-view", "parentId": "routes/layouts/consumer", "path": ":lang/published/:datasetId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/consumer-view-NTxmANG5.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/Table-BHT1KmCI.js", "/assets/date-format-trgs2e0w.js", "/assets/T-CQIXqhPq.js", "/assets/DatasetStatus-BlR5j9Z6.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js", "/assets/Pagination-CTQ2at6l.js", "/assets/RadioGroup-DktJgkR6.js", "/assets/Select-DL5FhX3p.js", "/assets/Tabs-BPtvNYv5.js", "/assets/locale-url-yD_AyXRN.js", "/assets/clsx-B-dksMZM.js", "/assets/status-to-colour-CUWEJy7V.js", "/assets/LocaleLink-CIhOCkNj.js", "/assets/ErrorProvider-Cxuz4RMS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/locales": { "id": "routes/locales", "parentId": "root", "path": "/api/locales/:lng/:ns", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/locales-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/errors/not-found": { "id": "routes/errors/not-found", "parentId": "root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/not-found-DweOgfY2.js", "imports": ["/assets/with-props-daUcymKh.js", "/assets/context-Zvpbq3dQ.js", "/assets/T-CQIXqhPq.js", "/assets/chunk-DQRVZFIR-CI4QRDf9.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-a5f166cb.js", "version": "a5f166cb", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": true, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = ["/cy-GB/cookies/cookie-statement", "/en-GB/cookies/cookie-statement", "/cy-GB/guidance/Data-preparation-‐-New-datasets", "/cy-GB/guidance/Data-preparation-‐-Updating-datasets", "/cy-GB/guidance/Using-SW3---Creating-a-new-dataset", "/cy-GB/guidance/Using-SW3---Roles-and-permissions", "/cy-GB/guidance/Using-SW3---Updating-a-dataset", "/en-GB/guidance/Data-preparation-‐-New-datasets", "/en-GB/guidance/Data-preparation-‐-Updating-datasets", "/en-GB/guidance/Using-SW3---Creating-a-new-dataset", "/en-GB/guidance/Using-SW3---Roles-and-permissions", "/en-GB/guidance/Using-SW3---Updating-a-dataset"];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/layouts/publisher": {
    id: "routes/layouts/publisher",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth/login": {
    id: "routes/auth/login",
    parentId: "routes/layouts/publisher",
    path: ":lang/auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/auth/logout": {
    id: "routes/auth/logout",
    parentId: "routes/layouts/publisher",
    path: ":lang/auth/logout",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth/entraid": {
    id: "routes/auth/entraid",
    parentId: "routes/layouts/publisher",
    path: ":lang/auth/entraid",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/auth/callback": {
    id: "routes/auth/callback",
    parentId: "routes/layouts/publisher",
    path: ":lang/auth/callback",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/auth/require-auth": {
    id: "routes/auth/require-auth",
    parentId: "routes/layouts/publisher",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/homepage": {
    id: "routes/homepage",
    parentId: "routes/auth/require-auth",
    path: ":lang",
    index: true,
    caseSensitive: void 0,
    module: route7
  },
  "routes/publish/start": {
    id: "routes/publish/start",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish",
    index: true,
    caseSensitive: void 0,
    module: route8
  },
  "routes/publish/group": {
    id: "routes/publish/group",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/group",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/publish/title": {
    id: "routes/publish/title",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/title",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/publish/dataset/overview": {
    id: "routes/publish/dataset/overview",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/:datasetId/overview",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/publish/dataset/tasklist": {
    id: "routes/publish/dataset/tasklist",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/:datasetId/tasklist",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/publish/dataset/upload-dataset": {
    id: "routes/publish/dataset/upload-dataset",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/:datasetId/upload",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/publish/dataset/preview": {
    id: "routes/publish/dataset/preview",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/:datasetId/preview",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/publish/dataset/sources": {
    id: "routes/publish/dataset/sources",
    parentId: "routes/auth/require-auth",
    path: ":lang/publish/:datasetId/sources",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/admin/ensure-admin": {
    id: "routes/admin/ensure-admin",
    parentId: "routes/auth/require-auth",
    path: ":lang/admin",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/admin/groups/list": {
    id: "routes/admin/groups/list",
    parentId: "routes/admin/ensure-admin",
    path: "group",
    index: true,
    caseSensitive: void 0,
    module: route17
  },
  "routes/admin/users/list": {
    id: "routes/admin/users/list",
    parentId: "routes/admin/ensure-admin",
    path: "user",
    index: true,
    caseSensitive: void 0,
    module: route18
  },
  "routes/guidance/contents": {
    id: "routes/guidance/contents",
    parentId: "routes/layouts/publisher",
    path: ":lang/guidance",
    index: true,
    caseSensitive: void 0,
    module: route19
  },
  "routes/guidance/doc": {
    id: "routes/guidance/doc",
    parentId: "routes/layouts/publisher",
    path: ":lang/guidance/:doc",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/cookies": {
    id: "routes/cookies",
    parentId: "routes/layouts/publisher",
    path: ":lang/cookies",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/layouts/consumer": {
    id: "routes/layouts/consumer",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/published/consumer-view": {
    id: "routes/published/consumer-view",
    parentId: "routes/layouts/consumer",
    path: ":lang/published/:datasetId",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "routes/locales": {
    id: "routes/locales",
    parentId: "root",
    path: "/api/locales/:lng/:ns",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "routes/errors/not-found": {
    id: "routes/errors/not-found",
    parentId: "root",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
