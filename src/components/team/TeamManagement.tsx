"use client";

import { useState } from "react";
import { Plus, Users, Settings, Trash2, Crown, Shield } from "lucide-react";
import {
  Team,
  TeamMember,
  TeamRole,
} from "@/types/team";
import {
  createTeam,
  addMemberToTeam,
  isTeamOwner,
  isTeamAdmin,
  getMembersByRole,
  createInvitation,
  logActivity,
} from "@/lib/teamUtils";

interface TeamManagementProps {
  teams: Team[];
  members: TeamMember[];
  currentUserId: string;
  onCreateTeam?: (team: Team) => void;
  onInviteMember?: (invitation: any) => void;
  onRemoveMember?: (memberId: string) => void;
  onDeleteTeam?: (teamId: string) => void;
}

export function TeamManagement({
  teams,
  members,
  currentUserId,
  onCreateTeam,
  onInviteMember,
  onRemoveMember,
  onDeleteTeam,
}: TeamManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      const team = createTeam(newTeamName, currentUserId, newTeamDescription);
      onCreateTeam?.(team);
      setNewTeamName("");
      setNewTeamDescription("");
      setShowCreateForm(false);
    }
  };

  const handleInviteMember = () => {
    if (selectedTeam && inviteEmail.trim()) {
      const invitation = createInvitation(
        selectedTeam.id,
        inviteEmail,
        currentUserId,
        inviteRole
      );
      onInviteMember?.(invitation);
      setInviteEmail("");
      setInviteRole("member");
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      onDeleteTeam?.(teamId);
    }
  };

  const getTeamMembers = (teamId: string) => {
    return members.filter((m) => m.teamId === teamId);
  };

  const getCurrentMember = (team: Team) => {
    return members.find((m) => m.teamId === team.id && m.userId === currentUserId);
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Team Form */}
      {showCreateForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create New Team
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter team description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Team
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const teamMembers = getTeamMembers(team.id);
          const currentMember = getCurrentMember(team);
          const canManage = currentMember && isTeamAdmin(currentMember);

          return (
            <div
              key={team.id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg cursor-pointer transition-all ${
                selectedTeam?.id === team.id ? "ring-2 ring-blue-500" : "hover:shadow-xl"
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {team.name}
                </h3>
                {canManage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTeam(team.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {team.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {team.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{teamMembers.length} members</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Team Details */}
      {selectedTeam && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedTeam.name}
            </h2>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Team Members */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Team Members
            </h3>
            <div className="space-y-2">
              {getTeamMembers(selectedTeam.id).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.userId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {isTeamOwner(getCurrentMember(selectedTeam)) && member.userId !== currentUserId && (
                    <button
                      onClick={() => onRemoveMember?.(member.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite Member */}
          {isTeamAdmin(getCurrentMember(selectedTeam)) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Invite Member
              </h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter email"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInviteMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Invite
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
