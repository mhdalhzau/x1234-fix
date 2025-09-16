import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - defined first to avoid circular reference
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["kasir", "administrasi", "owner", "administrator"] }).notNull().default("kasir"),
  storeId: varchar("store_id"), // Nullable - users can exist without being assigned to a store
  isActive: boolean("is_active").notNull().default(true),
});

// Stores table for multi-store functionality  
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  description: text("description"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(), // Link stores to owners for quota enforcement
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  stock: decimal("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  minStockLevel: decimal("min_stock_level", { precision: 10, scale: 3 }).notNull().default("5"),
  brand: text("brand"),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "digital"] }).notNull(),
  status: text("status", { enum: ["completed", "pending", "cancelled"] }).notNull().default("completed"),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  saleDate: timestamp("sale_date").notNull().default(sql`now()`),
});

export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => sales.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  type: text("type", { enum: ["in", "out", "adjustment"] }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  reason: text("reason").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  movementDate: timestamp("movement_date").notNull().default(sql`now()`),
});

// Cash flow categories for better organization
export const cashFlowCategories = pgTable("cash_flow_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  description: text("description"),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const cashFlowEntries = pgTable("cash_flow_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  categoryId: varchar("category_id").references(() => cashFlowCategories.id),
  
  // Product integration
  productId: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  
  // Payment status and customer sync
  paymentStatus: text("payment_status", { enum: ["paid", "unpaid"] }).notNull().default("paid"),
  customerId: varchar("customer_id").references(() => customers.id),
  
  // Additional fields
  photoEvidence: text("photo_evidence"), // URL or path to uploaded photo
  notes: text("notes"),
  
  // System fields
  isManualEntry: boolean("is_manual_entry").notNull().default(true),
  saleId: varchar("sale_id").references(() => sales.id), // Link to POS sales
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull().default(sql`now()`),
});

// Subscription system tables
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  interval: text("interval", { enum: ["monthly", "yearly"] }).notNull().default("monthly"),
  maxStores: integer("max_stores").notNull().default(1),
  maxUsers: integer("max_users").notNull().default(5),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status", { enum: ["active", "expired", "cancelled", "pending"] }).notNull().default("pending"),
  startDate: timestamp("start_date").notNull().default(sql`now()`),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  // Ensure only one active subscription per user
  uniqueActiveSubscription: sql`UNIQUE (${table.userId}) WHERE ${table.status} IN ('active', 'pending')`,
  // Ensure end date is after start date
  checkDateRange: sql`CHECK (${table.endDate} > ${table.startDate})`,
}));

export const subscriptionPayments = pgTable("subscription_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  status: text("status", { enum: ["pending", "completed", "failed", "refunded"] }).notNull().default("pending"),
  paymentMethod: text("payment_method"),
  externalPaymentId: text("external_payment_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, saleDate: true });
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true });
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, movementDate: true });
export const insertCashFlowCategorySchema = createInsertSchema(cashFlowCategories).omit({ id: true });
export const insertCashFlowEntrySchema = createInsertSchema(cashFlowEntries).omit({ id: true, date: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).omit({ id: true, createdAt: true });

// Types
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type CashFlowCategory = typeof cashFlowCategories.$inferSelect;
export type InsertCashFlowCategory = z.infer<typeof insertCashFlowCategorySchema>;
export type CashFlowEntry = typeof cashFlowEntries.$inferSelect;
export type InsertCashFlowEntry = z.infer<typeof insertCashFlowEntrySchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = z.infer<typeof insertSubscriptionPaymentSchema>;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
