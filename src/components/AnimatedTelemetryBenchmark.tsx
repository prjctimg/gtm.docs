import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  GitCommit,
  GitBranch,
  GitPullRequest,
  ExternalLink,
  Activity,
  ArrowUpRight,
  FileCode2
} from 'lucide-react';

interface AnimatedTelemetryBenchmarkProps {
  className?: string;
  onNavigateDocs?: () => void;
}

export interface WorkflowRunItem {
  id: number;
  workflowId: number;
  workflowName: string;
  workflowFile: string;
  runNumber: number;
  status: 'completed' | 'in_progress' | 'queued' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | string | null;
  event: string;
  branch: string;
  sha: string;
  commitMessage: string;
  prTitle: string | null;
  runStartedAt?: string;
  completedAt?: string;
  durationText: string;
  updatedAt: string;
  htmlUrl: string;
  actor: string;
  actorAvatarUrl?: string;
}

const REPO_NAME = 'prjctimg/gtm.rs';

export const WORKFLOW_DEFS = [
  { id: 310822854, name: 'Release', file: 'release.yml' },
  { id: 330437544, name: 'CI', file: 'ci.yml' },
  { id: 343724156, name: 'Clippy Auto-Fix', file: 'clippy-fix.yml' },
  { id: 334221970, name: 'Update CONTRIBUTORS', file: 'contributors.yml' },
  { id: 358066982, name: 'Auto-approve workflow runs', file: 'auto-approve.yml' }
];

// 100% Real data from prjctimg/gtm.rs as current baseline
const INITIAL_WORKFLOWS: WorkflowRunItem[] = [
  {
    id: 34956321984,
    workflowId: 310822854,
    workflowName: 'Release',
    workflowFile: 'release.yml',
    runNumber: 139,
    status: 'completed',
    conclusion: 'failure',
    event: 'push',
    branch: 'dev',
    sha: '854efc5',
    commitMessage: 'feat: internal crates, alt+s parity, playback resume, spotify sync resilience',
    prTitle: null,
    runStartedAt: '2026-09-15T10:08:14Z',
    completedAt: '2026-09-15T10:17:34Z',
    durationText: '9m 20s',
    updatedAt: '2026-09-15T10:17:34Z',
    htmlUrl: 'https://github.com/prjctimg/gtm.rs/actions/runs/34956321984',
    actor: 'prjctimg',
    actorAvatarUrl: 'https://avatars.githubusercontent.com/u/104896135?v=4'
  },
  {
    id: 34956324079,
    workflowId: 330437544,
    workflowName: 'CI',
    workflowFile: 'ci.yml',
    runNumber: 260,
    status: 'completed',
    conclusion: 'failure',
    event: 'pull_request',
    branch: 'dev',
    sha: '854efc5',
    commitMessage: 'feat: internal crates, alt+s parity, playback resume, spotify sync resilience',
    prTitle: 'first public release (v0.3.0)',
    runStartedAt: '2026-09-15T10:08:15Z',
    completedAt: '2026-09-15T10:09:00Z',
    durationText: '45s',
    updatedAt: '2026-09-15T10:09:00Z',
    htmlUrl: 'https://github.com/prjctimg/gtm.rs/actions/runs/34956324079',
    actor: 'prjctimg',
    actorAvatarUrl: 'https://avatars.githubusercontent.com/u/104896135?v=4'
  },
  {
    id: 34956321922,
    workflowId: 343724156,
    workflowName: 'Clippy Auto-Fix',
    workflowFile: 'clippy-fix.yml',
    runNumber: 86,
    status: 'completed',
    conclusion: 'failure',
    event: 'push',
    branch: 'dev',
    sha: '854efc5',
    commitMessage: 'feat: internal crates, alt+s parity, playback resume, spotify sync resilience',
    prTitle: null,
    runStartedAt: '2026-09-15T10:08:14Z',
    completedAt: '2026-09-15T10:09:12Z',
    durationText: '58s',
    updatedAt: '2026-09-15T10:09:12Z',
    htmlUrl: 'https://github.com/prjctimg/gtm.rs/actions/runs/34956321922',
    actor: 'prjctimg',
    actorAvatarUrl: 'https://avatars.githubusercontent.com/u/104896135?v=4'
  },
  {
    id: 34103420792,
    workflowId: 334221970,
    workflowName: 'Update CONTRIBUTORS',
    workflowFile: 'contributors.yml',
    runNumber: 60,
    status: 'completed',
    conclusion: 'success',
    event: 'push',
    branch: 'main',
    sha: '3cd1a44',
    commitMessage: 'feat: timezone, footer, reactive, playback, lyrics, queue, palette, ci, build, clippy fixes',
    prTitle: null,
    runStartedAt: '2026-09-07T08:58:15Z',
    completedAt: '2026-09-07T08:58:25Z',
    durationText: '10s',
    updatedAt: '2026-09-07T08:58:25Z',
    htmlUrl: 'https://github.com/prjctimg/gtm.rs/actions/runs/34103420792',
    actor: 'iseeheaven',
    actorAvatarUrl: 'https://github.com/iseeheaven.png'
  },
  {
    id: 34957168031,
    workflowId: 358066982,
    workflowName: 'Auto-approve workflow runs',
    workflowFile: 'auto-approve.yml',
    runNumber: 16,
    status: 'completed',
    conclusion: 'skipped',
    event: 'workflow_run',
    branch: 'dev',
    sha: '854efc5',
    commitMessage: 'feat: internal crates, alt+s parity, playback resume, spotify sync resilience',
    prTitle: null,
    runStartedAt: '2026-09-15T10:17:36Z',
    completedAt: '2026-09-15T10:17:38Z',
    durationText: '2s',
    updatedAt: '2026-09-15T10:17:38Z',
    htmlUrl: 'https://github.com/prjctimg/gtm.rs/actions/runs/34957168031',
    actor: 'prjctimg',
    actorAvatarUrl: 'https://avatars.githubusercontent.com/u/104896135?v=4'
  }
];

