$headers = @{Authorization='Bearer rnd_aOvGhy6G9B9PrmBXBx5DYzh2CW7K'}
$body = @{limit=50; resourceId='srv-d9av07e7r5hc739guseg'} | ConvertTo-Json
$result = Invoke-RestMethod -Uri 'https://api.render.com/v1/logs?limit=50&resourceId=srv-d9av07e7r5hc739guseg' -Method Get -Headers $headers
$result | ConvertTo-Json -Depth 10
