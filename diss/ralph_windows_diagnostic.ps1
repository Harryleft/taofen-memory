# Ralph Windows Environment Diagnostic Tool
# Run: PowerShell -ExecutionPolicy Bypass -File .\ralph_windows_diagnostic.ps1

Write-Host "=== Ralph Windows Environment Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

$issues = @()

# Check OS Version
Write-Host "[OS Information]" -ForegroundColor Yellow
$os = Get-CimInstance -ClassName Win32_OperatingSystem
Write-Host "  Version: $($os.Caption)" -ForegroundColor White
Write-Host "  Build: $($os.BuildNumber)" -ForegroundColor White
Write-Host ""

# Check WSL2
Write-Host "[WSL2 Status]" -ForegroundColor Yellow
try {
    $wslOutput = wsl --list --verbose 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] WSL installed" -ForegroundColor Green
        Write-Host "  $wslOutput" -ForegroundColor White
    } else {
        Write-Host "  [FAIL] WSL not installed" -ForegroundColor Red
        $issues += "WSL2 not installed (recommended for full Ralph functionality)"
    }
} catch {
    Write-Host "  [FAIL] Cannot check WSL status" -ForegroundColor Red
    $issues += "WSL2 not installed (recommended for full Ralph functionality)"
}
Write-Host ""

# Check Git Bash
Write-Host "[Git Bash Status]" -ForegroundColor Yellow
$gitPaths = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "$env:ProgramFiles(x86)\Git\bin\bash.exe",
    "${env:LOCALAPPDATA}\Programs\Git\bin\bash.exe"
)
$gitBashFound = $false
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        Write-Host "  [OK] Git Bash found: $path" -ForegroundColor Green
        $gitBashFound = $true
        break
    }
}
if (-not $gitBashFound) {
    Write-Host "  [FAIL] Git Bash not installed" -ForegroundColor Red
    $issues += "Git Bash not installed (need Git for Windows)"
}
Write-Host ""

# Check Node.js
Write-Host "[Node.js Status]" -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($?) {
        Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Node.js not installed" -ForegroundColor Red
        $issues += "Node.js not installed"
    }
} catch {
    Write-Host "  [FAIL] Node.js not installed" -ForegroundColor Red
    $issues += "Node.js not installed"
}
Write-Host ""

# Check Git
Write-Host "[Git Status]" -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($?) {
        Write-Host "  [OK] Git: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Git not installed" -ForegroundColor Red
        $issues += "Git not installed"
    }
} catch {
    Write-Host "  [FAIL] Git not installed" -ForegroundColor Red
    $issues += "Git not installed"
}
Write-Host ""

# Check jq
Write-Host "[jq Status]" -ForegroundColor Yellow
try {
    $jqVersion = jq --version 2>$null
    if ($?) {
        Write-Host "  [OK] jq: $jqVersion" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] jq not installed (needed for Git Bash approach)" -ForegroundColor Yellow
        $issues += "jq not installed (needed for Git Bash approach)"
    }
} catch {
    Write-Host "  [WARN] jq not installed (needed for Git Bash approach)" -ForegroundColor Yellow
    $issues += "jq not installed (needed for Git Bash approach)"
}
Write-Host ""

# Summary
Write-Host "[Recommendations]" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "[SUCCESS] Your environment is ready for Ralph!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Recommended installation methods (in priority order):" -ForegroundColor Yellow
    Write-Host "  1. WSL2 method (recommended) - Full functionality" -ForegroundColor White
    Write-Host "  2. Git Bash method - Limited features (no tmux monitor)" -ForegroundColor White
} else {
    Write-Host "[ISSUES FOUND]" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Recommended solutions:" -ForegroundColor Yellow
    Write-Host "  1. Install WSL2 (recommended):" -ForegroundColor White
    Write-Host "     wsl --install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Install Git for Windows:" -ForegroundColor White
    Write-Host "     https://git-scm.com/download/win" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Install Node.js:" -ForegroundColor White
    Write-Host "     https://nodejs.org/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Install jq (for Git Bash method):" -ForegroundColor White
    Write-Host "     https://stedolan.github.io/jq/download/" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
