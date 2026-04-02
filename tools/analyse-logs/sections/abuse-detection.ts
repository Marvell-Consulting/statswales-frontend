import { query } from '../duckdb-helper';
import { heading, table, bold } from '../markdown';

export async function abuseDetection(): Promise<string> {
  const lines: string[] = [heading(2, 'Abuse Detection')];

  const spikes = await query(`
    WITH per_minute AS (
      SELECT
        time_bucket(INTERVAL '1 minute', to_timestamp(log_time / 1000)) AS bucket,
        count(*) AS cnt
      FROM logs
      WHERE url NOT LIKE '%/healthcheck%' OR url IS NULL
      GROUP BY bucket
    ),
    stats AS (
      SELECT avg(cnt) AS mean, stddev(cnt) AS sd FROM per_minute
    )
    SELECT
      bucket::VARCHAR AS minute,
      cnt,
      round((cnt - stats.mean) / NULLIF(stats.sd, 0), 2) AS z_score
    FROM per_minute, stats
    WHERE (cnt - stats.mean) / NULLIF(stats.sd, 0) > 3
    ORDER BY z_score DESC
    LIMIT 15
  `);
  lines.push(heading(3, 'Traffic Spikes (z-score > 3, 1-min buckets)'));
  if (spikes.length === 0) {
    lines.push('_No traffic spikes detected._\n');
  } else {
    lines.push(
      table(
        ['Minute', 'Requests', 'Z-Score'],
        spikes.map((r) => [r.minute as string, Number(r.cnt).toLocaleString(), r.z_score as number])
      )
    );
  }

  const enumeration = await query(`
    WITH dataset_access AS (
      SELECT
        time_bucket(INTERVAL '5 minutes', to_timestamp(log_time / 1000)) AS bucket,
        regexp_extract(url, '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 0) AS dataset_id
      FROM logs
      WHERE url IS NOT NULL AND url NOT LIKE '%/healthcheck%'
    )
    SELECT
      bucket::VARCHAR AS window,
      count(DISTINCT dataset_id) AS distinct_datasets,
      count(*) AS total_requests
    FROM dataset_access
    WHERE dataset_id IS NOT NULL AND dataset_id != ''
    GROUP BY bucket
    ORDER BY distinct_datasets DESC
    LIMIT 10
  `);
  lines.push(heading(3, 'Dataset Enumeration (distinct IDs per 5-min window)'));
  lines.push(
    table(
      ['Window', 'Distinct Datasets', 'Total Requests'],
      enumeration.map((r) => [
        r.window as string,
        Number(r.distinct_datasets).toLocaleString(),
        Number(r.total_requests).toLocaleString()
      ])
    )
  );

  const repeated5xx = await query(`
    SELECT
      method,
      route,
      count(*) AS cnt
    FROM logs
    WHERE status_code BETWEEN 500 AND 599 AND route IS NOT NULL
    GROUP BY method, route
    HAVING count(*) >= 3
    ORDER BY cnt DESC
    LIMIT 15
  `);
  lines.push(heading(3, 'Repeated 5xx-Triggering Routes'));
  if (repeated5xx.length === 0) {
    lines.push('_No repeated 5xx patterns found._\n');
  } else {
    lines.push(
      table(
        ['Method', 'Route', 'Count'],
        repeated5xx.map((r) => [r.method as string, r.route as string, Number(r.cnt).toLocaleString()])
      )
    );
  }

  const longQueries = await query(`
    SELECT
      url,
      length(split_part(url, '?', 2)) AS query_length
    FROM logs
    WHERE url IS NOT NULL
      AND length(split_part(url, '?', 2)) > 200
    LIMIT 20
  `);
  lines.push(heading(3, 'Unusually Long Query Strings (> 200 chars)'));
  if (longQueries.length === 0) {
    lines.push('_No unusually long query strings detected._\n');
  } else {
    lines.push(`${bold(`${longQueries.length} request(s) with query strings > 200 characters:`)}\n`);
    lines.push(
      table(
        ['URL (truncated)', 'Query Length'],
        longQueries.map((r) => [(r.url as string).substring(0, 120), r.query_length as number])
      )
    );
  }

  return lines.join('\n');
}
