param(
    [string]$outputPath,
    $useDialog = $false
)

try {
    # Parse useDialog since PowerShell CLI binds it as a string when called via -File
    $useDialogBool = ($useDialog -eq "true" -or $useDialog -eq "1" -or $useDialog -eq $true -or $useDialog -eq "$true")

    # WIA Format GUID for PNG
    $wiaFormatPNG = "{B96B3CAF-0728-11D3-9D7B-0000F81EF32E}"

    # Ensure parent directory of output path exists
    $parentDir = Split-Path $outputPath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    # Delete output file if it already exists to avoid WIA overwrite error
    if (Test-Path $outputPath) {
        Remove-Item $outputPath -Force | Out-Null
    }

    if ($useDialogBool) {
        # Show standard Windows Common Dialog for scanning
        $dlg = New-Object -ComObject WIA.CommonDialog
        
        # ShowAcquireImage(WiaDeviceType DeviceType, WiaImageIntent ImageIntent, WiaImageBias ImageBias, BSTR FormatID, VARIANT_BOOL AlwaysSelectDevice, VARIANT_BOOL UseCommonUI, VARIANT_BOOL CancelError)
        # DeviceType: 1 (Scanner)
        # Intent: 0 (Unspecified / Let user choose)
        # Bias: 0 (Default)
        # FormatID: PNG GUID
        # AlwaysSelectDevice: $false (only prompt if multiple scanners exist)
        # UseCommonUI: $true
        # CancelError: $true (throws COM exception if user cancels, so we catch it)
        $image = $dlg.ShowAcquireImage(1, 0, 0, $wiaFormatPNG, $false, $true, $true)
        
        if ($null -eq $image) {
            Write-Error "El escaneo fue cancelado o no se pudo obtener la imagen."
            exit 3
        }

        # Convert to PNG using ImageProcess filter if scanner returned another format
        if ($image.FormatID -ne $wiaFormatPNG) {
            $imageProcess = New-Object -ComObject WIA.ImageProcess
            $imageProcess.Filters.Add($imageProcess.FilterInfos.Item("Convert").FilterID) | Out-Null
            $imageProcess.Filters.Item(1).Properties.Item("FormatID").Value = $wiaFormatPNG
            $image = $imageProcess.Apply($image)
        }

        $image.SaveFile($outputPath)
        Write-Host "SUCCESS"
        exit 0
    } else {
        # Silent automated scan using the first scanner
        $deviceManager = New-Object -ComObject WIA.DeviceManager
        $scanner = $null
        
        foreach ($info in $deviceManager.DeviceInfos) {
            if ($info.Type -eq 1) {
                $scanner = $info.Connect()
                break
            }
        }
        
        if ($null -eq $scanner) {
            Write-Error "No se detectó ningún escáner conectado."
            exit 2
        }
        
        $item = $scanner.Items.Item(1)
        
        # Try to force Color Intent (1 = Color, 2 = Grayscale, 4 = Black & White)
        try {
            $item.Properties.Item("6146").Value = 1
        } catch {
            # Ignore if setting properties is not supported by the scanner driver
        }

        # Transfer image directly as PNG
        $image = $item.Transfer($wiaFormatPNG)
        
        # Convert to PNG if transfer yielded another format
        if ($image.FormatID -ne $wiaFormatPNG) {
            $imageProcess = New-Object -ComObject WIA.ImageProcess
            $imageProcess.Filters.Add($imageProcess.FilterInfos.Item("Convert").FilterID) | Out-Null
            $imageProcess.Filters.Item(1).Properties.Item("FormatID").Value = $wiaFormatPNG
            $image = $imageProcess.Apply($image)
        }
        
        $image.SaveFile($outputPath)
        Write-Host "SUCCESS"
        exit 0
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
