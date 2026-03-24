$uri = "http://localhost:3000/api/v1/upload/import-users"
$filePath = "c:\Users\Kiet\NNPTUD-S3\users-sample.xlsx"

# Create file object
$fileItem = Get-Item $filePath
$fileStream = [System.IO.File]::OpenRead($filePath)
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"

$body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="$(Split-Path $filePath -Leaf)"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

"@

$body = [System.Text.Encoding]::UTF8.GetBytes($body)
$body += $fileBytes
$body += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--")

$response = Invoke-WebRequest -Uri $uri -Method POST -ContentType $contentType -Body $body -UseBasicParsing

Write-Host "Import Result:"
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