const calculateDuration = (startIso?: string, endIso?: string, currentNow?: number): string => {
  if (!startIso) return '—';
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : (currentNow || Date.now());
  const diffSec = Math.max(1, Math.floor((end - start) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const remainingSec = diffSec % 60;
  if (mins < 60) {
    return `${mins}m ${remainingSec}s`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const AnimatedTelemetryBenchmark: React.FC<AnimatedTelemetryBenchmarkProps> = ({ className = '' }) => {
  const [workflows, setWorkflows] = useState<WorkflowRunItem[]>(INITIAL_WORKFLOWS);
  const [now, setNow] = useState<number>(() => Date.now());

  // Live fetch latest run for each workflow directly from GitHub Actions API
  const fetchAllWorkflows = async () => {
    try {
      const results = await Promise.all(
        WORKFLOW_DEFS.map(async (wf) => {
          try {
            const res = await fetch(
              `https://api.github.com/repos/${REPO_NAME}/actions/workflows/${wf.id}/runs?per_page=1`
            );
            if (!res.ok) return null;
            const data = await res.json();
            const runs = data.workflow_runs || [];
            if (!runs.length) return null;
            const r = runs[0];
            const headCommit = r.head_commit || {};
            const start = r.run_started_at || r.created_at;
            const end = r.status === 'completed' ? (r.updated_at || r.conclusion ? r.updated_at : undefined) : undefined;

            const actorName = r.triggering_actor?.login || r.actor?.login || 'prjctimg';
            const actorAvatarUrl =
              r.triggering_actor?.avatar_url ||
              r.actor?.avatar_url ||
              `https://github.com/${actorName}.png`;

            return {
              id: r.id,
              workflowId: wf.id,
              workflowName: wf.name,
              workflowFile: wf.file,
              runNumber: r.run_number,
              status: r.status,
              conclusion: r.conclusion,
              event: r.event,
              branch: r.head_branch || 'main',
              sha: (r.head_sha || '').slice(0, 7) || 'HEAD',
              // head_commit.message holds the actual git commit message
              commitMessage: headCommit.message || r.display_title || 'Commit',
              // display_title on pull_request is the PR Title
              prTitle: r.event === 'pull_request' ? r.display_title : null,
              runStartedAt: start,
              completedAt: end,
              durationText: calculateDuration(start, end),
              updatedAt: r.updated_at || r.created_at,
              htmlUrl: r.html_url,
              actor: actorName,
              actorAvatarUrl
            } as WorkflowRunItem;
          } catch {
            return null;
          }
        })
      );

      const updated = WORKFLOW_DEFS.map((wf, idx) => {
        const fetched = results[idx];
        return fetched || workflows[idx] || INITIAL_WORKFLOWS[idx];
      });

      setWorkflows(updated);
    } catch {
      // Gracefully maintain existing/cached state
    }
  };

  useEffect(() => {
    fetchAllWorkflows();
  }, []);

  // Ticking timer & periodic sync when any job is actively running
  useEffect(() => {
    const hasRunning = workflows.some(
      (w) => w.status === 'in_progress' || w.status === 'queued'
    );
    if (!hasRunning) return;

    // Tick every 1s for realtime duration display
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Sync from GitHub API every 10s to keep in progress status accurate
    const syncPoll = setInterval(() => {
      fetchAllWorkflows();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(syncPoll);
    };
  }, [workflows]);

  // Primary commit details from most active branch workflow (CI or Release)
  const primaryRun = workflows.find((w) => w.workflowName === 'CI') || workflows[0];
  const passedCount = workflows.filter((w) => w.conclusion === 'success').length;
  const failedCount = workflows.filter((w) => w.conclusion === 'failure').length;
  const inProgressCount = workflows.filter((w) => w.status === 'in_progress' || w.status === 'queued').length;
  const skippedCount = workflows.filter((w) => w.conclusion === 'skipped').length;

  const getWorkflowDuration = (wf: WorkflowRunItem): string => {
    const isRunning = wf.status === 'in_progress' || wf.status === 'queued';
    if (isRunning && wf.runStartedAt) {
      return calculateDuration(wf.runStartedAt, undefined, now);
    }
    return wf.durationText;
  };

  return (
    <div
      className={`bg-surface-container border border-hairline-outline rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-secondary/40 transition-colors ${className}`}
    >
      {/* Top Bar: Repo Header */}
      <div className="flex items-center justify-between border-b border-hairline-outline pb-2.5">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Activity className="w-4 h-4 text-secondary" />
          <a
            href={`https://github.com/${REPO_NAME}/actions`}
            target="_blank"
            rel="noreferrer"
            className="text-text-primary hover:text-secondary font-medium transition-colors flex items-center gap-1"
          >
            <span>{REPO_NAME}</span>
            <ArrowUpRight className="w-3 h-3 text-text-muted" />
          </a>
        </div>
        {inProgressCount > 0 && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Active run in progress
          </span>
        )}
      </div>

      {/* Real Commit Context Box: Avatar on left (slightly bigger) */}
      <div className="bg-code-canvas border border-hairline-outline rounded-lg p-3 sm:p-3.5 flex items-start gap-3">
        <img
          src={primaryRun.actorAvatarUrl || `https://github.com/${primaryRun.actor}.png`}
          alt={primaryRun.actor}
          title={`@${primaryRun.actor}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-hairline-outline bg-surface-elevated shrink-0 mt-0.5"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-hairline-outline">
              <GitBranch className="w-3 h-3 text-secondary" />
              {primaryRun.branch}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-hairline-outline">
              <GitCommit className="w-3 h-3 text-secondary" />
              {primaryRun.sha}
            </span>
          </div>

          {/* Real Git Commit Message */}
          <p
            className="font-mono text-xs sm:text-sm text-text-primary font-medium leading-snug line-clamp-1"
            title={primaryRun.commitMessage}
          >
            "{primaryRun.commitMessage}"
          </p>

          {/* Distinct PR Title (if triggered by PR) */}
          {primaryRun.prTitle && (
            <div className="flex items-center gap-1.5 pt-0.5 font-mono text-[11px] text-text-muted border-t border-hairline-outline/50">
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-text-secondary truncate font-normal" title={primaryRun.prTitle}>
                "{primaryRun.prTitle}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* All 5 Workflows Status List */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted px-1 tracking-wider">
          <span>Workflows (.github/workflows)</span>
        </div>

        <div className="divide-y divide-hairline-outline/60 border border-hairline-outline rounded-lg bg-surface-elevated/50 overflow-hidden">
          {workflows.map((wf) => {
            const isSuccess = wf.conclusion === 'success';
            const isFailure = wf.conclusion === 'failure';
            const isSkipped = wf.conclusion === 'skipped';
            const isRunning = wf.status === 'in_progress' || wf.status === 'queued';

            return (
              <a
                key={wf.workflowId}
                href={wf.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 sm:px-3.5 hover:bg-surface-elevated transition-colors group cursor-pointer"
              >
                {/* Workflow Name & File */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="shrink-0">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-state-success stroke-[2.2]" />
                    ) : isFailure ? (
                      <XCircle className="w-4 h-4 text-accent-coral stroke-[2.2]" />
                    ) : isSkipped ? (
                      <MinusCircle className="w-4 h-4 text-text-muted stroke-[2]" />
                    ) : (
                      <Activity className="w-4 h-4 text-text-muted" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-text-primary group-hover:text-secondary transition-colors">
                        {wf.workflowName}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        #{wf.runNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted truncate">
                      <FileCode2 className="w-2.5 h-2.5 text-secondary shrink-0" />
                      <span className="truncate">{wf.workflowFile}</span>
                      <span>•</span>
                      <span className="capitalize">{wf.event.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className={isRunning ? 'text-amber-300 font-semibold' : ''}>
                        {getWorkflowDuration(wf)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* External Link */}
                <div className="flex items-center gap-2 shrink-0">
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline-outline/60 font-mono text-xs text-text-muted">
        <div className="flex items-center gap-2 text-[11px] flex-wrap">
          {inProgressCount > 0 && (
            <span className="text-amber-400 font-bold">{inProgressCount} Running</span>
          )}
          {passedCount > 0 && (
            <span className="text-state-success font-medium">{passedCount} Passing</span>
          )}
          {failedCount > 0 && (
            <span className="text-accent-coral font-medium">{failedCount} Failing</span>
          )}
          {skippedCount > 0 && (
            <span className="text-text-muted">{skippedCount} Skipped</span>
          )}
          <span>• {formatRelativeTime(primaryRun.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
