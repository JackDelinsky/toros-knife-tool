# Running the site locally

The dev server runs on **port 3004**, not 3000.

```bash
npm install
npm run dev
```

Then open the URL the server prints as **Local** — normally
<http://localhost:3004>. If that page does not load, try
<http://127.0.0.1:3004>; see "localhost does not load" below for why.

## Windows (PowerShell)

Paste this as one block, replacing the path on the first line with wherever
you cloned the repo:

```powershell
cd C:\path\to\toros-knife-tool
git fetch origin
git checkout claude/toros-knife-repo-review-30n7f6
git pull
npm install
npm run dev
```

The path is a placeholder. `cd path\to\toros-knife-tool` typed literally will
fail with `Cannot find path`; use the real folder, e.g.
`cd $HOME\Documents\GitHub\toros-knife-tool`.

`npm run dev:reset` is a bash script and will not run in PowerShell. The
equivalent there is:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Watching changes live

`npm run dev` already hot-reloads. Leave it running in its own terminal
window and the browser updates as files change — there is no separate watch
command. Only `next.config.ts`, `package.json` and new environment variables
need a restart.

## Troubleshooting

### "This site can't be reached" / the page never loads

Work down this list; each step rules out one cause.

1. **Is the server actually running?** The terminal running `npm run dev`
   should show `✓ Ready` and a `Local:` URL. If it exited, the error is in
   that terminal, and it is the real problem — not the browser.

2. **Are you on the right branch?** A checkout still on `main` will not have
   recent work, and if the branch was never fetched the folder may not build
   at all. Check:

   ```powershell
   git rev-parse --abbrev-ref HEAD
   git log --oneline -1
   ```

3. **Right port?** 3004, not 3000. If something else already holds 3004, Next
   says so on startup and you will be looking at the wrong process.

4. **`localhost` does not load but `127.0.0.1` does.** `localhost` can resolve
   to the IPv6 address `::1` while a server bound only to IPv4 listens on
   `127.0.0.1`. Nothing is listening on the address the browser picked, so the
   connection is refused. The `dev` script no longer pins a host for exactly
   this reason, but `http://127.0.0.1:3004` remains the address that works
   regardless of how `localhost` resolves.

5. **A stale build.** Symptoms are the opposite of a dead server: the page
   loads but styles or components are missing or out of date. Delete `.next`
   and start again (see the PowerShell block above).

### Product images take a long time on first load

Expected in dev. Next optimises each image on demand, so the first visit to
`/shop` can take ten seconds or so to fill in all eighteen. They are cached
afterwards, and `npm run build` does the work ahead of time.
