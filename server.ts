import express from 'express';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Helper to recursively list files to push to GitHub
function getFilesRecursively(dir: string, baseDir: string = dir): { relativePath: string; absolutePath: string }[] {
  let results: { relativePath: string; absolutePath: string }[] = [];
  let list: string[] = [];
  try {
    list = fs.readdirSync(dir);
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    return [];
  }
  
  for (const file of list) {
    const absolutePath = path.join(dir, file);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(absolutePath);
    } catch (err) {
      continue;
    }
    
    // Normalize path separators to forward slashes for Git Compatibility
    const relativePath = path.relative(baseDir, absolutePath).replace(/\\/g, '/');
    
    if (stat.isDirectory()) {
      if (
        file === 'node_modules' ||
        file === 'dist' ||
        file === '.git' ||
        file === '.idea' ||
        file === '.vscode' ||
        file === '.github' ||
        file === 'build' ||
        file === '.dart_tool'
      ) {
        continue;
      }
      results = results.concat(getFilesRecursively(absolutePath, baseDir));
    } else {
      if (
        file === '.env' ||
        file === '.DS_Store' ||
        file.endsWith('.log') ||
        file === 'package-lock.json' // exclude platform locks of 5MB or package lists if desired; keeps the api push payload lean
      ) {
        continue;
      }
      results.push({ relativePath, absolutePath });
    }
  }
  return results;
}

