import { pgTable, foreignKey, varchar, text, numeric, boolean, timestamp, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cashFlowEntries = pgTable("cash_flow_entries", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	type: text().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text().notNull(),
	category: text().notNull(),
	categoryId: varchar("category_id"),
	productId: varchar("product_id"),
	quantity: numeric({ precision: 10, scale:  3 }),
	costPrice: numeric("cost_price", { precision: 10, scale:  2 }),
	paymentStatus: text("payment_status").default('paid').notNull(),
	customerId: varchar("customer_id"),
	photoEvidence: text("photo_evidence"),
	notes: text(),
	isManualEntry: boolean("is_manual_entry").default(true).notNull(),
	saleId: varchar("sale_id"),
	storeId: varchar("store_id").notNull(),
	userId: varchar("user_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [cashFlowCategories.id],
			name: "cash_flow_entries_category_id_cash_flow_categories_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "cash_flow_entries_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cash_flow_entries_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "cash_flow_entries_sale_id_sales_id_fk"
		}),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "cash_flow_entries_store_id_stores_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cash_flow_entries_user_id_users_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	sku: text().notNull(),
	barcode: text(),
	description: text(),
	categoryId: varchar("category_id"),
	supplierId: varchar("supplier_id"),
	purchasePrice: numeric("purchase_price", { precision: 10, scale:  2 }).notNull(),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }).notNull(),
	stock: numeric({ precision: 10, scale:  3 }).default('0').notNull(),
	minStockLevel: numeric("min_stock_level", { precision: 10, scale:  3 }).default('5').notNull(),
	brand: text(),
	storeId: varchar("store_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "products_store_id_stores_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "products_supplier_id_suppliers_id_fk"
		}),
	unique("products_sku_unique").on(table.sku),
]);

export const inventoryMovements = pgTable("inventory_movements", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	productId: varchar("product_id").notNull(),
	type: text().notNull(),
	quantity: numeric({ precision: 10, scale:  3 }).notNull(),
	reason: text().notNull(),
	userId: varchar("user_id").notNull(),
	storeId: varchar("store_id").notNull(),
	movementDate: timestamp("movement_date", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "inventory_movements_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "inventory_movements_store_id_stores_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "inventory_movements_user_id_users_id_fk"
		}),
]);

export const sales = pgTable("sales", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	customerId: varchar("customer_id"),
	userId: varchar("user_id").notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	tax: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	discount: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	paymentMethod: text("payment_method").notNull(),
	status: text().default('completed').notNull(),
	storeId: varchar("store_id").notNull(),
	saleDate: timestamp("sale_date", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "sales_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "sales_store_id_stores_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sales_user_id_users_id_fk"
		}),
]);

export const saleItems = pgTable("sale_items", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	saleId: varchar("sale_id").notNull(),
	productId: varchar("product_id").notNull(),
	quantity: numeric({ precision: 10, scale:  3 }).notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "sale_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_items_sale_id_sales_id_fk"
		}),
]);

export const customers = pgTable("customers", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text(),
	phone: text(),
	address: text(),
	loyaltyPoints: integer("loyalty_points").default(0).notNull(),
	storeId: varchar("store_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "customers_store_id_stores_id_fk"
		}),
]);

export const subscriptionPayments = pgTable("subscription_payments", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	subscriptionId: varchar("subscription_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('IDR').notNull(),
	status: text().default('pending').notNull(),
	paymentMethod: text("payment_method"),
	externalPaymentId: text("external_payment_id"),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [userSubscriptions.id],
			name: "subscription_payments_subscription_id_user_subscriptions_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	storeId: varchar("store_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "categories_store_id_stores_id_fk"
		}),
]);

export const stores = pgTable("stores", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	address: text(),
	phone: text(),
	email: text(),
	description: text(),
	ownerId: varchar("owner_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "stores_owner_id_users_id_fk"
		}),
]);

export const userSubscriptions = pgTable("user_subscriptions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	planId: varchar("plan_id").notNull(),
	status: text().default('pending').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow().notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	autoRenew: boolean("auto_renew").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "user_subscriptions_plan_id_subscription_plans_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_subscriptions_user_id_users_id_fk"
		}),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('IDR').notNull(),
	interval: text().default('monthly').notNull(),
	maxStores: integer("max_stores").default(1).notNull(),
	maxUsers: integer("max_users").default(5).notNull(),
	features: text().array().default(["RAY"]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text(),
	address: text(),
	contactPerson: text("contact_person"),
	storeId: varchar("store_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "suppliers_store_id_stores_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	role: text().default('kasir').notNull(),
	storeId: varchar("store_id"),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const cashFlowCategories = pgTable("cash_flow_categories", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	description: text(),
	storeId: varchar("store_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "cash_flow_categories_store_id_stores_id_fk"
		}),
]);
