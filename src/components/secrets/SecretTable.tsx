import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'

type Secret = {
  id: string
  name: string
  viewCount: number
  maxViews: number | null
  expiresAt: Date | null
  burnOnRead: boolean
  orgId: number
}

interface SecretTableProps {
  secrets: Secret[]
}

export function SecretTable({ secrets }: SecretTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {secrets.map((secret) => (
          <TableRow key={secret.id}>
            <TableCell className="font-medium">{secret.name}</TableCell>
            <TableCell>
              {secret.viewCount} / {secret.maxViews || '∞'}
            </TableCell>
            <TableCell>
              {secret.expiresAt
                ? formatDistanceToNow(new Date(secret.expiresAt), {
                    addSuffix: true,
                  })
                : 'Never'}
            </TableCell>
            <TableCell>
              <Badge variant={secret.burnOnRead ? 'destructive' : 'secondary'}>
                {secret.burnOnRead ? 'Burn on read' : 'Reusable'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/secrets/${secret.id}`} search={{ orgId: secret.orgId }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
