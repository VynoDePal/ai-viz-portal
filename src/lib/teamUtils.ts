/**
 * Team utilities for multi-tenant support
 */

import {
  Team,
  TeamMember,
  TeamInvitation,
  TeamActivity,
  TeamRole,
  TeamPermission,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/types/team";

/**
 * Check if user has permission in team
 */
export function hasPermission(
  member: TeamMember | undefined,
  permission: TeamPermission
): boolean {
  if (!member) return false;
  return member.permissions.includes(permission);
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: TeamRole): TeamPermission[] {
  return DEFAULT_ROLE_PERMISSIONS[role];
}

/**
 * Check if user can perform action in team
 */
export function canPerformAction(
  member: TeamMember | undefined,
  action: string
): boolean {
  if (!member) return false;

  const roleActions: Record<TeamRole, string[]> = {
    owner: ["create", "read", "update", "delete", "invite", "remove", "manage"],
    admin: ["create", "read", "update", "delete", "invite", "remove"],
    member: ["create", "read", "update"],
    viewer: ["read"],
  };

  return roleActions[member.role].includes(action);
}

/**
 * Create a new team
 */
export function createTeam(
  name: string,
  ownerId: string,
  description?: string
): Team {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      allowInvitations: true,
      requireApproval: false,
      maxMembers: 50,
      defaultRole: "member",
    },
  };
}

/**
 * Add member to team
 */
export function addMemberToTeam(
  teamId: string,
  userId: string,
  role: TeamRole
): TeamMember {
  return {
    id: crypto.randomUUID(),
    teamId,
    userId,
    role,
    joinedAt: new Date(),
    permissions: getPermissionsForRole(role),
  };
}

/**
 * Create team invitation
 */
export function createInvitation(
  teamId: string,
  email: string,
  invitedBy: string,
  role: TeamRole
): TeamInvitation {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  return {
    id: crypto.randomUUID(),
    teamId,
    email,
    invitedBy,
    role,
    status: "pending",
    createdAt: new Date(),
    expiresAt,
  };
}

/**
 * Log team activity
 */
export function logActivity(
  teamId: string,
  userId: string,
  action: string,
  details?: Record<string, any>
): TeamActivity {
  return {
    id: crypto.randomUUID(),
    teamId,
    userId,
    action,
    details,
    timestamp: new Date(),
  };
}

/**
 * Filter data by team (data isolation)
 */
export function filterByTeam<T extends { teamId?: string }>(
  data: T[],
  teamId: string
): T[] {
  return data.filter((item) => item.teamId === teamId);
}

/**
 * Check if user is team owner
 */
export function isTeamOwner(member: TeamMember | undefined): boolean {
  return member?.role === "owner";
}

/**
 * Check if user is team admin
 */
export function isTeamAdmin(member: TeamMember | undefined): boolean {
  return member?.role === "admin" || member?.role === "owner";
}

/**
 * Get team members by role
 */
export function getMembersByRole(
  members: TeamMember[],
  role: TeamRole
): TeamMember[] {
  return members.filter((member) => member.role === role);
}
