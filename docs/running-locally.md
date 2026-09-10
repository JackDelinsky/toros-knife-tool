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

Paste this whole block. It finds the repo wherever it already is, clones it if
there is none yet, and starts the server — so there is no path to fill in and
nothing to get wrong:

```powershell
$repo = Get-ChildItem $HOME -Filter toros-knife-tool -Directory -Recurse -Depth 4 -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
if (-not $repo) {
  Set-Location "$HOME\Documents"
  git clone https://github.com/JackDelinsky/toros-knife-tool.git
  $repo = "$HOME\Documents\toros-knife-tool"
}
Set-Location $repo
"Using: $repo"
git fetch origin
git checkout claude/toros-knife-repo-review-30n7f6
git pull
npm install
npm run dev
```

It prints the folder it chose, so you can tell whether it found an existing
clone or made a new one.

**Run it from the project folder, not from `C:\Users\<you>`.** Both `git` and
`npm` act on the current directory and neither one goes looking: in a home
folder they report `not a git repository` and `Could not read package.json`,
which is what "the commands do not work" almost always turns out to be. The
block above handles that by moving you there first.

**Restart the server after pulling.** `next.config.ts` and `package.json` are
only read at startup, so a running server will not pick up changes to either
— and one of them carries the setting that lets the page become interactive.

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
