import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'

interface EmptyStateProps {
  orgId: number
  searchQuery: string
}

export function EmptyState({ orgId, searchQuery }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="max-w-xs mx-auto mb-6">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#E0E0E0"
              d="M100,0 C44.771525,0 0,44.771525 0,100 C0,155.228475 44.771525,200 100,200 C155.228475,200 200,155.228475 200,100 C200,44.771525 155.228475,0 100,0 Z"
            ></path>
            <path
              fill="#FFFFFF"
              d="M100,20 C55.81722,20 20,55.81722 20,100 C20,144.18278 55.81722,180 100,180 C144.18278,180 180,144.18278 180,100 C180,55.81722 144.18278,20 100,20 Z"
            ></path>
            <path
              fill="#4CAF50"
              d="M100,40 C66.862915,40 40,66.862915 40,100 C40,133.137085 66.862915,160 100,160 C133.137085,160 160,133.137085 160,100 C160,66.862915 133.137085,40 100,40 Z"
            ></path>
            <polyline
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="70 95 95 120 130 80"
            ></polyline>
          </svg>
        </div>
        <CardTitle className="mb-2">
          {searchQuery ? 'No secrets found' : 'No secrets yet'}
        </CardTitle>
        <CardDescription className="mb-6">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Create your first secret to get started with secure secret management.'}
        </CardDescription>
        {!searchQuery && (
          <Link to="/dashboard/secrets/create" search={{ orgId }}>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Secret
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
