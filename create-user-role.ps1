$uri = "http://localhost:3000/api/v1/roles"
$body = @{
    name = "USER"
    description = "Regular user role"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $uri -Method POST -ContentType "application/json" -Body $body
Write-Host $response.Content
