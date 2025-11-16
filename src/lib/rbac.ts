/**
 * Role-Based Access Control utilities
 */

export type MemberRole = 'owner' | 'admin' | 'member'

export interface Permission {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canInvite: boolean
  canManageMembers: boolean
  canManageTeams: boolean
  canManageSettings: boolean
}

/**
 * Get permissions for a role
 */
export function getPermissions(role: MemberRole): Permission {
  switch (role) {
    case 'owner':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManageMembers: true,
        canManageTeams: true,
        canManageSettings: true,
      }
    case 'admin':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManageMembers: true,
        canManageTeams: true,
        canManageSettings: false, // Only owner can manage org settings
      }
    case 'member':
      return {
        canView: true,
        canEdit: false, // Can only edit own secrets
        canDelete: false, // Can only delete own secrets
        canInvite: false,
        canManageMembers: false,
        canManageTeams: false,
        canManageSettings: false,
      }
  }
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  userRole: MemberRole,
  action: keyof Permission,
  isResourceOwner: boolean = false
): boolean {
  const permissions = getPermissions(userRole)

  // Members can edit/delete their own resources
  if (userRole === 'member' && isResourceOwner) {
    if (action === 'canEdit' || action === 'canDelete') {
      return true
    }
  }

  return permissions[action]
}

/**
 * Check if role can be assigned by current role
 */
export function canAssignRole(
  currentRole: MemberRole,
  targetRole: MemberRole
): boolean {
  // Only owners and admins can assign roles
  if (currentRole === 'member') {
    return false
  }

  // Only owners can assign owner role
  if (targetRole === 'owner' && currentRole !== 'owner') {
    return false
  }

  // Admins can assign admin and member roles
  // Owners can assign any role
  return true
}

/**
 * Get role hierarchy (higher number = more permissions)
 */
export function getRoleHierarchy(role: MemberRole): number {
  switch (role) {
    case 'owner':
      return 3
    case 'admin':
      return 2
    case 'member':
      return 1
  }
}

/**
 * Check if role A has higher or equal permissions than role B
 */
export function hasHigherOrEqualRole(
  roleA: MemberRole,
  roleB: MemberRole
): boolean {
  return getRoleHierarchy(roleA) >= getRoleHierarchy(roleB)
}

