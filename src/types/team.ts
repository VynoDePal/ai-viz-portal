/**
 * Team types for multi-tenant support
 */

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export type TeamPermission = "read" | "write" | "delete" | "invite" | "manage";

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: TeamSettings;
}

export interface TeamSettings {
  allowInvitations?: boolean;
  requireApproval?: boolean;
  maxMembers?: number;
  defaultRole?: TeamRole;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  permissions: TeamPermission[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  invitedBy: string;
  role: TeamRole;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: Date;
  expiresAt: Date;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface RolePermissions {
  owner: TeamPermission[];
  admin: TeamPermission[];
  member: TeamPermission[];
  viewer: TeamPermission[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  owner: ["read", "write", "delete", "invite", "manage"],
  admin: ["read", "write", "delete", "invite"],
  member: ["read", "write"],
  viewer: ["read"],
};
