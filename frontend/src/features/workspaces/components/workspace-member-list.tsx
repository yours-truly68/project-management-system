"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceMembers } from "../hooks/use-workspace-members";
import { Workspace, WorkspaceRole, WorkspaceMemberDetailed } from "../types/workspace.types";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

const inviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"] as const),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface WorkspaceMemberListProps {
  workspace: Workspace;
}

const ROLE_RANK: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export function WorkspaceMemberList({ workspace }: WorkspaceMemberListProps) {
  const { user } = useAuthStore();
  const {
    members,
    inviteMember,
    isInviting,
    removeMember,
    isRemoving,
    updateRole,
    isLoading,
  } = useWorkspaceMembers(workspace.id);

  const [inviteErrorMsg, setInviteErrorMsg] = React.useState("");
  const [inviteSuccessMsg, setInviteSuccessMsg] = React.useState("");
  const [memberErrorMsg, setMemberErrorMsg] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const actorRole = currentUserMember?.role || "MEMBER";
  const actorRank = ROLE_RANK[actorRole];

  const canInvite = actorRole === "OWNER" || actorRole === "ADMIN";

  const onInviteSubmit = async (data: InviteFormData) => {
    setInviteErrorMsg("");
    setInviteSuccessMsg("");
    try {
      await inviteMember({ email: data.email, role: data.role as WorkspaceRole });
      setInviteSuccessMsg("Member invited successfully!");
      reset();
    } catch (err: unknown) {
      setInviteErrorMsg(getErrorMessage(err));
    }
  };

  const handleRoleChange = async (member: WorkspaceMemberDetailed, newRole: WorkspaceRole) => {
    setMemberErrorMsg("");
    try {
      await updateRole({ userId: member.user_id, role: newRole });
    } catch (err: unknown) {
      setMemberErrorMsg(getErrorMessage(err));
    }
  };

  const handleRemoveMember = async (member: WorkspaceMemberDetailed) => {
    if (!confirm(`Are you sure you want to remove ${member.full_name} from the workspace?`)) return;
    setMemberErrorMsg("");
    try {
      await removeMember(member.user_id);
    } catch (err: unknown) {
      setMemberErrorMsg(getErrorMessage(err));
    }
  };

  const checkCanModify = (targetMember: WorkspaceMemberDetailed) => {
    if (targetMember.user_id === user?.id) return false; // cannot modify self
    const targetRank = ROLE_RANK[targetMember.role] || 1;
    return actorRank > targetRank;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Member Section */}
      {canInvite && (
        <div className="bg-secondary/20 rounded-xl border border-border p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground/90 font-heading">Invite Member</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Add users to your workspace by email. Admins can manage tasks, projects, and other
              members.
            </p>
          </div>

          {inviteSuccessMsg && (
            <div className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold leading-normal">
              {inviteSuccessMsg}
            </div>
          )}

          {inviteErrorMsg && (
            <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
              {inviteErrorMsg}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onInviteSubmit)}
            className="flex flex-col sm:flex-row gap-3.5 max-w-xl"
          >
            <div className="flex-1 space-y-1">
              <input
                type="email"
                placeholder="colleague@example.com"
                disabled={isInviting}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive font-medium mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="sm:w-36 space-y-1">
              <select
                disabled={isInviting}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer font-medium"
                {...register("role")}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="flex justify-center items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px] shrink-0"
            >
              {isInviting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Invite</span>
            </button>
          </form>
        </div>
      )}

      {/* Members List Section */}
      <div className="bg-secondary/20 rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground/90 font-heading">Workspace Members</h2>
          <p className="text-xs text-muted-foreground mt-1">
            A list of all users currently in this workspace and their permission roles.
          </p>
        </div>

        {memberErrorMsg && (
          <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
            {memberErrorMsg}
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden bg-background">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {members.map((member) => {
                const isSelf = member.user_id === user?.id;
                const canModify = checkCanModify(member);
                const initials = member.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={member.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[10px] text-foreground shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{member.full_name}</span>
                          {isSelf && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-primary/15 text-primary font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">@{member.username}</div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{member.email}</td>
                    <td className="p-3">
                      {canModify ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member, e.target.value as WorkspaceRole)
                          }
                          className="text-xs px-2 py-1 rounded bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer font-medium"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            member.role === "OWNER"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : member.role === "ADMIN"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {member.role}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {canModify ? (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={isRemoving}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40 font-medium select-none pr-2.5">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default WorkspaceMemberList;