// Helper to parse repo owner and name from input formats
function parseRepoInput(input: string): { owner: string; name: string } {
  let clean = input.trim().replace(/^https?:\/\/github\.com\//i, '');
  clean = clean.replace(/\.git$/i, '');
  const parts = clean.split('/');
  if (parts.length >= 2) {
    return { owner: parts[0], name: parts[1] };
  }
  throw new Error('Invalid repository format. Enter "owner/repository" or paste the full GitHub URL.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support incoming JSON body payloads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Retrieves file lists and total weight of current workspace
  app.get('/api/github-workspace-status', (req, res) => {
    try {
      const workspaceRoot = process.cwd();
      const files = getFilesRecursively(workspaceRoot);
      const list = files.map(file => {
        let size = 0;
        try {
          size = fs.statSync(file.absolutePath).size;
        } catch (_) {}
        return {
          path: file.relativePath,
          size
        };
      });
      res.json({
        success: true,
        filesCount: list.length,
        totalSize: list.reduce((sum, item) => sum + item.size, 0),
        files: list
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to scan workspace files' });
    }
  });

  // Export triggers: Creates a single perfect GitHub commit transaction dynamically!
  app.post('/api/github-export-trigger', async (req, res) => {
    try {
      const { token, repo: rawRepo, branch: rawBranch = 'main', commitMessage = 'Manual export from Al-Wird Workspace' } = req.body;
      
      if (!token) {
        return res.status(400).json({ success: false, error: 'GitHub Personal Access Token (PAT) is required.' });
      }
      if (!rawRepo) {
        return res.status(400).json({ success: false, error: 'GitHub Repository is required.' });
      }

      const cleanToken = token.trim();
      const cleanRepo = rawRepo.trim();
      const branch = rawBranch.trim();

      let parsed;
      try {
        parsed = parseRepoInput(cleanRepo);
      } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message });
      }

      const { owner, name: repoName } = parsed;
      const authHeader = `Bearer ${cleanToken}`;
      
      // Sync scan
      const workspaceRoot = process.cwd();
      const files = getFilesRecursively(workspaceRoot);
      
      if (files.length === 0) {
        return res.status(400).json({ success: false, error: 'Workspace is empty.' });
      }

      // Check repo access
      const repoCheckRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Al-Wird-Manual-Exporter'
        }
      });

      if (!repoCheckRes.ok) {
        const errorText = await repoCheckRes.text();
        return res.status(repoCheckRes.status).json({ 
          success: false, 
          error: `Failed to connect with repository. Check repository path or ensure token has full repo scope. Github Response: ${errorText}`
        });
      }

      // Checking if the branch ref exists
      let refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Al-Wird-Manual-Exporter'
        }
      });

      let parentCommitSha: string | null = null;
      let parentTreeSha: string | null = null;
      let branchExists = false;

      if (!refRes.ok) {
        // Since the branch or reference doesn't exist, let's see if the repository is initialized
        // by fetching the generic repo details to identify the default branch name.
        const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Al-Wird-Manual-Exporter'
          }
        });

        if (repoInfoRes.ok) {
          const repoData = await repoInfoRes.json() as any;
          const defaultBranch = repoData.default_branch || 'main';

          // Try and get default branch reference commit SHA
          const defaultRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Al-Wird-Manual-Exporter'
            }
          });

          if (defaultRefRes.ok) {
            const defaultRefData = await defaultRefRes.json() as any;
            const sourceCommitSha = defaultRefData.object.sha;

            // Excellent: Create the requested branch pointing to this existing source commit
            const createBranchRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Al-Wird-Manual-Exporter'
              },
              body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: sourceCommitSha
              })
            });

            if (createBranchRes.ok) {
              // Successfully created requested target branch off default branch! Re-fetch ref
              refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`, {
                headers: {
                  'Authorization': authHeader,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'Al-Wird-Manual-Exporter'
                }
              });
            }
          }
        }
      }

      // If refRes is STILL not OK, it means either we failed to create it or the repo is completely empty.
      if (!refRes.ok) {
        // Since the branch or reference doesn't exist, the repository is brand new and completely empty.
        // Initialize the repository by creating README.md in the target branch using the Contents API.
        const readmeContent = Buffer.from(`# Al-Wird Islamic Hub\n\nManual workspace export synchronization.`).toString('base64');
        
        const initRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/README.md`, {
          method: 'PUT',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Al-Wird-Manual-Exporter'
          },
          body: JSON.stringify({
            message: 'Initialize repository with README.md',
            content: readmeContent,
            branch: branch
          })
        });

        if (initRes.ok) {
          // Fetch reference again now that the repository has been initialized
          refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`, {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Al-Wird-Manual-Exporter'
            }
          });
        }
      }

      if (refRes.ok) {
        const refData = await refRes.json() as any;
        parentCommitSha = refData.object.sha;
        branchExists = true;

        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentCommitSha}`, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Al-Wird-Manual-Exporter'
          }
        });
        if (commitRes.ok) {
          const commitData = await commitRes.json() as any;
          parentTreeSha = commitData.tree.sha;
        }
      } else {
        const errBody = await refRes.text();
        return res.status(500).json({
          success: false,
          error: `Could not verify or initialize branch '${branch}'. Ensure your Personal Access Token has repository write scopes and the path is valid. Github: ${errBody}`
        });
      }

      // Upload files as Blobs in serial or batches to prevent payload throttling
      const uploadedBlobs: { path: string; sha: string }[] = [];
      const uploadErrors: string[] = [];
      const batchSize = 6;

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await Promise.all(batch.map(async (file) => {
          try {
            const buffer = fs.readFileSync(file.absolutePath);
            const base64 = buffer.toString('base64');

            const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Al-Wird-Manual-Exporter'
              },
              body: JSON.stringify({
                content: base64,
                encoding: 'base64'
              })
            });

            if (!blobRes.ok) {
              const body = await blobRes.text();
              throw new Error(`Blob upload failed for ${file.relativePath}: ${body}`);
            }

            const data = await blobRes.json() as any;
            uploadedBlobs.push({
              path: file.relativePath,
              sha: data.sha
            });
          } catch (err: any) {
            console.error(err);
            uploadErrors.push(err.message || String(err));
          }
        }));
      }

      if (uploadErrors.length > 0) {
        return res.status(500).json({ 
          success: false, 
          error: `Stopped inside file uploads. Errors: ${uploadErrors.slice(0, 5).join(', ')}` 
        });
      }

      // Generate a new custom Git tree
      const treeItems = uploadedBlobs.map(blob => ({
        path: blob.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      }));

      const treeBody: any = { tree: treeItems };
      if (parentTreeSha) {
        treeBody.base_tree = parentTreeSha;
      }

      const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Al-Wird-Manual-Exporter'
        },
        body: JSON.stringify(treeBody)
      });

      if (!createTreeRes.ok) {
        const errText = await createTreeRes.text();
        return res.status(500).json({ success: false, error: `Failed to assemble Git database tree: ${errText}` });
      }

      const treeData = await createTreeRes.json() as any;
      const newTreeSha = treeData.sha;

      // Build commit
      const commitBody: any = {
        message: commitMessage,
        tree: newTreeSha
      };
      if (parentCommitSha) {
        commitBody.parents = [parentCommitSha];
      }

      const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Al-Wird-Manual-Exporter'
        },
        body: JSON.stringify(commitBody)
      });

      if (!createCommitRes.ok) {
        const errText = await createCommitRes.text();
        return res.status(500).json({ success: false, error: `Failed to record Git commit: ${errText}` });
      }

      const commitData = await createCommitRes.json() as any;
      const newCommitSha = commitData.sha;

      // Point Git Reference to the new commit
      if (branchExists) {
        const refUpdateRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Al-Wird-Manual-Exporter'
          },
          body: JSON.stringify({
            sha: newCommitSha,
            force: true
          })
        });

        if (!refUpdateRes.ok) {
          const errText = await refUpdateRes.text();
          return res.status(500).json({ success: false, error: `Failed to update branch reference: ${errText}` });
        }
      } else {
        const refCreateRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Al-Wird-Manual-Exporter'
          },
          body: JSON.stringify({
            ref: `refs/heads/${branch}`,
            sha: newCommitSha
          })
        });

        if (!refCreateRes.ok) {
          const errText = await refCreateRes.text();
          return res.status(500).json({ success: false, error: `Failed to instantiate branch ref: ${errText}` });
        }
      }

      res.json({
        success: true,
        commitHash: newCommitSha,
        repoUrl: `https://github.com/${owner}/${repoName}`,
        branch,
        filesCount: files.length
      });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message || 'Failed to trigger Git synchronization' });
    }
  });

  // Proxy endpoint to download/stream files seamlessly while bypassing CORS
  app.get('/api/download', (req, res) => {
    const fileUrl = req.query.url as string;
    const rawFileName = (req.query.filename as string) || 'audio.mp3';

    if (!fileUrl) {
      return res.status(400).send('URL query parameter is required');
    }

    // Clean filename for safety in headers
    const fileName = rawFileName.replace(/["\r\n]/g, '');

    // Setup candidate URLs to try in sequence
    const candidates: string[] = [];
    const decodedUrl = decodeURIComponent(fileUrl);
    
    // Check if the URL is trying to download Saud Al-Shuraim's Juz recitation
    // Supports various URL formats including the legacy Para%20(30).mp3 and the new 30.mp3
    const shuraimMatch = decodedUrl.match(/ParaViseQuranMp3ReciteBySaudAl-Shuraim\/(\d+)\.mp3/i) ||
                         decodedUrl.match(/SaudAlShuraimPerJuz\/(\d+)\.mp3/i) ||
                         decodedUrl.match(/quran-juz-para-1-to-30-audio-mp3-download\/(\d+)\.mp3/i) ||
                         decodedUrl.match(/para[-_]v[iy]se[-_]quran[-_]mp3[-_]recite[-_]by[-_]saud[-_]al[-_]shuraim\/(?:Para\s*\((\d+)\)|(\d+))\.mp3/i) ||
                         decodedUrl.match(/para[-_]wise[-_]quran[-_]mp3[-_]saud[-_]ash[-_]shuraim\/para\s*\((\d+)\)\.mp3/i);

    if (shuraimMatch) {
      const indexStr = shuraimMatch.find((val, idx) => idx > 0 && val !== undefined);
      if (indexStr) {
        const jNum = parseInt(indexStr, 10);
        const padded = jNum.toString().padStart(2, '0');

        // Highly redundant, verified active URLs for Saud Al-Shuraim's Juz (01.mp3 to 30.mp3)
        // 1. Primary optimized metadata (ParaViseQuranMp3ReciteBySaudAl-Shuraim)
        candidates.push(`https://archive.org/cors/ParaViseQuranMp3ReciteBySaudAl-Shuraim/${padded}.mp3`);
        candidates.push(`https://archive.org/download/ParaViseQuranMp3ReciteBySaudAl-Shuraim/${padded}.mp3`);

        // 2. High-speed duplicate metadata (quran-juz-para-1-to-30-audio-mp3-download)
        candidates.push(`https://archive.org/cors/quran-juz-para-1-to-30-audio-mp3-download/${padded}.mp3`);
        candidates.push(`https://archive.org/download/quran-juz-para-1-to-30-audio-mp3-download/${padded}.mp3`);

        // 3. High-quality lossless format (SaudAlShuraimPerJuz)
        candidates.push(`https://archive.org/cors/SaudAlShuraimPerJuz/${padded}.mp3`);
        candidates.push(`https://archive.org/download/SaudAlShuraimPerJuz/${padded}.mp3`);

        // Legacy format as fallback just in case
        candidates.push(`https://archive.org/cors/ParaViseQuranMp3ReciteBySaudAl-Shuraim/Para%20(${padded}).mp3`);
        candidates.push(`https://archive.org/download/ParaViseQuranMp3ReciteBySaudAl-Shuraim/Para%20(${padded}).mp3`);
      }
    }

    // If no candidate was pushed or match didn't apply, fall back to default handling
    if (candidates.length === 0) {
      if (fileUrl.includes('archive.org/download/')) {
        const corsUrl = fileUrl.replace('archive.org/download/', 'archive.org/cors/');
        candidates.push(corsUrl); // Preferred cached path
        candidates.push(fileUrl); // Original path as fallback
      } else if (fileUrl.includes('archive.org/cors/')) {
        candidates.push(fileUrl); // Already using cors path
        const downloadUrl = fileUrl.replace('archive.org/cors/', 'archive.org/download/');
        candidates.push(downloadUrl);
      } else {
        candidates.push(fileUrl);
      }
    }

    const maxRetriesPerUrl = 2;

    function executeFetch(urlIndex: number, retryCount: number, currentUrl: string) {
      if (urlIndex >= candidates.length) {
        console.error(`NodeProxy: All candidates failed for requested URL: ${fileUrl}`);
        if (!res.headersSent) {
          res.writeHead(503);
          res.end('Error: All backend streaming servers or cache mirrors are currently overloaded.');
        }
        return;
      }

      const isHttps = currentUrl.startsWith('https');
      const protocol = isHttps ? https : http;
      const encodedUrl = currentUrl.replace(/ /g, '%20');

      // Forward client's Range request headers
      const forwardedHeaders: Record<string, string> = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      };
      if (req.headers.range) {
        forwardedHeaders['range'] = req.headers.range;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(encodedUrl);
      } catch (parseErr: any) {
        console.error(`NodeProxy: URL parsing failed for: ${encodedUrl}`, parseErr);
        executeFetch(urlIndex + 1, 0, candidates[urlIndex + 1]);
        return;
      }

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: encodeURI(parsedUrl.pathname) + parsedUrl.search,
        method: 'GET',
        headers: forwardedHeaders,
        timeout: 10000 // 10s connection timeout for reliability
      };

      const proxyReq = protocol.request(options, (remoteRes) => {
        const statusCode = remoteRes.statusCode || 200;

        // Handle redirect
        if (statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
          const redirectUrl = remoteRes.headers.location;
          if (redirectUrl) {
            const absoluteRedirectUrl = redirectUrl.startsWith('http') 
              ? redirectUrl 
              : new URL(redirectUrl, currentUrl).toString();

            console.log(`NodeProxy: [Candidate ${urlIndex}, Attempt ${retryCount}] Following redirect to ${absoluteRedirectUrl}`);
            executeFetch(urlIndex, retryCount, absoluteRedirectUrl);
            return;
          }
        }

        // Check if server is rate limiting or failing with 5xx
        if (statusCode === 503 || statusCode === 502 || statusCode === 504 || statusCode === 429) {
          console.warn(`NodeProxy: Temporary outage/rate-limit (${statusCode}) on: ${currentUrl}`);
          
          if (retryCount < maxRetriesPerUrl) {
            const delay = (retryCount + 1) * 800; // Exponential/proportional backoff
            console.log(`NodeProxy: Retrying same candidate URL in ${delay}ms...`);
            setTimeout(() => {
              executeFetch(urlIndex, retryCount + 1, candidates[urlIndex]);
            }, delay);
          } else {
            console.log(`NodeProxy: Depleted retries for candidate. Switching to next candidate...`);
            executeFetch(urlIndex + 1, 0, candidates[urlIndex + 1]);
          }
          return;
        }

        // If other failure status
        if (statusCode !== 200 && statusCode !== 206) {
          console.error(`NodeProxy: HTTP error status ${statusCode} on: ${currentUrl}`);
          executeFetch(urlIndex + 1, 0, candidates[urlIndex + 1]);
          return;
        }

        // SUCCESS! Pipe the source response to the client
        if (remoteRes.headers['content-type']) {
          res.setHeader('Content-Type', remoteRes.headers['content-type']);
        } else {
          res.setHeader('Content-Type', 'audio/mpeg');
        }

        if (remoteRes.headers['content-range']) {
          res.setHeader('Content-Range', remoteRes.headers['content-range']);
        }
        if (remoteRes.headers['content-length']) {
          res.setHeader('Content-Length', remoteRes.headers['content-length']);
        }
        if (remoteRes.headers['accept-ranges']) {
          res.setHeader('Accept-Ranges', remoteRes.headers['accept-ranges']);
        } else {
          res.setHeader('Accept-Ranges', 'bytes');
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

        if (req.query.download === 'true') {
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        } else {
          res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
        }

        res.writeHead(statusCode);
        remoteRes.pipe(res);
      });

      proxyReq.on('error', (err: any) => {
        console.error(`NodeProxy: Base socket error on ${currentUrl}:`, err.message);
        if (retryCount < maxRetriesPerUrl) {
          setTimeout(() => {
            executeFetch(urlIndex, retryCount + 1, candidates[urlIndex]);
          }, 1000);
        } else {
          executeFetch(urlIndex + 1, 0, candidates[urlIndex + 1]);
        }
      });

      proxyReq.on('timeout', () => {
        console.warn(`NodeProxy: Request timed out on: ${currentUrl}`);
        proxyReq.destroy();
        // Socket error/destroy handler will clean up and trigger the switch/retry
      });

      proxyReq.end();
    }

    try {
      console.log(`NodeProxy: Initiated highly-resilient audio proxy for: ${fileUrl} (Range: ${req.headers.range || 'None'})`);
      executeFetch(0, 0, candidates[0]);
    } catch (err: any) {
      console.error('NodeProxy: Top-level exception occurred: ', err);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end(`Internal Error: ${err.message}`);
      }
    }
  });

  // Vite middleware for dev or Serve static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
