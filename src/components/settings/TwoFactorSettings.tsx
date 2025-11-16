import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, CheckCircle2, XCircle, Copy, Download } from 'lucide-react'
import QRCode from 'qrcode'

export function TwoFactorSettings() {
  const [setupStep, setSetupStep] = useState<'idle' | 'setup' | 'verify'>('idle')
  const [verificationCode, setVerificationCode] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading } = useQuery(
    trpc.users.getTwoFactorStatus.queryOptions()
  )

  const { mutate: generateSetup, isPending: isGenerating } = useMutation(
    trpc.users.generateTwoFactorSetup.mutationOptions()
  )

  const { mutate: enable2FA, isPending: isEnabling } = useMutation(
    trpc.users.enableTwoFactor.mutationOptions()
  )

  const { mutate: disable2FA, isPending: isDisabling } = useMutation(
    trpc.users.disableTwoFactor.mutationOptions()
  )

  const handleGenerateSetup = () => {
    generateSetup(undefined, {
      onSuccess: async (data) => {
        // Generate QR code image
        try {
          const qrDataUrl = await QRCode.toDataURL(data.qrCodeURL)
          setQrCodeDataUrl(qrDataUrl)
        } catch (error) {
          console.error('Error generating QR code:', error)
        }
        setBackupCodes(data.backupCodes)
        setShowBackupCodes(true)
        setSetupStep('verify')
      },
    })
  }

  const handleEnable2FA = () => {
    if (verificationCode.length !== 6) {
      return
    }

    enable2FA(
      { token: verificationCode },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['trpc', 'users', 'getTwoFactorStatus'] })
          setSetupStep('idle')
          setVerificationCode('')
          setQrCodeDataUrl(null)
        },
      }
    )
  }

  const handleDisable2FA = () => {
    const code = prompt('Enter your 6-digit verification code to disable 2FA:')
    if (!code || code.length !== 6) {
      return
    }

    disable2FA(
      { token: code },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['trpc', 'users', 'getTwoFactorStatus'] })
        },
      }
    )
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
  }

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'secretdrop-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading 2FA status...</p>
        </CardContent>
      </Card>
    )
  }

  if (status?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">2FA Enabled</p>
                <p className="text-sm text-muted-foreground">
                  Your account is secured with two-factor authentication
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isDisabling}>
              {isDisabling ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (setupStep === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the code to enable 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrCodeDataUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with an authenticator app like Google Authenticator or Authy
              </p>
            </div>
          )}

          {showBackupCodes && backupCodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Backup Codes</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  Save these backup codes in a safe place. You can use them to access your account
                  if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-background rounded">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleEnable2FA}
              disabled={verificationCode.length !== 6 || isEnabling}
              className="flex-1"
            >
              {isEnabling ? 'Enabling...' : 'Enable 2FA'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSetupStep('idle')
                setVerificationCode('')
                setQrCodeDataUrl(null)
                setBackupCodes([])
                setShowBackupCodes(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">2FA Disabled</p>
              <p className="text-sm text-muted-foreground">
                Your account is not protected with two-factor authentication
              </p>
            </div>
          </div>
          <Button onClick={handleGenerateSetup} disabled={isGenerating}>
            <Shield className="mr-2 h-4 w-4" />
            {isGenerating ? 'Setting up...' : 'Enable 2FA'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

