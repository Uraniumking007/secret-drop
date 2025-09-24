import { relations } from "drizzle-orm/relations";
import { user, environment, environmentOrg, orgs, orgTeams, teams, secretView, environmentTeam, session, teamMembers, account, twoFactor } from "./schema";

export const environmentRelations = relations(environment, ({one, many}) => ({
	user: one(user, {
		fields: [environment.ownerId],
		references: [user.id]
	}),
	environmentOrgs: many(environmentOrg),
	secretViews: many(secretView),
	environmentTeams: many(environmentTeam),
}));

export const userRelations = relations(user, ({many}) => ({
	environments: many(environment),
	orgs: many(orgs),
	secretViews: many(secretView),
	sessions: many(session),
	teamMembers: many(teamMembers),
	accounts: many(account),
	teams: many(teams),
	twoFactors: many(twoFactor),
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
	orgTeams: many(orgTeams),
	teams: many(teams),
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

export const teamsRelations = relations(teams, ({one, many}) => ({
	orgTeams: many(orgTeams),
	environmentTeams: many(environmentTeam),
	teamMembers: many(teamMembers),
	org: one(orgs, {
		fields: [teams.orgId],
		references: [orgs.id]
	}),
	user: one(user, {
		fields: [teams.ownerId],
		references: [user.id]
	}),
}));

export const secretViewRelations = relations(secretView, ({one}) => ({
	environment: one(environment, {
		fields: [secretView.environmentId],
		references: [environment.id]
	}),
	user: one(user, {
		fields: [secretView.userId],
		references: [user.id]
	}),
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

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
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

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const twoFactorRelations = relations(twoFactor, ({one}) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id]
	}),
}));