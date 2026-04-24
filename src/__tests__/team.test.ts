import { describe, it, expect } from "vitest";
import {
  Team,
  TeamMember,
  TeamRole,
  TeamPermission,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/types/team";
import {
  hasPermission,
  getPermissionsForRole,
  canPerformAction,
  createTeam,
  addMemberToTeam,
  createInvitation,
  logActivity,
  filterByTeam,
  isTeamOwner,
  isTeamAdmin,
  getMembersByRole,
} from "@/lib/teamUtils";

describe("Team Utilities", () => {
  describe("hasPermission", () => {
    it("should return true if member has permission", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "admin",
        joinedAt: new Date(),
        permissions: ["read", "write", "delete", "invite"],
      };
      expect(hasPermission(member, "read")).toBe(true);
      expect(hasPermission(member, "manage")).toBe(false);
    });

    it("should return false if member is undefined", () => {
      expect(hasPermission(undefined, "read")).toBe(false);
    });
  });

  describe("getPermissionsForRole", () => {
    it("should return permissions for owner role", () => {
      const permissions = getPermissionsForRole("owner");
      expect(permissions).toEqual(["read", "write", "delete", "invite", "manage"]);
    });

    it("should return permissions for viewer role", () => {
      const permissions = getPermissionsForRole("viewer");
      expect(permissions).toEqual(["read"]);
    });
  });

  describe("canPerformAction", () => {
    it("should return true if user can perform action", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "admin",
        joinedAt: new Date(),
        permissions: ["read", "write", "delete", "invite"],
      };
      expect(canPerformAction(member, "read")).toBe(true);
      expect(canPerformAction(member, "invite")).toBe(true);
      expect(canPerformAction(member, "manage")).toBe(false);
    });
  });

  describe("createTeam", () => {
    it("should create a new team", () => {
      const team = createTeam("Test Team", "user1", "Test description");
      expect(team.name).toBe("Test Team");
      expect(team.ownerId).toBe("user1");
      expect(team.description).toBe("Test description");
      expect(team.id).toBeDefined();
      expect(team.settings).toBeDefined();
    });
  });

  describe("addMemberToTeam", () => {
    it("should add member to team", () => {
      const member = addMemberToTeam("team1", "user1", "admin");
      expect(member.teamId).toBe("team1");
      expect(member.userId).toBe("user1");
      expect(member.role).toBe("admin");
      expect(member.permissions).toEqual(["read", "write", "delete", "invite"]);
    });
  });

  describe("createInvitation", () => {
    it("should create team invitation", () => {
      const invitation = createInvitation("team1", "test@example.com", "user1", "member");
      expect(invitation.teamId).toBe("team1");
      expect(invitation.email).toBe("test@example.com");
      expect(invitation.invitedBy).toBe("user1");
      expect(invitation.role).toBe("member");
      expect(invitation.status).toBe("pending");
    });
  });

  describe("logActivity", () => {
    it("should log team activity", () => {
      const activity = logActivity("team1", "user1", "created_project", { projectId: "1" });
      expect(activity.teamId).toBe("team1");
      expect(activity.userId).toBe("user1");
      expect(activity.action).toBe("created_project");
      expect(activity.details).toEqual({ projectId: "1" });
    });
  });

  describe("filterByTeam", () => {
    it("should filter data by team", () => {
      const data = [
        { id: "1", teamId: "team1" },
        { id: "2", teamId: "team2" },
        { id: "3", teamId: "team1" },
      ];
      const filtered = filterByTeam(data, "team1");
      expect(filtered).toHaveLength(2);
      expect(filtered[0].teamId).toBe("team1");
    });
  });

  describe("isTeamOwner", () => {
    it("should return true if member is owner", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "owner",
        joinedAt: new Date(),
        permissions: [],
      };
      expect(isTeamOwner(member)).toBe(true);
    });

    it("should return false if member is not owner", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "member",
        joinedAt: new Date(),
        permissions: [],
      };
      expect(isTeamOwner(member)).toBe(false);
    });
  });

  describe("isTeamAdmin", () => {
    it("should return true if member is admin", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "admin",
        joinedAt: new Date(),
        permissions: [],
      };
      expect(isTeamAdmin(member)).toBe(true);
    });

    it("should return true if member is owner", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "owner",
        joinedAt: new Date(),
        permissions: [],
      };
      expect(isTeamAdmin(member)).toBe(true);
    });

    it("should return false if member is not admin or owner", () => {
      const member: TeamMember = {
        id: "1",
        teamId: "team1",
        userId: "user1",
        role: "viewer",
        joinedAt: new Date(),
        permissions: [],
      };
      expect(isTeamAdmin(member)).toBe(false);
    });
  });

  describe("getMembersByRole", () => {
    it("should filter members by role", () => {
      const members: TeamMember[] = [
        {
          id: "1",
          teamId: "team1",
          userId: "user1",
          role: "admin",
          joinedAt: new Date(),
          permissions: [],
        },
        {
          id: "2",
          teamId: "team1",
          userId: "user2",
          role: "member",
          joinedAt: new Date(),
          permissions: [],
        },
        {
          id: "3",
          teamId: "team1",
          userId: "user3",
          role: "admin",
          joinedAt: new Date(),
          permissions: [],
        },
      ];
      const admins = getMembersByRole(members, "admin");
      expect(admins).toHaveLength(2);
    });
  });
});

describe("Team Components", () => {
  it("TeamManagement component should exist", () => {
    const TeamManagement = require("@/components/team/TeamManagement");
    expect(TeamManagement).toBeTruthy();
  });

  it("TeamDashboard component should exist", () => {
    const TeamDashboard = require("@/components/team/TeamDashboard");
    expect(TeamDashboard).toBeTruthy();
  });
});

describe("Team Types", () => {
  it("DEFAULT_ROLE_PERMISSIONS should have correct permissions", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.owner).toEqual([
      "read",
      "write",
      "delete",
      "invite",
      "manage",
    ]);
    expect(DEFAULT_ROLE_PERMISSIONS.admin).toEqual([
      "read",
      "write",
      "delete",
      "invite",
    ]);
    expect(DEFAULT_ROLE_PERMISSIONS.member).toEqual(["read", "write"]);
    expect(DEFAULT_ROLE_PERMISSIONS.viewer).toEqual(["read"]);
  });
});
