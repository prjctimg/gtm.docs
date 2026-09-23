import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { Activity, Cpu, Gauge, MemoryStick, TrendingUp, GitCommit, FlaskConical, ExternalLink, Ruler } from 'lucide-react';
import { BENCHMARK_STATS, shortTag, formatKb, formatMs, formatDate, formatDateTime, BenchRun, BenchDelta } from '../data/benchmark';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { usePageMeta } from '../lib/meta';

interface BenchmarkPageProps {}

const METRIC_ROWS: { metric: string; label: string; format: (v: number) => string; good: 'down' | 'up' }[] = [
  { metric: 'peak_rss_kb', label: 'Peak RSS', format: formatKb, good: 'down' },
  { metric: 'mean_rss_kb', label: 'Mean RSS', format: formatKb, good: 'down' },
  { metric: 'rss_5s_kb', label: 'RSS @ 5s', format: formatKb, good: 'down' },
  { metric: 'cpu_ms', label: 'CPU', format: formatMs, good: 'down' },
  { metric: 't_ready_ms', label: 'Ready in', format: formatMs, good: 'down' },
];

function getRunMetric(run: BenchRun, metric: string): number {
  return (run as unknown as Record<string, number>)[metric] ?? 0;
}

function parseRunKey(key: string): { player: string; fixture: string } {
  const [player, fixture] = key.split('/');
  return { player, fixture: fixture || key };
}

