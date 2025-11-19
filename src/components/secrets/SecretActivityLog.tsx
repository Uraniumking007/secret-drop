import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

interface SecretActivityLogProps {
    secretId: number
}

export function SecretActivityLog({ secretId }: SecretActivityLogProps) {
    const trpc = useTRPC()
    const { data, isLoading } = useQuery(
        trpc.secrets.getActivityLogs.queryOptions({
            secretId,
            limit: 50,
        })
    )

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) return null

    const { logs, tier } = data

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Activity Log</h3>
                {tier === 'free' && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Showing last 24h (Free Tier)
                    </span>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No activity recorded
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="capitalize">{log.action}</TableCell>
                                    <TableCell>
                                        {log.userId ? 'User' : 'Anonymous'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(new Date(log.accessedAt), {
                                            addSuffix: true,
                                        })}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.ipAddress || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {tier === 'free' && (
                <p className="text-xs text-muted-foreground text-center">
                    Upgrade to Pro Team to see 30 days of history.
                </p>
            )}
        </div>
    )
}
