# review-loop.ps1 — Review + Fix automatique toutes les 10 min pendant 2h
# Usage: powershell -ExecutionPolicy Bypass -File review-loop.ps1

$PROJECT    = "C:\Users\moume\Documents\momento"
$LOG        = "$PROJECT\review-loop.log"
$REVIEW_MD  = "$PROJECT\REVIEW.md"
$FIX_MD     = "$PROJECT\REVIEW-FIX.md"
$DURATION_H = 2
$INTERVAL_M = 10

$endTime   = (Get-Date).AddHours($DURATION_H)
$iteration = 0

function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content $LOG $line
}

Log "=== REVIEW LOOP START — runs until $($endTime.ToString('HH:mm')) ==="

while ((Get-Date) -lt $endTime) {
    $iteration++
    Log ""
    Log "━━━ ITERATION $iteration ━━━"

    # ── REVIEW ──────────────────────────────────────────────────────────────
    Log "→ Lancement review deep..."
    $reviewPrompt = @"
Tu es un expert sécurité et qualité code. Analyse en profondeur TOUS les fichiers dans src/ du projet Momento (C:\Users\moume\Documents\momento).

Focus sur :
- CRITICAL: IDOR, auth manquante, injections, data leaks, race conditions
- WARNING: N+1 Prisma, validation absente, error handling silencieux, XSS
- INFO: dead code, naming, perf mineure

Écris le résultat COMPLET dans C:\Users\moume\Documents\momento\REVIEW.md avec ce format exact :
---
status: findings
iteration: $iteration
reviewed_at: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
critical: <N>
warning: <N>
info: <N>
---

Pour chaque finding:
### [SÉVÉRITÉ] ID — Titre court
**Fichier:** chemin:ligne
**Problème:** description
**Fix:** solution concrète

Sois exhaustif. N'oublie aucun fichier.
"@

    $reviewPrompt | claude --print --cwd "$PROJECT" 2>> $LOG
    Log "✓ Review terminé"

    # ── FIX ─────────────────────────────────────────────────────────────────
    Log "→ Lancement fix automatique..."

    if (-not (Test-Path $REVIEW_MD)) {
        Log "⚠ REVIEW.md introuvable — skip fix"
    } else {
        $reviewContent = Get-Content $REVIEW_MD -Raw

        $fixPrompt = @"
Tu es un expert en correction de bugs. Lis ce rapport de review et applique TOUS les fixes CRITICAL et WARNING.

REVIEW.MD:
$reviewContent

Instructions:
1. Pour chaque finding CRITICAL ou WARNING : lis le fichier concerné, applique le fix minimal et précis
2. Ne casse rien d'existant
3. Après tous les fixes, écris C:\Users\moume\Documents\momento\REVIEW-FIX.md avec :
   - Nombre de fixes appliqués
   - Liste : [ID] fichier:ligne — description du changement

Travaille dans C:\Users\moume\Documents\momento. Commence immédiatement.
"@

        $fixPrompt | claude --print --cwd "$PROJECT" 2>> $LOG
        Log "✓ Fix terminé"
    }

    # ── WAIT ─────────────────────────────────────────────────────────────────
    $remaining = [math]::Round(($endTime - (Get-Date)).TotalMinutes, 0)
    Log "⏳ Pause $INTERVAL_M min — $remaining min restantes au total"

    if ((Get-Date).AddMinutes($INTERVAL_M) -lt $endTime) {
        Start-Sleep -Seconds ($INTERVAL_M * 60)
    } else {
        Log "Dernière itération atteinte."
        break
    }
}

Log ""
Log "=== LOOP TERMINÉ — $iteration itérations complétées ==="
Log "Résultats: $REVIEW_MD et $FIX_MD"
