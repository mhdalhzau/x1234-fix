import { relations } from "drizzle-orm/relations";
import { cashFlowCategories, cashFlowEntries, customers, products, sales, stores, users, categories, suppliers, inventoryMovements, saleItems, userSubscriptions, subscriptionPayments, subscriptionPlans } from "./schema";

export const cashFlowEntriesRelations = relations(cashFlowEntries, ({one}) => ({
	cashFlowCategory: one(cashFlowCategories, {
		fields: [cashFlowEntries.categoryId],
		references: [cashFlowCategories.id]
	}),
	customer: one(customers, {
		fields: [cashFlowEntries.customerId],
		references: [customers.id]
	}),
	product: one(products, {
		fields: [cashFlowEntries.productId],
		references: [products.id]
	}),
	sale: one(sales, {
		fields: [cashFlowEntries.saleId],
		references: [sales.id]
	}),
	store: one(stores, {
		fields: [cashFlowEntries.storeId],
		references: [stores.id]
	}),
	user: one(users, {
		fields: [cashFlowEntries.userId],
		references: [users.id]
	}),
}));

export const cashFlowCategoriesRelations = relations(cashFlowCategories, ({one, many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	store: one(stores, {
		fields: [cashFlowCategories.storeId],
		references: [stores.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	sales: many(sales),
	store: one(stores, {
		fields: [customers.storeId],
		references: [stores.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id]
	}),
	supplier: one(suppliers, {
		fields: [products.supplierId],
		references: [suppliers.id]
	}),
	inventoryMovements: many(inventoryMovements),
	saleItems: many(saleItems),
}));

export const salesRelations = relations(sales, ({one, many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	customer: one(customers, {
		fields: [sales.customerId],
		references: [customers.id]
	}),
	store: one(stores, {
		fields: [sales.storeId],
		references: [stores.id]
	}),
	user: one(users, {
		fields: [sales.userId],
		references: [users.id]
	}),
	saleItems: many(saleItems),
}));

export const storesRelations = relations(stores, ({one, many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	products: many(products),
	inventoryMovements: many(inventoryMovements),
	sales: many(sales),
	customers: many(customers),
	categories: many(categories),
	user: one(users, {
		fields: [stores.ownerId],
		references: [users.id]
	}),
	suppliers: many(suppliers),
	cashFlowCategories: many(cashFlowCategories),
}));

export const usersRelations = relations(users, ({many}) => ({
	cashFlowEntries: many(cashFlowEntries),
	inventoryMovements: many(inventoryMovements),
	sales: many(sales),
	stores: many(stores),
	userSubscriptions: many(userSubscriptions),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	products: many(products),
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({one, many}) => ({
	products: many(products),
	store: one(stores, {
		fields: [suppliers.storeId],
		references: [stores.id]
	}),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({one}) => ({
	product: one(products, {
		fields: [inventoryMovements.productId],
		references: [products.id]
	}),
	store: one(stores, {
		fields: [inventoryMovements.storeId],
		references: [stores.id]
	}),
	user: one(users, {
		fields: [inventoryMovements.userId],
		references: [users.id]
	}),
}));

export const saleItemsRelations = relations(saleItems, ({one}) => ({
	product: one(products, {
		fields: [saleItems.productId],
		references: [products.id]
	}),
	sale: one(sales, {
		fields: [saleItems.saleId],
		references: [sales.id]
	}),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({one}) => ({
	userSubscription: one(userSubscriptions, {
		fields: [subscriptionPayments.subscriptionId],
		references: [userSubscriptions.id]
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one, many}) => ({
	subscriptionPayments: many(subscriptionPayments),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [userSubscriptions.planId],
		references: [subscriptionPlans.id]
	}),
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	userSubscriptions: many(userSubscriptions),
}));