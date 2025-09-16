import { 
  type Store, type InsertStore,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Supplier, type InsertSupplier,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type SaleItem, type InsertSaleItem,
  type InventoryMovement, type InsertInventoryMovement,
  type CashFlowCategory, type InsertCashFlowCategory,
  type CashFlowEntry, type InsertCashFlowEntry,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type UserSubscription, type InsertUserSubscription,
  type SubscriptionPayment, type InsertSubscriptionPayment,
  stores, users, categories, suppliers, customers, products, sales, saleItems, inventoryMovements, cashFlowCategories, cashFlowEntries, subscriptionPlans, userSubscriptions, subscriptionPayments
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';

export interface IStorage {
  // Stores
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;
  getAllStores(): Promise<Store[]>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(storeId: string): Promise<Category[]>;

  // Suppliers
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  getAllSuppliers(storeId: string): Promise<Supplier[]>;

  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  getAllCustomers(storeId: string): Promise<Customer[]>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string, storeId: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string, storeId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(storeId: string): Promise<Product[]>;
  getLowStockProducts(storeId: string): Promise<Product[]>;

  // Sales
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date, storeId: string): Promise<Sale[]>;
  getSalesByUser(userId: string, storeId: string): Promise<Sale[]>;
  getAllSales(storeId: string): Promise<Sale[]>;
  
  // Atomic sales processing
  processSaleAtomic(sale: InsertSale, items: { productId: string; quantity: number; unitPrice: string; total: string }[]): Promise<{ sale: Sale; items: SaleItem[]; error?: string }>;

  // Sale Items
  getSaleItems(saleId: string): Promise<SaleItem[]>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;

  // Inventory
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovements(productId: string, storeId: string): Promise<InventoryMovement[]>;
  updateProductStock(productId: string, quantity: number): Promise<boolean>;

  // Cash Flow Categories
  getCashFlowCategory(id: string): Promise<CashFlowCategory | undefined>;
  createCashFlowCategory(category: InsertCashFlowCategory): Promise<CashFlowCategory>;
  updateCashFlowCategory(id: string, category: Partial<InsertCashFlowCategory>, storeId: string): Promise<CashFlowCategory | undefined>;
  deleteCashFlowCategory(id: string, storeId: string): Promise<boolean>;
  getAllCashFlowCategories(storeId: string): Promise<CashFlowCategory[]>;
  getCashFlowCategoriesByType(type: 'income' | 'expense', storeId: string): Promise<CashFlowCategory[]>;

  // Enhanced Cash Flow
  createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry>;
  updateCashFlowEntry(id: string, entry: Partial<InsertCashFlowEntry>, storeId: string): Promise<CashFlowEntry | undefined>;
  deleteCashFlowEntry(id: string, storeId: string): Promise<boolean>;
  getCashFlowEntries(storeId: string): Promise<CashFlowEntry[]>;
  getCashFlowEntriesByDate(date: Date, storeId: string): Promise<CashFlowEntry[]>;
  getCashFlowEntriesByDateRange(startDate: Date, endDate: Date, storeId: string): Promise<CashFlowEntry[]>;
  getUnpaidCashFlowEntries(storeId: string): Promise<CashFlowEntry[]>;
  getCashFlowEntriesByCustomer(customerId: string, storeId: string): Promise<CashFlowEntry[]>;
  getTodayCashFlowStats(storeId: string): Promise<{
    totalSales: number;
    salesCount: number;
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
  }>;
  
  // Accounts Receivable
  getAccountsReceivable(storeId: string): Promise<{
    customerId: string;
    customerName: string;
    totalUnpaid: number;
    entries: CashFlowEntry[];
  }[]>;

  // Dashboard stats
  getDashboardStats(storeId: string): Promise<{
    todaySales: number;
    ordersToday: number;
    totalProducts: number;
    lowStockCount: number;
    totalCustomers: number;
  }>;

  // Subscription Plans
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: string): Promise<boolean>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]>;

  // User Subscriptions
  getUserSubscription(id: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  deleteUserSubscription(id: string): Promise<boolean>;
  getActiveUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  getUserSubscriptions(userId: string): Promise<UserSubscription[]>;
  getAllUserSubscriptions(): Promise<UserSubscription[]>;

  // Subscription Payments
  getSubscriptionPayment(id: string): Promise<SubscriptionPayment | undefined>;
  createSubscriptionPayment(payment: InsertSubscriptionPayment): Promise<SubscriptionPayment>;
  updateSubscriptionPayment(id: string, payment: Partial<InsertSubscriptionPayment>): Promise<SubscriptionPayment | undefined>;
  getSubscriptionPayments(subscriptionId: string): Promise<SubscriptionPayment[]>;

  // Quota enforcement
  getOwnerStoreCount(ownerId: string): Promise<number>;
  getOwnerUserCount(ownerId: string): Promise<number>;
  canCreateStore(ownerId: string): Promise<{ allowed: boolean; reason?: string; currentCount: number; maxAllowed: number }>;
  canCreateUser(ownerId: string): Promise<{ allowed: boolean; reason?: string; currentCount: number; maxAllowed: number }>;
}

