import { relations } from "drizzle-orm/relations";
import { user, session, account, environment, environmentOrg, orgs, environmentTeam, teams, orgTeams, teamMembers } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	environments: many(environment),
	orgs: many(orgs),
	teams: many(teams),
	teamMembers: many(teamMembers),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const environmentRelations = relations(environment, ({one, many}) => ({
	user: one(user, {
		fields: [environment.ownerId],
		references: [user.id]
	}),
	environmentOrgs: many(environmentOrg),
	environmentTeams: many(environmentTeam),
}));

export const environmentOrgRelations = relations(environmentOrg, ({one}) => ({
	environment: one(environment, {
		fields: [environmentOrg.environmentId],
		references: [environment.id]
	}),
	org: one(orgs, {
		fields: [environmentOrg.orgId],
		references: [orgs.id]
	}),
}));

export const orgsRelations = relations(orgs, ({one, many}) => ({
	environmentOrgs: many(environmentOrg),
	user: one(user, {
		fields: [orgs.ownerId],
		references: [user.id]
	}),
	teams: many(teams),
	orgTeams: many(orgTeams),
}));

export const environmentTeamRelations = relations(environmentTeam, ({one}) => ({
	environment: one(environment, {
		fields: [environmentTeam.environmentId],
		references: [environment.id]
	}),
	team: one(teams, {
		fields: [environmentTeam.teamId],
		references: [teams.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	environmentTeams: many(environmentTeam),
	org: one(orgs, {
		fields: [teams.orgId],
		references: [orgs.id]
	}),
	user: one(user, {
		fields: [teams.ownerId],
		references: [user.id]
	}),
	orgTeams: many(orgTeams),
	teamMembers: many(teamMembers),
}));

export const orgTeamsRelations = relations(orgTeams, ({one}) => ({
	org: one(orgs, {
		fields: [orgTeams.orgId],
		references: [orgs.id]
	}),
	team: one(teams, {
		fields: [orgTeams.teamId],
		references: [teams.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	user: one(user, {
		fields: [teamMembers.userId],
		references: [user.id]
	}),
}));