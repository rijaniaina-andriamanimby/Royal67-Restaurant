param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$ImageTag
)

$ErrorActionPreference = 'Stop'
$ComposeFile = 'docker-compose.prod.yml'
$EnvFile = '.env'
$LastGoodFile = '.last-good-image-tag'

if (-not (Test-Path $EnvFile)) { throw "Fichier .env absent. Copie .env.example et renseigne les secrets." }
if (-not (Test-Path $ComposeFile)) { throw "Fichier $ComposeFile absent." }

$PreviousTag = if (Test-Path $LastGoodFile) { (Get-Content $LastGoodFile -Raw).Trim() } else { '' }
$env:IMAGE_TAG = $ImageTag

function Invoke-Compose([string[]]$ComposeArgs) {
    & docker compose --env-file $EnvFile -f $ComposeFile @ComposeArgs
    if ($LASTEXITCODE -ne 0) { throw "docker compose a échoué: $($ComposeArgs -join ' ')" }
}

function Wait-ForApplication {
    for ($i = 0; $i -lt 24; $i++) {
        try {
            $response = Invoke-WebRequest -Uri 'http://localhost:8080/health' -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) { return $true }
        } catch { }
        Start-Sleep -Seconds 5
    }
    return $false
}

Write-Host "Déploiement de Royal67 avec le tag $ImageTag"
try {
    Invoke-Compose @('pull')
    Invoke-Compose @('up', '-d', '--remove-orphans')
    if (-not (Wait-ForApplication)) { throw 'Health check HTTP non satisfait après 120 secondes.' }
    Set-Content -Path $LastGoodFile -Value $ImageTag -NoNewline
    Write-Host "Déploiement réussi: $ImageTag" -ForegroundColor Green
} catch {
    Write-Warning "Déploiement échoué: $_"
    if ($PreviousTag) {
        Write-Warning "Rollback vers le tag précédent: $PreviousTag"
        $env:IMAGE_TAG = $PreviousTag
        try {
            Invoke-Compose @('pull')
            Invoke-Compose @('up', '-d', '--remove-orphans')
            if (-not (Wait-ForApplication)) { throw 'Le health check échoue également après rollback.' }
            Write-Host "Rollback réussi: $PreviousTag" -ForegroundColor Yellow
        } catch { Write-Warning "Échec du rollback: $_" }
    } else {
        Write-Warning 'Aucun tag précédent enregistré: rollback automatique impossible lors du premier déploiement.'
    }
    exit 1
}