export const BenchmarkPage: React.FC<BenchmarkPageProps> = () => {
  usePageMeta(
    'Benchmarks | gtm',
    'gtm vs cliamp resource-usage benchmarks, tracked release over release. Take it with a grain of salt — it is all in good fun.',
  );

  const stats = BENCHMARK_STATS;
  const { run, previous, series, deltas, runs, generated_at } = stats;

  // Group runs + deltas by player/fixture so the page renders whatever the
  // committed stats.json contains (gtm today; cliamp appears automatically
  // when the harness records reference runs with CLIAMP_BIN set).
  const fixtures = useMemo(() => {
    const map = new Map<string, { player: string; run?: BenchRun }[]>();
    for (const [key, value] of Object.entries(runs)) {
      const { player, fixture } = parseRunKey(key);
      if (!map.has(fixture)) map.set(fixture, []);
      map.get(fixture)!.push({ player, run: value });
    }
    return map;
  }, [runs]);

  const players = useMemo(() => {
    const set = new Set<string>();
    for (const key of Object.keys(runs)) set.add(parseRunKey(key).player);
    return Array.from(set);
  }, [runs]);

  const gtmFlac = runs['gtm/bench.flac'];
  const gtmMp3 = runs['gtm/bench.mp3'];

  const deltasByPlayer: Record<string, BenchDelta[]> = useMemo(() => {
    const grouped: Record<string, BenchDelta[]> = {};
    for (const d of deltas) {
      (grouped[d.player] ??= []).push(d);
    }
    return grouped;
  }, [deltas]);

  const chartSeries = [
    { title: 'Peak RSS by release (FLAC)', key: 'peak_rss_kb', format: formatKb, hint: 'peak RSS, kB' },
    { title: 'Mean RSS by release (FLAC)', key: 'mean_rss_kb', format: formatKb, hint: 'mean RSS, kB' },
    { title: 'CPU by release (FLAC)', key: 'cpu_ms', format: formatMs, hint: 'utime+stime, ms' },
    { title: 'Start latency by release (FLAC)', key: 't_ready_ms', format: formatMs, hint: 'IPC round trip, ms' },
  ];

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 py-10 font-sans">
      <div className="w-full max-w-5xl space-y-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-secondary/15 border border-secondary/30 text-secondary font-semibold tracking-wide">
              LIVING DOCUMENT
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">
              {run.tag}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">
              generated {formatDateTime(generated_at)}
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-secondary" />
            gtm Benchmarks
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-3xl">
            Automated measurements of gtm’s resource usage during playback,
            charted release-over-release and compared against the reference CLI
            player{' '}
            <a
              href="https://github.com/bjarneo/cliamp"
              target="_blank"
              rel="noreferrer"
              className="text-secondary hover:text-primary underline decoration-secondary/40 underline-offset-2"
            >
              cliamp
            </a>
            .
          </p>
        </div>

        {/* ── The required write-up: read this before the data ───── */}
        <section className="rounded-xl border border-hairline-outline bg-surface-container p-5 sm:p-6 space-y-4">
          <h2 className="font-mono text-sm font-bold text-text-primary flex items-center gap-2">
            <Ruler className="w-4 h-4 text-secondary" />
            Before you read any of the numbers
          </h2>
          <div className="space-y-3 text-sm text-text-body leading-relaxed">
            <p>
              Take this with a grain of salt. Like all benchmarks, these checks
              measure one narrow harness on one machine — a fixed FLAC and MP3
              fixture, a headless daemon, no audio device. They say nothing
              definitive about your library, your machine, or your ears.
            </p>
            <p>
              The honest framing: this is for fun — a friendly compare of how
              gtm, a young terminal player, fares against the more feature-rich
              and mature <span className="text-text-primary font-semibold">cliamp</span>.
              cliamp ships a lot more than gtm does. If gtm holds its own on
              memory and startup latency, great — and the moment it does not,
              the regression shows up in these charts too. That is the point of
              tracking this over time instead of cherry-picking a single run.
            </p>
            <p className="text-text-muted text-xs font-mono">
              The page is a living document: it renders whatever the committed{' '}
              <code className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-secondary">stats.json</code>{' '}
              contains. cliamp reference runs appear automatically whenever the
              benchmark harness records them.
            </p>
          </div>
        </section>

        {/* ── This run vs previous────────────────────────────────── */}
        <section className="rounded-xl border border-hairline-outline bg-surface-container overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-subtle flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-sm font-bold text-text-primary flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-secondary" />
              This run vs previous release
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-text-muted">
              <span>
                this <span className="text-text-primary">{shortTag(run.tag)}</span>
              </span>
              {previous?.tag && (
                <span>
                  prev{' '}
                  <span className="text-text-muted line-through decoration-hairline-outline">
                    {shortTag(previous.tag)}
                  </span>
                </span>
              )}
              <span className="text-text-disabled">FLAC fixture · gtm</span>
            </div>
          </div>

          {players.length > 0 ? (
            players.map((player) => {
              const rows = deltasByPlayer[player];
              if (!rows?.length) return null;
              return (
                <div key={player} className="p-5">
                  <div className="mb-3 font-mono text-xs uppercase tracking-wider text-text-muted">
                    player <span className="text-secondary font-bold">{player}</span> · diff vs previous release
                  </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-outline text-text-muted uppercase text-xs">
                          <th className="py-2 pr-3 font-semibold">Metric</th>
                          <th className="py-2 pr-3 font-semibold text-right">Prev</th>
                          <th className="py-2 pr-3 font-semibold text-right">This</th>
                          <th className="py-2 pr-3 font-semibold text-right">Δ</th>
                          <th className="py-2 font-semibold text-right">Δ%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((d) => {
                          const fmt = METRIC_ROWS.find((m) => m.metric === d.metric)?.format || ((v: number) => String(v));
                          const better = d.regression ? false : true;
                          return (
                            <tr key={d.metric} className="border-b border-hairline-subtle last:border-b-0">
                              <td className="py-2 pr-3 text-text-primary">{d.label}</td>
                              <td className="py-2 pr-3 text-right text-text-muted">{fmt(d.previous)}</td>
                              <td className="py-2 pr-3 text-right text-text-primary font-semibold">{fmt(d.current)}</td>
                              <td
                                className={`py-2 pr-3 text-right font-semibold ${
                                  d.delta > 0 ? 'text-state-warning' : d.delta < 0 ? 'text-state-success' : 'text-text-muted'
                                }`}
                              >
                                {d.delta > 0 ? '+' : ''}
                                {fmt(d.delta)}
                              </td>
                              <td
                                className={`py-2 text-right font-semibold ${
                                  d.regression ? 'text-state-warning' : 'text-state-success'
                                }`}
                              >
                                {d.delta_pct != null ? `${d.delta_pct > 0 ? '+' : ''}${d.delta_pct.toFixed(2)}%` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 font-mono text-xs text-text-disabled">
                    Δ% is relative to the previous release. For these metrics lower is better — a warning-coloured Δ means a
                    regression.
                  </p>
                </div>
              );
            })
          ) : (
            <p className="p-5 font-mono text-xs text-text-muted">No delta rows in the committed stats.json.</p>
          )}
        </section>

        {/* ── Series charts ───────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="font-mono text-sm font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            Trends across releases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartSeries.map((c) => (
              <BenchmarkChart
                key={c.key}
                title={c.title}
                points={series[c.key] || []}
                formatValue={c.format}
                hint={c.hint}
              />
            ))}
          </div>
        </section>

        {/* ── Head-to-head: gtm vs cliamp ─────────────────────────── */}
        <section className="rounded-xl border border-hairline-outline bg-surface-container overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-subtle flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-secondary" />
            <h2 className="font-mono text-sm font-bold text-text-primary">gtm vs cliamp</h2>
          </div>
          <div className="p-5">
            {Array.from(fixtures.entries()).map(([fixture, entries]) => {
              const gtmRun = entries.find((e) => e.player === 'gtm')?.run;
              const cliampRun = entries.find((e) => e.player === 'cliamp')?.run;

              if (gtmRun && cliampRun) {
                return (
                  <div key={fixture} className="space-y-3">
                    <div className="font-mono text-xs uppercase tracking-wider text-text-muted">
                      fixture <span className="text-secondary font-bold">{fixture}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-hairline-outline text-text-muted uppercase text-xs">
                            <th className="py-2 pr-3 font-semibold">Metric</th>
                            <th className="py-2 pr-3 font-semibold text-right">gtm</th>
                            <th className="py-2 pr-3 font-semibold text-right">cliamp</th>
                            <th className="py-2 pr-3 font-semibold text-right">gtm − cliamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRIC_ROWS.map((m) => {
                            const g = getRunMetric(gtmRun, m.metric);
                            const c = getRunMetric(cliampRun, m.metric);
                            const diff = g - c;
                            const pct = c !== 0 ? ((diff / c) * 100).toFixed(1) : '—';
                            const better = diff < 0; // lower is better; gtm wins if negative
                            return (
                              <tr key={m.metric} className="border-b border-hairline-subtle last:border-b-0">
                                <td className="py-2 pr-3 text-text-primary">{m.label}</td>
                                <td className="py-2 pr-3 text-right text-text-primary font-semibold">{m.format(g)}</td>
                                <td className="py-2 pr-3 text-right text-text-muted">{m.format(c)}</td>
                                <td
                                  className={`py-2 text-right font-semibold ${
                                    diff === 0 ? 'text-text-muted' : better ? 'text-state-success' : 'text-state-warning'
                                  }`}
                                >
                                  {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${m.format(Math.abs(diff))} (${pct}%)`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="font-mono text-xs text-text-disabled">
                      Lower is better — a green gtm−cliamp delta means gtm used less of that resource.
                    </p>
                  </div>
                );
              }
              return (
                <p key={fixture} className="font-mono text-xs text-text-muted">
                  <span className="text-text-primary">{entries.map((e) => e.player).join(', ')}</span> runs recorded for{' '}
                  <span className="text-secondary">{fixture}</span>. {gtmRun && !cliampRun && 'cliamp data appears here when the harness records reference runs (CLIAMP_BIN set) — the harness serialises the two players against the same sealed fixture.'}
                </p>
              );
            })}
          </div>
        </section>

        {/* ── Current run details ─────────────────────────────────── */}
        <section className="rounded-xl border border-hairline-outline bg-surface-container overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-subtle flex items-center gap-2">
            <Gauge className="w-4 h-4 text-secondary" />
            <h2 className="font-mono text-sm font-bold text-text-primary">Current run</h2>
            <span className="ml-auto font-mono text-xs text-text-muted">commit {shortTag(run.tag)} · {run.date ? formatDate(run.date) : ''}</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {METRIC_ROWS.map((m) => {
                const g = gtmFlac ? getRunMetric(gtmFlac, m.metric) : 0;
                const mp3 = gtmMp3 ? getRunMetric(gtmMp3, m.metric) : 0;
                return (
                  <div key={m.metric} className="rounded-lg bg-surface-elevated border border-hairline-outline p-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-muted mb-1">
                      {m.metric === 'peak_rss_kb' || m.metric === 'mean_rss_kb' || m.metric === 'rss_5s_kb' ? (
                        <MemoryStick className="w-3 h-3" />
                      ) : m.metric === 'cpu_ms' ? (
                        <Cpu className="w-3 h-3" />
                      ) : (
                        <Gauge className="w-3 h-3" />
                      )}
                      {m.label}
                    </div>
                    <div className="font-mono text-lg font-bold text-text-primary">{m.format(g)}</div>
                    <div className="font-mono text-xs text-text-disabled">FLAC · mp3 {m.format(mp3)}</div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline-outline text-text-muted uppercase text-xs">
                    <th className="py-2 pr-3 font-semibold">Player / Fixture</th>
                    <th className="py-2 pr-3 font-semibold text-right">Peak RSS</th>
                    <th className="py-2 pr-3 font-semibold text-right">Mean RSS</th>
                    <th className="py-2 pr-3 font-semibold text-right">RSS @5s</th>
                    <th className="py-2 pr-3 font-semibold text-right">CPU</th>
                    <th className="py-2 pr-3 font-semibold text-right">Ready</th>
                    <th className="py-2 font-semibold text-right">Fixture SHA</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(runs).map(([key, r]) => {
                    const { player, fixture } = parseRunKey(key);
                    return (
                      <tr key={key} className="border-b border-hairline-subtle last:border-b-0">
                        <td className="py-2 pr-3 text-text-primary">
                          <span className="text-secondary font-bold">{player}</span>
                          <span className="text-text-disabled"> / </span>
                          {fixture}
                        </td>
                        <td className="py-2 pr-3 text-right text-text-body">{formatKb(r.peak_rss_kb)}</td>
                        <td className="py-2 pr-3 text-right text-text-body">{formatKb(r.mean_rss_kb)}</td>
                        <td className="py-2 pr-3 text-right text-text-body">{formatKb(r.rss_5s_kb)}</td>
                        <td className="py-2 pr-3 text-right text-text-body">{formatMs(r.cpu_ms)}</td>
                        <td className="py-2 pr-3 text-right text-text-body">{formatMs(r.t_ready_ms)}</td>
                        <td className="py-2 text-right text-text-disabled" title={r.file_sha256}>
                          {r.file_sha256.slice(0, 8)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="font-mono text-xs text-text-disabled leading-relaxed">
              Metrics (per /proc/&lt;pid&gt;): peak / mean / at-5s RSS (VmRSS), CPU (utime+stime), and t_ready (IPC round
              trip to first playing state). Fixture hashes are sealed so a corrupted fixture fails the run loudly — see the{' '}
              <a
                href="https://github.com/prjctimg/gtm.rs/blob/dev/BENCHMARK.md"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-primary underline decoration-secondary/40 underline-offset-2"
              >
                benchmark README
              </a>{' '}
              for the full methodology.
            </p>
          </div>
        </section>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" />
            Data: <span className="text-text-muted">src/data/benchmark-stats.json</span> (from gtm.rs{' '}
            <code className="px-1 rounded bg-surface-elevated border border-hairline-outline">stats.json</code>)
          </span>
          <Link to="/docs/overview" className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            ← Back to docs
          </Link>
        </div>
      </div>
    </div>
  );
};