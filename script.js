# Configuration
$API_URL = 'https://your-backend-api-endpoint.com/run-script'

# Function to Run Package Check
function Invoke-PackageCheck {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PackageId
    )

    try {
        # Validate input
        if ([string]::IsNullOrWhiteSpace($PackageId)) {
            Write-Host "Error: Please enter a valid Package Asset ID" -ForegroundColor Red
            return
        }

        # Prepare request body
        $body = @{
            packageId = $PackageId
        } | ConvertTo-Json

        # Send HTTP Request
        $response = Invoke-RestMethod -Uri $API_URL `
            -Method Post `
            -ContentType 'application/json' `
            -Body $body `
            -ErrorAction Stop

        # Process and display logs
        foreach ($log in $response.logs) {
            switch -Wildcard ($log) {
                "*[ERROR]*" { 
                    Write-Host $log -ForegroundColor Red 
                }
                "*[WARNING]*" { 
                    Write-Host $log -ForegroundColor Yellow 
                }
                default { 
                    Write-Host $log -ForegroundColor Green 
                }
            }
        }
    }
    catch {
        Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Interactive Prompt
while ($true) {
    Write-Host "Enter Package Asset ID (or 'quit' to exit):"
    $packageId = Read-Host

    if ($packageId -eq 'quit') {
        break
    }

    Invoke-PackageCheck -PackageId $packageId
}
