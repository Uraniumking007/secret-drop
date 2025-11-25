import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TierBadge } from '@/components/TierBadge'

describe('TierBadge', () => {
  it('renders label and styles for each tier', () => {
    const { rerender } = render(<TierBadge tier="free" />)
    expect(screen.getByText('Free')).toBeTruthy()

    rerender(<TierBadge tier="pro_team" />)
    expect(screen.getByText('Pro Team')).toBeTruthy()

    rerender(<TierBadge tier="business" />)
    expect(screen.getByText('Business')).toBeTruthy()
  })
})
