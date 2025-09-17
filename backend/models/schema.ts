import { pgTable, text, varchar, integer, boolean, timestamp, decimal, uuid, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Tenants table - business customers of the POS system
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  status: text("status", { enum: ["trial", "active", "suspended", "expired"] }).notNull().default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionId: uuid("subscription_id"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  maxOutlets: integer("max_outlets").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Users table - people within tenants  
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  username: varchar("username").notNull(),
  email: varchar("email").notNull().unique(),
  password: text("password_hash").notNull(),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Outlets table - stores/locations per tenant
export const outlets = pgTable("outlets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Subscription plans and packages
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Basic, Pro, Enterprise
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  interval: text("interval", { enum: ["monthly", "yearly"] }).notNull().default("monthly"),
  maxOutlets: integer("max_outlets").notNull().default(1),
  maxUsers: integer("max_users").notNull().default(5),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tenant subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  planId: uuid("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status", { enum: ["active", "expired", "cancelled", "pending"] }).notNull().default("pending"),
  startDate: timestamp("start_date").notNull().default(sql`now()`),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Available modules/features
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // POS, inventory, reports, loyalty
  displayName: text("display_name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tenant modules - which modules are enabled for each tenant
export const tenantModules = pgTable("tenant_modules", {
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  moduleId: uuid("module_id").references(() => modules.id).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  enabledAt: timestamp("enabled_at").notNull().default(sql`now()`),
  enabledBy: uuid("enabled_by").references(() => users.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tenantId, table.moduleId] }),
}));

// Billing history
export const billingHistory = pgTable("billing_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  stripeInvoiceId: text("stripe_invoice_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  paymentMethod: text("payment_method"), // bank_transfer, credit_card, etc
  status: text("status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Refresh tokens for JWT auth
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas for validation
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertOutletSchema = createInsertSchema(outlets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({ id: true, createdAt: true });

// Select schemas
export const selectTenantSchema = createSelectSchema(tenants);
export const selectUserSchema = createSelectSchema(users);
export const selectOutletSchema = createSelectSchema(outlets);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

// Types
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Outlet = typeof outlets.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type TenantModule = typeof tenantModules.$inferSelect;
export type BillingHistory = typeof billingHistory.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export type InsertTenant = typeof tenants.$inferInsert;
export type InsertUser = typeof users.$inferInsert;
export type InsertOutlet = typeof outlets.$inferInsert;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type InsertBillingHistory = typeof billingHistory.$inferInsert;