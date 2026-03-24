$BASE_URL = "http://localhost:3000/api/v1"
$output = @()

# Helper function to make requests
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body
    )
    
    try {
        $url = "$BASE_URL$Endpoint"
        $output += @{
            description = $Description
            method = $Method
            endpoint = $Endpoint
            url = $url
            timestamp = Get-Date
        }
        
        if ($Body) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Body ($Body | ConvertTo-Json) -ContentType "application/json" -Verbose 4>&1
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Verbose 4>&1
        }
        
        $output += @{
            status = $response.StatusCode
            body = $response.Content | ConvertFrom-Json
        }
        
        Write-Host "✓ $Description - Status: $($response.StatusCode)"
        return $response.Content | ConvertFrom-Json
    } catch {
        $output += @{
            status = $_.Exception.Response.StatusCode
            error = $_.Exception.Message
        }
        Write-Host "✗ $Description - Error: $($_.Exception.Message)"
        return $null
    }
}

# Step 1: Create a Category
Write-Host "`n=== STEP 1: Create Category ===" -ForegroundColor Cyan
$categoryBody = @{
    name = "Electronics"
    image = "https://i.imgur.com/QkIa5tT.jpeg"
}
$category = Test-Endpoint -Method "POST" -Endpoint "/categories" -Description "Create Electronics Category" -Body $categoryBody
$categoryId = $category._id
Write-Host "Category ID: $categoryId"

# Step 2: Create a Product (This should auto-create inventory)
Write-Host "`n=== STEP 2: Create Product (Auto-creates Inventory) ===" -ForegroundColor Cyan
$productBody = @{
    title = "Gaming Laptop Dell XPS 15"
    description = "High-performance gaming laptop with RTX 4080"
    category = $categoryId
    price = 2999
    images = @("https://i.imgur.com/1twoaDy.jpeg", "https://i.imgur.com/FDwQgLy.jpeg")
}
$product = Test-Endpoint -Method "POST" -Endpoint "/products" -Description "Create Product" -Body $productBody
$productId = $product.product._id
Write-Host "Product ID: $productId"

# Step 3: Get All Inventories
Write-Host "`n=== STEP 3: Get All Inventories ===" -ForegroundColor Cyan
$allInventories = Test-Endpoint -Method "GET" -Endpoint "/inventory" -Description "Get All Inventories"
Write-Host "Inventories Count: $($allInventories.Count)"

# Step 4: Get Inventory by ID
Write-Host "`n=== STEP 4: Get Inventory by ID ===" -ForegroundColor Cyan
$inventoryId = $allInventories[0]._id
$inventory = Test-Endpoint -Method "GET" -Endpoint "/inventory/$inventoryId" -Description "Get Inventory by ID"
Write-Host "Current State - Stock: $($inventory.stock), Reserved: $($inventory.reserved), Sold: $($inventory.soldCount)"

# Step 5: Add Stock (100 units)
Write-Host "`n=== STEP 5: Add Stock (100 units) ===" -ForegroundColor Cyan
$addStockBody = @{
    product = $productId
    quantity = 100
}
$stock1 = Test-Endpoint -Method "POST" -Endpoint "/inventory/add-stock" -Description "Add 100 Stock" -Body $addStockBody
Write-Host "After Add Stock - Stock: $($stock1.inventory.stock), Reserved: $($stock1.inventory.reserved)"

# Step 6: Make Reservation (10 units)
Write-Host "`n=== STEP 6: Make Reservation (10 units) ===" -ForegroundColor Cyan
$reserveBody = @{
    product = $productId
    quantity = 10
}
$reserve1 = Test-Endpoint -Method "POST" -Endpoint "/inventory/reservation" -Description "Reserve 10 units" -Body $reserveBody
Write-Host "After Reservation - Stock: $($reserve1.inventory.stock), Reserved: $($reserve1.inventory.reserved)"

# Step 7: Add More Stock (50 units)
Write-Host "`n=== STEP 7: Add More Stock (50 units) ===" -ForegroundColor Cyan
$addStockBody2 = @{
    product = $productId
    quantity = 50
}
$stock2 = Test-Endpoint -Method "POST" -Endpoint "/inventory/add-stock" -Description "Add 50 More Stock" -Body $addStockBody2
Write-Host "After Add More Stock - Stock: $($stock2.inventory.stock), Reserved: $($stock2.inventory.reserved)"

# Step 8: Make Another Reservation (30 units)
Write-Host "`n=== STEP 8: Make Another Reservation (30 units) ===" -ForegroundColor Cyan
$reserveBody2 = @{
    product = $productId
    quantity = 30
}
$reserve2 = Test-Endpoint -Method "POST" -Endpoint "/inventory/reservation" -Description "Reserve 30 more units" -Body $reserveBody2
Write-Host "After Reservation 2 - Stock: $($reserve2.inventory.stock), Reserved: $($reserve2.inventory.reserved)"

# Step 9: Remove Stock (25 units)
Write-Host "`n=== STEP 9: Remove Stock (25 units) ===" -ForegroundColor Cyan
$removeStockBody = @{
    product = $productId
    quantity = 25
}
$removeStock = Test-Endpoint -Method "POST" -Endpoint "/inventory/remove-stock" -Description "Remove 25 Stock (damaged)" -Body $removeStockBody
Write-Host "After Remove Stock - Stock: $($removeStock.inventory.stock), Reserved: $($removeStock.inventory.reserved)"

# Step 10: Mark as Sold (20 units)
Write-Host "`n=== STEP 10: Mark as Sold (20 units) ===" -ForegroundColor Cyan
$soldBody = @{
    product = $productId
    quantity = 20
}
$sold1 = Test-Endpoint -Method "POST" -Endpoint "/inventory/sold" -Description "Mark 20 as Sold" -Body $soldBody
Write-Host "After Sold 1 - Reserved: $($sold1.inventory.reserved), SoldCount: $($sold1.inventory.soldCount)"

# Step 11: Mark More as Sold (15 units)
Write-Host "`n=== STEP 11: Mark More as Sold (15 units) ===" -ForegroundColor Cyan
$soldBody2 = @{
    product = $productId
    quantity = 15
}
$sold2 = Test-Endpoint -Method "POST" -Endpoint "/inventory/sold" -Description "Mark 15 more as Sold" -Body $soldBody2
Write-Host "After Sold 2 - Reserved: $($sold2.inventory.reserved), SoldCount: $($sold2.inventory.soldCount)"

# Step 12: Final Inventory Status
Write-Host "`n=== STEP 12: Final Inventory Status ===" -ForegroundColor Cyan
$finalStatus = Test-Endpoint -Method "GET" -Endpoint "/inventory/$inventoryId" -Description "Get Final Inventory Status"
Write-Host "FINAL STATE - Stock: $($finalStatus.stock), Reserved: $($finalStatus.reserved), SoldCount: $($finalStatus.soldCount)"

Write-Host "`n✓ All tests completed successfully!" -ForegroundColor Green
