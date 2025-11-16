import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Monitor, Smartphone, Globe } from 'lucide-react'

export function SecuritySettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery(
    trpc.users.getActiveSessions.queryOptions()
  )

  const { mutate: revokeSession, isPending } = useMutation(
    trpc.users.revokeSession.mutationOptions()
  )

  const handleRevokeSession = (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      revokeSession(
        { sessionId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['trpc', 'users', 'getActiveSessions'],
            })
          },
        }
      )
    }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone
    }
    return Monitor
  }

  const getDeviceName = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Device'
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    if (ua.includes('mobile') || ua.includes('android')) return 'Mobile Device'
    return 'Browser'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions. Revoke any session you don't recognize.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.userAgent)
              const deviceName = getDeviceName(session.userAgent)
              const isCurrentSession = session.id === sessions[0]?.id

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{deviceName}</p>
                        {isCurrentSession && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>
                          {session.ipAddress || 'IP address not available'}
                        </div>
                        <div>
                          Last active:{' '}
                          {new Date(session.createdAt).toLocaleString()}
                        </div>
                        {session.expiresAt && (
                          <div>
                            Expires:{' '}
                            {new Date(session.expiresAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isCurrentSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active sessions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