// Database connection setup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const neonClient = neon(process.env.DATABASE_URL);
const db = drizzle(neonClient, {
  schema: {
    stores,
    users,
    categories,
    suppliers,
    customers,
    products,
    sales,
    saleItems,
    inventoryMovements,
    cashFlowCategories,
    cashFlowEntries,
    subscriptionPlans,
    userSubscriptions,
    subscriptionPayments
  }
});

export class PostgresStorage implements IStorage {
  constructor() {
    // Database storage doesn't need initialization like in-memory
    // Data will be loaded from the database as needed
  }

  // Stores
  async getStore(id: string): Promise<Store | undefined> {
    const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    return result[0];
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values({
      ...insertStore,
      isActive: insertStore.isActive ?? true
    }).returning();
    
    // Create default cash flow categories for the new store
    await this.createDefaultCashFlowCategories(store.id);
    
    return store;
  }

  async updateStore(id: string, storeData: Partial<InsertStore>): Promise<Store | undefined> {
    const result = await db.update(stores).set(storeData).where(eq(stores.id, id)).returning();
    return result[0];
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }

  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(desc(stores.createdAt));
  }

  // Helper method to create default cash flow categories for new stores
  private async createDefaultCashFlowCategories(storeId: string): Promise<void> {
    const incomeCategories = [
      { name: "Penjualan", description: "Pemasukan dari hasil penjualan usaha." },
      { name: "Pendapatan Jasa/Komisi", description: "Pemasukan dari komisi usaha atau jasa" },
      { name: "Penambahan Modal", description: "Pemasukan yang digunakan untuk modal tambahan usaha kamu." },
      { name: "Penagihan Utang/Cicilan", description: "Pemasukan dari pengembalian utang atau pembayaran cicilan." },
      { name: "Terima Pinjaman", description: "Pemasukan dari penerimaan uang pinjaman untuk usaha kamu." },
      { name: "Transaksi Agen Pembayaran", description: "Pemasukan dari transaksi sebagai agen pembayaran, contoh: agen BriLink." },
      { name: "Pendapatan Di Luar Usaha", description: "Pemasukan pribadi yang tidak berhubungan dengan kegiatan usaha. Contoh: hibah, hadiah, atau sedekah." },
      { name: "Pendapatan Lain-lain", description: "Pendapatan lainnya yang tidak masuk dalam kategori di atas." }
    ];

    const expenseCategories = [
      { name: "Pembelian stok", description: "Pengeluaran untuk pembelian barang yang akan dijual kembali." },
      { name: "Pembelian bahan baku", description: "Pembelian bahan dasar yang akan diolah menjadi barang siap jual." },
      { name: "Biaya operasional", description: "Biaya untuk menjalankan kegiatan usaha. Contoh: sewa tempat, listrik, dan internet." },
      { name: "Gaji/Bonus Karyawan", description: "Pembayaran upah, gaji, atau bonus karyawan." },
      { name: "Pemberian Utang", description: "Pengeluaran untuk memberikan pinjaman uang." },
      { name: "Transaksi Agen Pembayaran", description: "Pengeluaran untuk transaksi sebagai agen pembayaran, contoh: agen BriLink." },
      { name: "Pembayaran Utang/Cicilan", description: "Pengeluaran usaha untuk membayar utang/cicilan." },
      { name: "Pengeluaran Di Luar Usaha", description: "Pengeluaran untuk kebutuhan pribadi yang tidak berhubungan dengan kegiatan usaha. Contoh: bayar berobat anak." },
      { name: "Pengeluaran Lain-lain", description: "Pengeluaran lainnya yang tidak masuk dalam kategori di atas." }
    ];

    const incomeValues = incomeCategories.map(cat => ({
      name: cat.name,
      type: "income" as const,
      description: cat.description,
      storeId,
      isActive: true
    }));

    const expenseValues = expenseCategories.map(cat => ({
      name: cat.name,
      type: "expense" as const,
      description: cat.description,
      storeId,
      isActive: true
    }));

    await db.insert(cashFlowCategories).values([...incomeValues, ...expenseValues]);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role ?? "kasir",
      isActive: insertUser.isActive ?? true
    }).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName);
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  async getAllCategories(storeId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(categories.name);
  }

  // Suppliers
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }

  async updateSupplier(id: string, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(suppliers).set(supplierData).where(eq(suppliers.id, id)).returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  async getAllSuppliers(storeId: string): Promise<Supplier[]> {
    return await db.select().from(suppliers).where(eq(suppliers.storeId, storeId)).orderBy(suppliers.name);
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values({
      ...insertCustomer,
      loyaltyPoints: insertCustomer.loyaltyPoints ?? 0
    }).returning();
    return customer;
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(customerData).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  async getAllCustomers(storeId: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.storeId, storeId)).orderBy(customers.firstName, customers.lastName);
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySku(sku: string, storeId: string): Promise<Product | undefined> {
    const result = await db.select().from(products)
      .where(and(eq(products.sku, sku), eq(products.storeId, storeId)))
      .limit(1);
    return result[0];
  }

  async getProductByBarcode(barcode: string, storeId: string): Promise<Product | undefined> {
    const result = await db.select().from(products)
      .where(and(eq(products.barcode, barcode), eq(products.storeId, storeId)))
      .limit(1);
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...insertProduct,
      stock: insertProduct.stock ?? "0.000",
      minStockLevel: insertProduct.minStockLevel ?? "5.000",
      isActive: insertProduct.isActive ?? true
    }).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getAllProducts(storeId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.storeId, storeId)).orderBy(products.name);
  }

  async getLowStockProducts(storeId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          sql`CAST(${products.stock} AS DECIMAL) <= CAST(${products.minStockLevel} AS DECIMAL)`
        )
      )
      .orderBy(products.name);
  }

  // Sales
  async getSale(id: string): Promise<Sale | undefined> {
    const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
    return result[0];
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db.insert(sales).values({
      ...insertSale,
      status: insertSale.status ?? "completed",
      tax: insertSale.tax ?? "0",
      discount: insertSale.discount ?? "0"
    }).returning();
    return sale;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date, storeId: string): Promise<Sale[]> {
    return await db.select().from(sales)
      .where(
        and(
          eq(sales.storeId, storeId),
          gte(sales.saleDate, startDate),
          lte(sales.saleDate, endDate)
        )
      )
      .orderBy(desc(sales.saleDate));
  }

  async getSalesByUser(userId: string, storeId: string): Promise<Sale[]> {
    return await db.select().from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.storeId, storeId)))
      .orderBy(desc(sales.saleDate));
  }

  async getAllSales(storeId: string): Promise<Sale[]> {
    return await db.select().from(sales)
      .where(eq(sales.storeId, storeId))
      .orderBy(desc(sales.saleDate));
  }

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  async createSaleItem(insertSaleItem: InsertSaleItem): Promise<SaleItem> {
    const [saleItem] = await db.insert(saleItems).values(insertSaleItem).returning();
    return saleItem;
  }

  // Inventory
  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [movement] = await db.insert(inventoryMovements).values(insertMovement).returning();
    return movement;
  }

  async getInventoryMovements(productId: string, storeId: string): Promise<InventoryMovement[]> {
    return await db.select().from(inventoryMovements)
      .where(and(eq(inventoryMovements.productId, productId), eq(inventoryMovements.storeId, storeId)))
      .orderBy(desc(inventoryMovements.movementDate));
  }

  async updateProductStock(productId: string, quantity: number): Promise<boolean> {
    const result = await db.update(products)
      .set({ stock: sql`CAST(${products.stock} AS DECIMAL) + ${quantity}` })
      .where(eq(products.id, productId))
      .returning();
    return result.length > 0;
  }

  async getDashboardStats(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sales total
    const todaysSales = await db.select({ total: sql<string>`SUM(CAST(${sales.total} AS DECIMAL))` })
      .from(sales)
      .where(
        and(
          eq(sales.storeId, storeId),
          gte(sales.saleDate, today),
          lte(sales.saleDate, tomorrow)
        )
      );
    const todaySales = parseFloat(todaysSales[0]?.total || '0');

    // Get today's orders count
    const todaysOrders = await db.select({ count: sql<number>`COUNT(*)` })
      .from(sales)
      .where(
        and(
          eq(sales.storeId, storeId),
          gte(sales.saleDate, today),
          lte(sales.saleDate, tomorrow)
        )
      );
    const ordersToday = Number(todaysOrders[0]?.count || 0);

    // Get total products count
    const productsCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.storeId, storeId));
    const totalProducts = Number(productsCount[0]?.count || 0);

    // Get low stock count
    const lowStockCount = (await this.getLowStockProducts(storeId)).length;

    // Get total customers count
    const customersCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(customers)
      .where(eq(customers.storeId, storeId));
    const totalCustomers = Number(customersCount[0]?.count || 0);

    return {
      todaySales,
      ordersToday,
      totalProducts,
      lowStockCount,
      totalCustomers,
    };
  }

  // Subscription Plans
  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return result[0];
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values({
      ...insertPlan,
      currency: insertPlan.currency ?? "IDR",
      interval: insertPlan.interval ?? "monthly",
      maxStores: insertPlan.maxStores ?? 1,
      maxUsers: insertPlan.maxUsers ?? 5,
      features: insertPlan.features ?? [],
      isActive: insertPlan.isActive ?? true
    }).returning();
    return plan;
  }

  async updateSubscriptionPlan(id: string, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const result = await db.update(subscriptionPlans).set(planData).where(eq(subscriptionPlans.id, id)).returning();
    return result[0];
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id)).returning();
    return result.length > 0;
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.name);
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.name);
  }

  // User Subscriptions
  async getUserSubscription(id: string): Promise<UserSubscription | undefined> {
    const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id)).limit(1);
    return result[0];
  }

  async createUserSubscription(insertSubscription: InsertUserSubscription): Promise<UserSubscription> {
    const [subscription] = await db.insert(userSubscriptions).values({
      ...insertSubscription,
      status: insertSubscription.status ?? "pending",
      startDate: insertSubscription.startDate ?? new Date(),
      autoRenew: insertSubscription.autoRenew ?? true
    }).returning();
    return subscription;
  }

  async updateUserSubscription(id: string, subscriptionData: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const result = await db.update(userSubscriptions)
      .set({ 
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return result[0];
  }

  async deleteUserSubscription(id: string): Promise<boolean> {
    const result = await db.delete(userSubscriptions).where(eq(userSubscriptions.id, id)).returning();
    return result.length > 0;
  }

  async getActiveUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const result = await db.select().from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          sql`${userSubscriptions.status} IN ('active', 'pending')`
        )
      )
      .limit(1);
    return result[0];
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions).orderBy(desc(userSubscriptions.createdAt));
  }

  // Subscription Payments
  async getSubscriptionPayment(id: string): Promise<SubscriptionPayment | undefined> {
    const result = await db.select().from(subscriptionPayments).where(eq(subscriptionPayments.id, id)).limit(1);
    return result[0];
  }

  async createSubscriptionPayment(insertPayment: InsertSubscriptionPayment): Promise<SubscriptionPayment> {
    const [payment] = await db.insert(subscriptionPayments).values({
      ...insertPayment,
      currency: insertPayment.currency ?? "IDR",
      status: insertPayment.status ?? "pending"
    }).returning();
    return payment;
  }

  async updateSubscriptionPayment(id: string, paymentData: Partial<InsertSubscriptionPayment>): Promise<SubscriptionPayment | undefined> {
    const result = await db.update(subscriptionPayments).set(paymentData).where(eq(subscriptionPayments.id, id)).returning();
    return result[0];
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<SubscriptionPayment[]> {
    return await db.select().from(subscriptionPayments)
      .where(eq(subscriptionPayments.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPayments.createdAt));
  }

  // Quota enforcement
  async getOwnerStoreCount(ownerId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(stores)
      .where(and(eq(stores.ownerId, ownerId), eq(stores.isActive, true)));
    return Number(result[0]?.count || 0);
  }

  async getOwnerUserCount(ownerId: string): Promise<number> {
    // Get all stores owned by this owner
    const ownerStores = await db.select({ id: stores.id })
      .from(stores)
      .where(and(eq(stores.ownerId, ownerId), eq(stores.isActive, true)));
    
    const storeIds = ownerStores.map(store => store.id);
    
    if (storeIds.length === 0) return 0;
    
    // Count users assigned to any of the owner's stores
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(
        and(
          sql`${users.storeId} IN (${sql.join(storeIds, sql`, `)})`,
          eq(users.isActive, true)
        )
      );
    return Number(result[0]?.count || 0);
  }

  async canCreateStore(ownerId: string): Promise<{ allowed: boolean; reason?: string; currentCount: number; maxAllowed: number }> {
    const currentCount = await this.getOwnerStoreCount(ownerId);
    const activeSubscription = await this.getActiveUserSubscription(ownerId);
    
    if (!activeSubscription) {
      return {
        allowed: false,
        reason: "No active subscription found. Please subscribe to a plan to create stores.",
        currentCount,
        maxAllowed: 0
      };
    }
    
    const plan = await this.getSubscriptionPlan(activeSubscription.planId);
    if (!plan) {
      return {
        allowed: false,
        reason: "Invalid subscription plan. Please contact support.",
        currentCount,
        maxAllowed: 0
      };
    }
    
    const maxAllowed = plan.maxStores;
    const allowed = currentCount < maxAllowed;
    
    return {
      allowed,
      reason: allowed ? undefined : `Store limit reached. Your ${plan.name} allows ${maxAllowed} stores. Upgrade to create more stores.`,
      currentCount,
      maxAllowed
    };
  }

  async canCreateUser(ownerId: string): Promise<{ allowed: boolean; reason?: string; currentCount: number; maxAllowed: number }> {
    const currentCount = await this.getOwnerUserCount(ownerId);
    const activeSubscription = await this.getActiveUserSubscription(ownerId);
    
    if (!activeSubscription) {
      return {
        allowed: false,
        reason: "No active subscription found. Please subscribe to a plan to add users.",
        currentCount,
        maxAllowed: 0
      };
    }
    
    const plan = await this.getSubscriptionPlan(activeSubscription.planId);
    if (!plan) {
      return {
        allowed: false,
        reason: "Invalid subscription plan. Please contact support.",
        currentCount,
        maxAllowed: 0
      };
    }
    
    const maxAllowed = plan.maxUsers;
    const allowed = currentCount < maxAllowed;
    
    return {
      allowed,
      reason: allowed ? undefined : `User limit reached. Your ${plan.name} allows ${maxAllowed} users. Upgrade to add more users.`,
      currentCount,
      maxAllowed
    };
  }

  // Atomic sales processing - ensures all operations succeed or none do
  async processSaleAtomic(saleData: InsertSale, items: { productId: string; quantity: number; unitPrice: string; total: string }[]): Promise<{ sale: Sale; items: SaleItem[]; error?: string }> {
    // Step 1: Validate stock availability for all items
    const stockValidation: { productId: string; product: Product; requestedQty: number }[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        return { sale: {} as Sale, items: [], error: `Product ${item.productId} not found` };
      }
      
      const currentStock = parseFloat(product.stock);
      if (currentStock < item.quantity) {
        return { 
          sale: {} as Sale, 
          items: [], 
          error: `Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${item.quantity}` 
        };
      }
      
      stockValidation.push({ productId: item.productId, product, requestedQty: item.quantity });
    }
    
    try {
      // Step 2: Create the sale
      const sale = await this.createSale(saleData);
      
      // Step 3: Process all items and update inventory atomically
      const saleItems: SaleItem[] = [];
      
      for (const item of items) {
        // Create sale item
        const saleItem = await this.createSaleItem({
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice,
          total: item.total
        });
        saleItems.push(saleItem);
        
        // Update product stock
        await this.updateProductStock(item.productId, -item.quantity);
        
        // Create inventory movement
        await this.createInventoryMovement({
          productId: item.productId,
          type: "out",
          quantity: item.quantity.toString(),
          reason: `Sale #${sale.id}`,
          userId: saleData.userId,
          storeId: saleData.storeId
        });
      }
      
      return { sale, items: saleItems };
      
    } catch (error) {
      return { 
        sale: {} as Sale, 
        items: [], 
        error: error instanceof Error ? error.message : "Unknown error during sales processing" 
      };
    }
  }

  // Cash Flow methods
  async createCashFlowEntry(insertEntry: InsertCashFlowEntry): Promise<CashFlowEntry> {
    const [entry] = await db.insert(cashFlowEntries).values({
      ...insertEntry,
      paymentStatus: insertEntry.paymentStatus ?? "paid",
      isManualEntry: insertEntry.isManualEntry ?? true
    }).returning();
    return entry;
  }

  async getCashFlowEntries(storeId: string): Promise<CashFlowEntry[]> {
    return await db.select().from(cashFlowEntries)
      .where(eq(cashFlowEntries.storeId, storeId))
      .orderBy(desc(cashFlowEntries.date));
  }

  async getCashFlowEntriesByDate(date: Date, storeId: string): Promise<CashFlowEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(cashFlowEntries)
      .where(
        and(
          eq(cashFlowEntries.storeId, storeId),
          gte(cashFlowEntries.date, startOfDay),
          lte(cashFlowEntries.date, endOfDay)
        )
      )
      .orderBy(desc(cashFlowEntries.date));
  }

  async getTodayCashFlowStats(storeId: string): Promise<{
    totalSales: number;
    salesCount: number;
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sales for the specific store
    const todaysSalesResult = await db.select({ 
      total: sql<string>`SUM(CAST(${sales.total} AS DECIMAL))`,
      count: sql<number>`COUNT(*)` 
    })
      .from(sales)
      .where(
        and(
          eq(sales.storeId, storeId),
          gte(sales.saleDate, today),
          lte(sales.saleDate, tomorrow)
        )
      );
    
    const totalSales = parseFloat(todaysSalesResult[0]?.total || '0');
    const salesCount = Number(todaysSalesResult[0]?.count || 0);

    // Get today's cash flow entries for the specific store
    const todayEntries = await this.getCashFlowEntriesByDate(today, storeId);
    
    const totalIncome = todayEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + parseFloat(entry.amount), totalSales);
    
    const totalExpenses = todayEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    const netFlow = totalIncome - totalExpenses;

    return {
      totalSales,
      salesCount,
      totalIncome,
      totalExpenses,
      netFlow
    };
  }


  // Cash Flow Categories methods
  async getCashFlowCategory(id: string): Promise<CashFlowCategory | undefined> {
    const result = await db.select().from(cashFlowCategories).where(eq(cashFlowCategories.id, id)).limit(1);
    return result[0];
  }

  async createCashFlowCategory(insertCategory: InsertCashFlowCategory): Promise<CashFlowCategory> {
    const [category] = await db.insert(cashFlowCategories).values({
      ...insertCategory,
      isActive: insertCategory.isActive ?? true
    }).returning();
    return category;
  }

  async updateCashFlowCategory(id: string, updateCategory: Partial<InsertCashFlowCategory>, storeId: string): Promise<CashFlowCategory | undefined> {
    const result = await db.update(cashFlowCategories)
      .set(updateCategory)
      .where(and(eq(cashFlowCategories.id, id), eq(cashFlowCategories.storeId, storeId)))
      .returning();
    return result[0];
  }

  async deleteCashFlowCategory(id: string, storeId: string): Promise<boolean> {
    const result = await db.delete(cashFlowCategories)
      .where(and(eq(cashFlowCategories.id, id), eq(cashFlowCategories.storeId, storeId)))
      .returning();
    return result.length > 0;
  }

  async getAllCashFlowCategories(storeId: string): Promise<CashFlowCategory[]> {
    return await db.select().from(cashFlowCategories)
      .where(eq(cashFlowCategories.storeId, storeId))
      .orderBy(cashFlowCategories.type, cashFlowCategories.name);
  }

  async getCashFlowCategoriesByType(type: 'income' | 'expense', storeId: string): Promise<CashFlowCategory[]> {
    return await db.select().from(cashFlowCategories)
      .where(
        and(
          eq(cashFlowCategories.type, type),
          eq(cashFlowCategories.storeId, storeId),
          eq(cashFlowCategories.isActive, true)
        )
      )
      .orderBy(cashFlowCategories.name);
  }

  // Enhanced Cash Flow Entry methods
  async updateCashFlowEntry(id: string, updateEntry: Partial<InsertCashFlowEntry>, storeId: string): Promise<CashFlowEntry | undefined> {
    const result = await db.update(cashFlowEntries)
      .set(updateEntry)
      .where(and(eq(cashFlowEntries.id, id), eq(cashFlowEntries.storeId, storeId)))
      .returning();
    return result[0];
  }

  async deleteCashFlowEntry(id: string, storeId: string): Promise<boolean> {
    const result = await db.delete(cashFlowEntries)
      .where(and(eq(cashFlowEntries.id, id), eq(cashFlowEntries.storeId, storeId)))
      .returning();
    return result.length > 0;
  }

  async getCashFlowEntriesByDateRange(startDate: Date, endDate: Date, storeId: string): Promise<CashFlowEntry[]> {
    return await db.select().from(cashFlowEntries)
      .where(
        and(
          eq(cashFlowEntries.storeId, storeId),
          gte(cashFlowEntries.date, startDate),
          lte(cashFlowEntries.date, endDate)
        )
      )
      .orderBy(desc(cashFlowEntries.date));
  }

  async getUnpaidCashFlowEntries(storeId: string): Promise<CashFlowEntry[]> {
    return await db.select().from(cashFlowEntries)
      .where(
        and(
          eq(cashFlowEntries.storeId, storeId),
          eq(cashFlowEntries.paymentStatus, "unpaid")
        )
      )
      .orderBy(desc(cashFlowEntries.date));
  }

  async getCashFlowEntriesByCustomer(customerId: string, storeId: string): Promise<CashFlowEntry[]> {
    return await db.select().from(cashFlowEntries)
      .where(
        and(
          eq(cashFlowEntries.customerId, customerId),
          eq(cashFlowEntries.storeId, storeId)
        )
      )
      .orderBy(desc(cashFlowEntries.date));
  }

  // Accounts Receivable
  async getAccountsReceivable(storeId: string): Promise<{
    customerId: string;
    customerName: string;
    totalUnpaid: number;
    entries: CashFlowEntry[];
  }[]> {
    const unpaidEntries = await this.getUnpaidCashFlowEntries(storeId);
    const customerGroups = new Map<string, CashFlowEntry[]>();

    // Group entries by customer
    for (const entry of unpaidEntries) {
      if (entry.customerId) {
        if (!customerGroups.has(entry.customerId)) {
          customerGroups.set(entry.customerId, []);
        }
        customerGroups.get(entry.customerId)!.push(entry);
      }
    }

    const receivables = [];
    for (const [customerId, entries] of Array.from(customerGroups.entries())) {
      const customer = await this.getCustomer(customerId);
      if (customer) {
        const totalUnpaid = entries.reduce((sum: number, entry: CashFlowEntry) => sum + parseFloat(entry.amount), 0);
        receivables.push({
          customerId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          totalUnpaid,
          entries
        });
      }
    }

    return receivables.sort((a, b) => b.totalUnpaid - a.totalUnpaid);
  }
}

export const storage = new PostgresStorage();
