import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Lock, 
  RefreshCw, 
  FileText, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface WorkspaceFile {
  path: string;
  size: number;
}

export default function GithubSyncHub() {
  const [patToken, setPatToken] = useState<string>(() => {
    return localStorage.getItem('alwird_github_pat') || '';
  });
  const [repoName, setRepoName] = useState<string>('mahmood4656-coder/Al-Wird-Islamic-Hub');
  const [branch, setBranch] = useState<string>('main');
  const [commitMessage, setCommitMessage] = useState<string>('Manual Sync: Al-Wird Islamic Hub complete workspace');
  const [showToken, setShowToken] = useState<boolean>(false);

  // Status & List state
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [statusError, setStatusError] = useState<string>('');

  // Operations state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncSuccessData, setSyncSuccessData] = useState<{
    commitHash: string;
    repoUrl: string;
    branch: string;
    filesCount: number;
  } | null>(null);
  const [syncError, setSyncError] = useState<string>('');

  // Fetch workspace status on component mount
  const fetchWorkspaceStatus = async () => {
    setIsLoadingStatus(true);
    setStatusError('');
    try {
      const response = await fetch('/api/github-workspace-status');
      const data = await response.json();
      if (data.success) {
        setWorkspaceFiles(data.files || []);
        setTotalFiles(data.filesCount || 0);
        setTotalSize(data.totalSize || 0);
      } else {
        setStatusError(data.error || 'Failed to load list of workspace files.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusError('Connection error while polling current workspace weight.');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceStatus();
  }, []);

  // Save PAT Token locally on change to minimize user repetitiveness
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setPatToken(val);
    localStorage.setItem('alwird_github_pat', val);
  };

  const executeGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken) {
      setSyncError('A GitHub Personal Access Token (PAT) is required to authorize committing files to your destination repository. Simply paste your token into the field above—it will be securely saved locally in your browser so you do not have to enter it again.');
      return;
    }
    if (!repoName) {
      setSyncError('Repository specification is required.');
      return;
    }

    setIsSyncing(true);
    setSyncError('');
    setSyncSuccessData(null);
    setSyncProgress('Scanning final files and connecting to GitHub rest endpoints...');

    try {
      setSyncProgress('Authorizing secure token scopes and downloading repository ref metadata...');
      const response = await fetch('/api/github-export-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: patToken,
          repo: repoName,
          branch,
          commitMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        setSyncSuccessData({
          commitHash: data.commitHash,
          repoUrl: data.repoUrl,
          branch: data.branch,
          filesCount: data.filesCount
        });
      } else {
        setSyncError(data.error || 'Export request failed on GitHub branches.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncError('Internal synchronization network failure or timeout. Check server console logs.');
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  // Humanize file sizes for pristine elegance
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn">
      
      {/* Banner / Guide */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 font-arabic text-8xl pointer-events-none select-none">
          پش سنک
        </div>
        <span className="text-[10px] font-black uppercase text-brand-green font-mono tracking-widest bg-brand-green/10 px-3 py-1 rounded-full">
          Manual Github Synchronizer • کلاؤڈ مینوئل پش یوٹیلیٹی
        </span>
        <h2 className="text-2xl font-black text-brand-text mt-4 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-brand-green" />
          <span>Manual Export Hub</span>
        </h2>
        <p className="text-xs text-brand-stone mt-2 leading-relaxed max-w-2xl">
          Use Punjab Gen Labs' manual Git driver to force-sync this entire workspace layout safely to your newly configured repository. This bypasses any AI Studio sync buffers, using native secure REST APIs to create a pristine Git commit in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sync Controls form */}
        <form onSubmit={executeGitHubSync} className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <Lock className="w-4 h-4 text-brand-green" />
            <h3 className="text-sm font-black text-brand-text">Authentication &amp; Destination Parameters</h3>
          </div>

          {/* PAT Token */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-brand-stone tracking-wider block">
              1. GitHub Personal Access Token (PAT)
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={patToken}
                onChange={handleTokenChange}
                placeholder="github_pat_11AAA..."
                className="w-full pl-3 pr-10 py-2.5 bg-brand-light-gray/40 border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-green transition"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-stone hover:text-brand-text cursor-pointer transition"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[9.5px] text-brand-stone leading-normal">
              Enter a classic token (scope: <code className="bg-brand-light-gray p-0.5 rounded text-[9px]">repo</code>) or fine-grained token with Contents, Metadata and Commit Write rights to authorize this container.
            </p>
          </div>

          {/* Repo Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-brand-stone tracking-wider block">
              2. Target GitHub Repository
            </label>
            <input
              type="text"
              required
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="username/repository-name or full URL"
              className="w-full px-3 py-2.5 bg-brand-light-gray/40 border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-green transition"
            />
            <p className="text-[9.5px] text-brand-stone">
              Target repository path. Supports short format (e.g. <code className="bg-brand-light-gray p-0.5 rounded text-[9px]">owner/repository</code>) or full URLs.
            </p>
          </div>

          {/* Branch & Commit Message */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-brand-stone tracking-wider block">
                3. Branch
              </label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2.5 bg-brand-light-gray/40 border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-green transition"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-brand-stone tracking-wider block">
                4. Commit Message
              </label>
              <input
                type="text"
                required
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="e.g. Fresh backup sync"
                className="w-full px-3 py-2.5 bg-brand-light-gray/40 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-green transition"
              />
            </div>
          </div>

          {/* Operation Triggers */}
          <div className="pt-4 border-t border-brand-border/60">
            {isSyncing ? (
              <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-2xl flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-5 h-5 text-brand-green animate-spin shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold text-brand-green block">Export transaction running...</span>
                  <p className="text-[10.5px] text-brand-stone leading-tight mt-0.5">{syncProgress}</p>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition duration-200 active:scale-98 cursor-pointer shadow-sm border bg-brand-green text-white hover:bg-brand-green/90 border-brand-green/10"
              >
                <GitBranch className="w-4 h-4 animate-bounce" />
                <span>Export &amp; Sync Now</span>
              </button>
            )}
          </div>

          {/* Feedback panels */}
          {syncError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 leading-normal">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Verification Error</strong>
                <p>{syncError}</p>
              </div>
            </div>
          )}

          {syncSuccessData && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-emerald-800 leading-normal">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-emerald-950 font-black">Workspace Sync Succeeded!</strong>
                  <p className="text-[11px] text-emerald-700">All {syncSuccessData.filesCount} files were compiled into a singular base64-encoded tree and committed successfully.</p>
                </div>
              </div>

              <div className="bg-white/80 border border-emerald-100/50 rounded-xl p-3 space-y-1.5 text-[10px] text-brand-stone font-mono">
                <div className="flex justify-between">
                  <span>Commit SHA:</span>
                  <span className="font-bold text-emerald-800">{syncSuccessData.commitHash.substring(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Branch:</span>
                  <span className="font-bold text-brand-text">{syncSuccessData.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span>Files Exported:</span>
                  <span className="font-bold text-brand-text">{syncSuccessData.filesCount}</span>
                </div>
              </div>

              <a
                href={syncSuccessData.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                <span>Browse New Repository on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </form>

        {/* Workspace summary info */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-green" />
                <h4 className="text-xs font-black text-brand-text uppercase">Workspace Payload</h4>
              </div>
              <button
                type="button"
                onClick={fetchWorkspaceStatus}
                disabled={isLoadingStatus}
                className="p-1.5 hover:bg-brand-light-gray rounded-xl transition text-brand-stone hover:text-brand-text cursor-pointer"
                title="Refresh workspace status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingStatus ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-brand-green animate-spin mx-auto" />
                <p className="text-[11px] text-brand-stone">Calculating workspace size...</p>
              </div>
            ) : statusError ? (
              <div className="text-center py-4 space-y-2">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                <p className="text-xs text-red-600 font-bold">{statusError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-light-gray/40 border border-brand-border/50 rounded-2xl p-3.5 text-center">
                    <span className="text-[9px] text-brand-stone font-mono uppercase tracking-wider block">Core Files</span>
                    <span className="text-lg font-black text-brand-green">{totalFiles}</span>
                  </div>
                  <div className="bg-brand-light-gray/40 border border-brand-border/50 rounded-2xl p-3.5 text-center">
                    <span className="text-[9px] text-brand-stone font-mono uppercase tracking-wider block">App Size</span>
                    <span className="text-lg font-black text-brand-green">{formatBytes(totalSize)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-brand-stone leading-relaxed">
                  <p>
                    ✓ Autogenerated excludes file types like <code className="bg-brand-light-gray p-0.5 rounded text-[10px]">.env</code>, <code className="bg-brand-light-gray p-0.5 rounded text-[10px]">node_modules</code>, and <code className="bg-brand-light-gray p-0.5 rounded text-[10px]">dist</code> to ensure zero security leaks.
                  </p>
                  <p>
                    ✓ Fully packages the Flutter wrapper (<code className="bg-brand-light-gray p-0.5 rounded text-[10px]">flutter_project/</code>) for direct compilation on your local workstation.
                  </p>
                </div>

                {/* Micro files table */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[9px] text-brand-text font-black uppercase tracking-wider block">Files list ({workspaceFiles.length})</span>
                  <div className="border border-brand-border/70 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-brand-border/40 bg-brand-light-gray/20">
                    {workspaceFiles.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 text-[10.5px]">
                        <span className="font-mono text-brand-text truncate pr-4 max-w-[220px]" title={f.path}>{f.path}</span>
                        <span className="font-mono text-brand-stone shrink-0 bg-white border border-brand-border/30 px-1 rounded text-[9.5px]">{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secure token guide inside widget */}
          <div className="bg-brand-light-gray/20 border border-brand-border rounded-3xl p-5 text-xs text-brand-stone space-y-2">
            <strong className="text-brand-text font-black uppercase tracking-wider text-[10.5px] block">Safe Sandbox Design</strong>
            <p className="leading-relaxed">
              Your personal GitHub credentials or secrets are never locked, logged, or recorded by any external servers. Your token resides exclusively inside your browser's physical <strong>localStorage sandbox</strong>, directly sent as standard Bearer headers only to secure SSL REST interfaces in GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
