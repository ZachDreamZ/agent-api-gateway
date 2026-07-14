$headers = @{Authorization='Bearer rnd_aOvGhy6G9B9PrmBXBx5DYzh2CW7K'}
$result = Invoke-RestMethod -Uri 'https://api.render.com/v1/services/srv-d9av07e7r5hc739guseg/deploys/dep-d9av1tpkh4rs73c6odn0' -Method Get -Headers $headers
# Get the deploy details including error info
$result | ConvertTo-Json -Depth 10
