# Firecrawl Local helper for Windows PowerShell.
# Usage:
#   .\firecrawl_local.ps1 check
#   .\firecrawl_local.ps1 scrape https://example.com
#   .\firecrawl_local.ps1 map https://example.com
#   .\firecrawl_local.ps1 crawl https://example.com 50 .\pages
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("check", "scrape", "map", "crawl", "serve", "health")]
  [string]$Command,
  [Parameter(Position = 1)][string]$Url,
  [Parameter(Position = 2)][int]$Limit = 50,
  [Parameter(Position = 3)][string]$OutDir = ".\pages"
)

if (-not $env:FIRECRAWL_CLOUD) { $env:FIRECRAWL_CLOUD = "auto" }

function Require-Binary {
  if (-not (Get-Command firecrawl-local -ErrorAction SilentlyContinue)) {
    Write-Error "firecrawl-local is not installed. Install Rust and Visual Studio Build Tools (Desktop development with C++), then run: cargo install firecrawl-local"
    exit 127
  }
}

switch ($Command) {
  "check" {
    Write-Output "FIRECRAWL_CLOUD=$env:FIRECRAWL_CLOUD"
    foreach ($tool in @("firecrawl-local", "cargo", "rustc", "node", "npx")) {
      $found = Get-Command $tool -ErrorAction SilentlyContinue
      if ($found) { Write-Output "$tool : $($found.Source)" } else { Write-Output "$tool : missing" }
    }
    $chrome = @(
      "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
      "$env:ProgramFiles\Chromium\Application\chrome.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($chrome) { Write-Output "chrome: $chrome" } else { Write-Output "chrome: not found in standard paths" }
    if (Get-Command firecrawl-local -ErrorAction SilentlyContinue) { firecrawl-local --version }
  }
  "scrape" {
    Require-Binary
    if (-not $Url) { Write-Error "scrape needs a URL"; exit 2 }
    firecrawl-local scrape $Url --markdown --public-only
  }
  "map" {
    Require-Binary
    if (-not $Url) { Write-Error "map needs a URL"; exit 2 }
    firecrawl-local map $Url
  }
  "crawl" {
    Require-Binary
    if (-not $Url) { Write-Error "crawl needs a URL"; exit 2 }
    firecrawl-local crawl $Url --limit $Limit --out $OutDir --public-only
  }
  "serve" {
    Require-Binary
    Write-Output "Serving Firecrawl v2 API on http://localhost:3002 (FIRECRAWL_CLOUD=$env:FIRECRAWL_CLOUD)"
    firecrawl-local serve
  }
  "health" {
    Invoke-RestMethod -Uri "http://localhost:3002/health"
  }
}
