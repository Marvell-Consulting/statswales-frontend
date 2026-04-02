import { query } from '../duckdb-helper';
import { heading, table, codeBlock, bold } from '../markdown';

export async function errors(): Promise<string> {
  const lines: string[] = [heading(2, 'Errors')];

  const grouped = await query(`
    SELECT
      COALESCE(err_type, 'unknown') AS error_type,
      COALESCE(split_part(err_message, chr(10), 1), 'no message') AS first_line,
      count(*) AS cnt,
      max(to_timestamp(log_time / 1000))::VARCHAR AS most_recent
    FROM logs
    WHERE level >= 50
    GROUP BY error_type, first_line
    ORDER BY cnt DESC
    LIMIT 30
  `);
  lines.push(heading(3, 'Errors by Type + Message'));
  lines.push(
    table(
      ['Type', 'Message (first line)', 'Count', 'Most Recent'],
      grouped.map((r) => [
        r.error_type as string,
        (r.first_line as string).substring(0, 120),
        Number(r.cnt).toLocaleString(),
        r.most_recent as string
      ])
    )
  );

  const stacks = await query(`
    SELECT
      COALESCE(err_type, 'unknown') AS error_type,
      COALESCE(split_part(err_message, chr(10), 1), 'no message') AS first_line,
      err_stack
    FROM logs
    WHERE level >= 50 AND err_stack IS NOT NULL
    GROUP BY error_type, first_line, err_stack
    ORDER BY count(*) DESC
    LIMIT 5
  `);
  if (stacks.length > 0) {
    lines.push(heading(3, 'Example Stack Traces (top 5 by frequency)'));
    for (const s of stacks) {
      lines.push(`**${s.error_type}: ${(s.first_line as string).substring(0, 100)}**\n`);
      const stackLines = (s.err_stack as string).split('\n').slice(0, 15);
      lines.push(codeBlock(stackLines.join('\n')));
    }
  }

  const routes = await query(`
    SELECT
      route,
      count(*) AS cnt
    FROM logs
    WHERE level >= 50 AND route IS NOT NULL
    GROUP BY route
    ORDER BY cnt DESC
    LIMIT 15
  `);
  lines.push(heading(3, 'Top Error-Producing Routes'));
  lines.push(
    table(
      ['Route', 'Error Count'],
      routes.map((r) => [r.route as string, Number(r.cnt).toLocaleString()])
    )
  );

  const redis = await query(`
    SELECT
      COALESCE(err_type, 'unknown') AS error_type,
      COALESCE(err_code, 'n/a') AS error_code,
      count(*) AS cnt,
      min(to_timestamp(log_time / 1000))::VARCHAR AS first_seen,
      max(to_timestamp(log_time / 1000))::VARCHAR AS last_seen
    FROM logs
    WHERE level >= 50
      AND (err_type LIKE '%Socket%' OR err_type LIKE '%Redis%'
           OR err_message LIKE '%ECONNRESET%' OR err_message LIKE '%redis%'
           OR err_code IN ('ECONNRESET', 'ECONNREFUSED'))
    GROUP BY error_type, error_code
    ORDER BY cnt DESC
  `);
  lines.push(heading(3, 'Redis / Session Errors'));
  if (redis.length === 0) {
    lines.push('_No Redis/session errors detected._\n');
  } else {
    lines.push(
      table(
        ['Type', 'Code', 'Count', 'First Seen', 'Last Seen'],
        redis.map((r) => [
          r.error_type as string,
          r.error_code as string,
          Number(r.cnt).toLocaleString(),
          r.first_seen as string,
          r.last_seen as string
        ])
      )
    );
  }

  const timeline = await query(`
    SELECT
      strftime(to_timestamp(log_time / 1000), '%Y-%m-%d %H:00') AS hour,
      count(*) AS error_count
    FROM logs
    WHERE level >= 50
    GROUP BY hour
    ORDER BY hour
  `);
  lines.push(heading(3, 'Error Timeline (errors per hour)'));
  lines.push(
    table(
      ['Hour', 'Errors'],
      timeline.map((r) => [r.hour as string, Number(r.error_count).toLocaleString()])
    )
  );

  const noStack = await query(`
    SELECT count(*) AS cnt FROM logs WHERE level >= 50 AND err_stack IS NULL
  `);
  lines.push(`\n${bold('Errors without stack traces:')} ${Number(noStack[0].cnt).toLocaleString()}\n`);

  return lines.join('\n');
}
