import { pgTable, pgSchema, index, uniqueIndex, unique, pgEnum, uuid, varchar, timestamp, jsonb, boolean, text, smallint } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const keyStatus = pgEnum("key_status", ['expired', 'invalid', 'valid', 'default'])
export const keyType = pgEnum("key_type", ['stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf'])
export const factorStatus = pgEnum("factor_status", ['verified', 'unverified'])
export const factorType = pgEnum("factor_type", ['webauthn', 'totp'])
export const aalLevel = pgEnum("aal_level", ['aal3', 'aal2', 'aal1'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['plain', 's256'])
export const equalityOp = pgEnum("equality_op", ['in', 'gte', 'gt', 'lte', 'lt', 'neq', 'eq'])
export const action = pgEnum("action", ['ERROR', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT'])

export const auth = pgSchema("auth");

export const users = auth.table("users", {
	instanceId: uuid("instance_id"),
	id: uuid("id").primaryKey().notNull(),
	aud: varchar("aud", { length: 255 }),
	role: varchar("role", { length: 255 }),
	email: varchar("email", { length: 255 }),
	encryptedPassword: varchar("encrypted_password", { length: 255 }),
	emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true, mode: 'string' }),
	invitedAt: timestamp("invited_at", { withTimezone: true, mode: 'string' }),
	confirmationToken: varchar("confirmation_token", { length: 255 }),
	confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true, mode: 'string' }),
	recoveryToken: varchar("recovery_token", { length: 255 }),
	recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true, mode: 'string' }),
	emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
	emailChange: varchar("email_change", { length: 255 }),
	emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true, mode: 'string' }),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: 'string' }),
	rawAppMetaData: jsonb("raw_app_meta_data"),
	rawUserMetaData: jsonb("raw_user_meta_data"),
	isSuperAdmin: boolean("is_super_admin"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	phone: text("phone").default(sql`NULL::character varying`),
	phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true, mode: 'string' }),
	phoneChange: text("phone_change").default(sql`''::character varying`),
	phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(sql`''::character varying`),
	phoneChangeSentAt: timestamp("phone_change_sent_at", { withTimezone: true, mode: 'string' }),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: 'string' }),
	emailChangeTokenCurrent: varchar("email_change_token_current", { length: 255 }).default(sql`''::character varying`),
	emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
	bannedUntil: timestamp("banned_until", { withTimezone: true, mode: 'string' }),
	reauthenticationToken: varchar("reauthentication_token", { length: 255 }).default(sql`''::character varying`),
	reauthenticationSentAt: timestamp("reauthentication_sent_at", { withTimezone: true, mode: 'string' }),
	isSsoUser: boolean("is_sso_user").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
},
(table) => {
	return {
		instanceIdIdx: index("users_instance_id_idx").on(table.instanceId),
		instanceIdEmailIdx: index("users_instance_id_email_idx").on(table.instanceId),
		confirmationTokenIdx: uniqueIndex("confirmation_token_idx").on(table.confirmationToken),
		recoveryTokenIdx: uniqueIndex("recovery_token_idx").on(table.recoveryToken),
		emailChangeTokenCurrentIdx: uniqueIndex("email_change_token_current_idx").on(table.emailChangeTokenCurrent),
		emailChangeTokenNewIdx: uniqueIndex("email_change_token_new_idx").on(table.emailChangeTokenNew),
		reauthenticationTokenIdx: uniqueIndex("reauthentication_token_idx").on(table.reauthenticationToken),
		emailPartialKey: uniqueIndex("users_email_partial_key").on(table.email),
		isAnonymousIdx: index("users_is_anonymous_idx").on(table.isAnonymous),
		usersPhoneKey: unique("users_phone_key").on(table.phone),
	}
});