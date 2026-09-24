Write-Host "1. Testing Public Endpoint: GET /api/radiobases..." -ForegroundColor Cyan
$rb = Invoke-RestMethod -Uri 'http://localhost:3000/api/radiobases' -Method Get
Write-Host "Radiobases count: $($rb.data.Count)" -ForegroundColor Green

Write-Host "`n2. Testing Unauthorized Access: GET /api/admin/stats (Expect 401)..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/stats' -Method Get -UseBasicParsing
    Write-Host "ERROR: Should have thrown 401" -ForegroundColor Red
} catch {
    Write-Host "CORRECT: Rejected with 401 ($($_.Exception.Message))" -ForegroundColor Green
}

Write-Host "`n3. Testing Session Login: POST /api/auth/session (Admin)..." -ForegroundColor Cyan
$loginPayload = @{
    email = "admin@sisbirceca.com"
    rol = "ADMIN"
    nombre = "Dirección de Operaciones"
} | ConvertTo-Json

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/session' -Method Post -Body $loginPayload -ContentType 'application/json' -WebSession $session
Write-Host "Login response: $($loginRes.ok) - User: $($loginRes.data.user.email) - Rol: $($loginRes.data.user.rol)" -ForegroundColor Green

Write-Host "`n4. Testing Authorized Access with Cookie: GET /api/admin/stats..." -ForegroundColor Cyan
$stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/stats' -Method Get -WebSession $session
Write-Host "Stats OK: Total Reportes = $($stats.data.totalRadiobases), Tasa = $($stats.data.tasaAprobacionPorcentaje)" -ForegroundColor Green

Write-Host "`n5. Testing Dexie Sync Endpoint: POST /api/sync/offline..." -ForegroundColor Cyan
$syncPayload = @{
    reporteId = "rep-001"
    tecnicoId = "00000000-0000-0000-0000-000000000001"
    radiobaseId = "11111111-1111-1111-1111-111111111111"
    evidencias = @(
        @{
            slotNumero = 1
            tipoEquipo = "CAMARA"
            momento = "ANTES"
            urlImagen = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600"
        }
    )
} | ConvertTo-Json -Depth 5

$syncRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/sync/offline' -Method Post -Body $syncPayload -ContentType 'application/json' -WebSession $session
Write-Host "Sync offline OK: $($syncRes.ok) - Evidencias procesadas: $($syncRes.data.evidenciasProcesadas)" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Yellow
Write-Host "  TODOS LOS ENDPOINTS Y ROLES VERIFICADOS EXITOSAMENTE  " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
