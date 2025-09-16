import type { Express } from "express";
import { createServer, type Server } from "http";
import postgres from "postgres";
import { storage } from "./storage";
import { hashPassword, verifyPassword } from "./utils/password";
import { 
  loginSchema,
  insertUserSchema,
  insertStoreSchema,
  insertCategorySchema,
  insertSupplierSchema,
  insertCustomerSchema,
  insertProductSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertInventoryMovementSchema,
  insertCashFlowCategorySchema,
  insertCashFlowEntrySchema,
  insertSubscriptionPlanSchema,
  insertUserSubscriptionSchema,
  insertSubscriptionPaymentSchema
} from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; username: string; role: string };
      storeId?: string;
    }
  }
}

// Simple session storage
const sessions: Map<string, { userId: string; username: string; role: string }> = new Map();

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessionId ? sessions.get(sessionId) : null;
  
  if (!session) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  req.user = session;
  next();
}

// Middleware to extract and validate store ID
function requireStore(req: any, res: any, next: any) {
  const storeId = req.headers['x-store-id'];
  
  if (!storeId) {
    return res.status(400).json({ message: "Store ID is required" });
  }
  
  req.storeId = storeId;
  next();
}

// Middleware to validate store ownership (users can only access their assigned store)
async function validateStoreAccess(req: any, res: any, next: any) {
  try {
    if (!req.user || !req.storeId) {
      return res.status(401).json({ message: "Authentication and store context required" });
    }

    // Administrator role can access any store
    if (req.user.role === 'administrator') {
      return next();
    }

    // Get user details to check their assigned store
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user's assigned store matches the requested store
    if (user.storeId !== req.storeId) {
      return res.status(403).json({ message: "Access denied: You don't have permission to access this store" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Store validation failed" });
  }
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      const sessionId = Math.random().toString(36).substring(2);
      sessions.set(sessionId, { userId: user.id, username: user.username, role: user.role });

      res.json({ 
        token: sessionId, 
        user: { 
          id: user.id, 
          username: user.username, 
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user!.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Superadmin login for customer-dashboard
  app.post("/api/auth/superadmin-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (email !== "admin@example.com") {
        return res.status(401).json({ message: "Not a superadmin account" });
      }
      
      // Query cd_users table directly using raw SQL
      const client = postgres(process.env.DATABASE_URL!, { 
        prepare: false,
        ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
        max: 1
      });
      
      const result = await client`
        SELECT cu.id, cu.tenant_id, cu.username, cu.email, cu.password_hash, cu.role, cu.is_active,
               t.business_name, t.status as tenant_status
        FROM cd_users cu
        INNER JOIN tenants t ON cu.tenant_id = t.id  
        WHERE cu.email = ${email} AND cu.is_active = true
      `;
      
      await client.end();
      
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const user = result[0];
      
      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      res.json({
        message: "Superadmin login successful", 
        redirectUrl: "/customer-dashboard",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error("Superadmin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Store routes  
  app.get("/api/stores", requireAuth, async (req, res) => {
    try {
      const userRole = req.user!.role;
      const userId = req.user!.userId;

      if (userRole === 'administrator') {
        // Administrators can see all stores
        const stores = await storage.getAllStores();
        return res.json(stores);
      } 
      
      if (userRole === 'owner') {
        // Store owners can see all stores they own
        const allStores = await storage.getAllStores();
        const ownedStores = allStores.filter(store => store.ownerId === userId);
        return res.json(ownedStores);
      }
      
      // Regular users see their assigned store
      // Fetch user data to get their assigned storeId
      const userData = await storage.getUser(userId);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!userData.storeId) {
        return res.status(403).json({ message: "No store access assigned" });
      }
      
      const userStore = await storage.getStore(userData.storeId);
      if (!userStore) {
        return res.status(404).json({ message: "Assigned store not found" });
      }
      
      return res.json([userStore]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.post("/api/stores", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      
      // Determine the owner ID - use provided ownerId or current user
      const ownerId = storeData.ownerId || req.user!.userId;
      
      // Security: Non-administrators can only create stores for themselves
      if (req.user!.role !== 'administrator' && ownerId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot create store for another user" });
      }
      
      // Check subscription quota limits (administrators can override)
      if (req.user!.role !== 'administrator') {
        const quotaCheck = await storage.canCreateStore(ownerId);
        if (!quotaCheck.allowed) {
          return res.status(403).json({ 
            message: quotaCheck.reason,
            quotaInfo: {
              currentCount: quotaCheck.currentCount,
              maxAllowed: quotaCheck.maxAllowed,
              exceeded: true
            }
          });
        }
      }
      
      // Ensure ownerId is set in the store data
      const finalStoreData = {
        ...storeData,
        ownerId
      };
      
      const store = await storage.createStore(finalStoreData);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.put("/api/stores/:id", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const { id } = req.params;
      const storeData = insertStoreSchema.partial().parse(req.body);
      
      // Get store and verify ownership for non-administrators
      const existingStore = await storage.getStore(id);
      if (!existingStore) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Security: Non-administrators can only update stores they own
      if (req.user!.role !== 'administrator' && existingStore.ownerId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot update store you don't own" });
      }
      
      // Prevent changing ownership unless admin
      if (req.user!.role !== 'administrator' && storeData.ownerId && storeData.ownerId !== existingStore.ownerId) {
        return res.status(403).json({ message: "Access denied: Cannot change store ownership" });
      }
      
      const store = await storage.updateStore(id, storeData);
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.delete("/api/stores/:id", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get store and verify ownership for non-administrators
      const existingStore = await storage.getStore(id);
      if (!existingStore) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Security: Non-administrators can only delete stores they own
      if (req.user!.role !== 'administrator' && existingStore.ownerId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot delete store you don't own" });
      }
      
      const success = await storage.deleteStore(id);
      if (!success) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json({ message: "Store deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.storeId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User routes
  app.get("/api/users", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      if (req.user!.role === 'administrator') {
        // Administrators can see all users
        const users = await storage.getAllUsers();
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        res.json(usersWithoutPasswords);
      } else {
        // Store owners can see users in stores they own
        const allUsers = await storage.getAllUsers();
        const allStores = await storage.getAllStores();
        const ownedStoreIds = allStores
          .filter(store => store.ownerId === req.user!.userId)
          .map(store => store.id);
        
        const ownedUsers = allUsers
          .filter(user => user.storeId && ownedStoreIds.includes(user.storeId))
          .map(({ password, ...user }) => user);
        
        res.json(ownedUsers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Security: Prevent privilege escalation - non-admins can only create subordinate roles
      const allowedRoles = ["kasir", "administrasi"];
      if (req.user!.role !== 'administrator') {
        if (!userData.role || !allowedRoles.includes(userData.role)) {
          return res.status(403).json({ 
            message: "Access denied: Cannot create user with this role",
            allowedRoles 
          });
        }
        
        // Non-admins must specify a storeId they own
        if (!userData.storeId) {
          return res.status(400).json({ message: "Store ID is required for non-administrator user creation" });
        }
      }
      
      // If storeId is provided, check quota for the store owner
      if (userData.storeId) {
        const store = await storage.getStore(userData.storeId);
        if (!store) {
          return res.status(400).json({ message: "Invalid store ID" });
        }
        
        // Security: Non-administrators can only create users for stores they own
        if (req.user!.role !== 'administrator' && store.ownerId !== req.user!.userId) {
          return res.status(403).json({ message: "Access denied: Cannot create user for this store" });
        }
        
        // Check subscription quota limits for the store owner (administrators can override)
        if (req.user!.role !== 'administrator') {
          const quotaCheck = await storage.canCreateUser(store.ownerId);
          if (!quotaCheck.allowed) {
            return res.status(403).json({ 
              message: quotaCheck.reason,
              quotaInfo: {
                currentCount: quotaCheck.currentCount,
                maxAllowed: quotaCheck.maxAllowed,
                exceeded: true
              }
            });
          }
        }
      } else {
        // If no storeId, only administrators can create users without store assignment
        if (req.user!.role !== 'administrator') {
          return res.status(403).json({ message: "Access denied: Only administrators can create users without store assignment" });
        }
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Get existing user for ownership validation
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify ownership for non-administrators
      if (req.user!.role !== 'administrator') {
        // Check if user belongs to a store owned by the current user
        if (existingUser.storeId) {
          const store = await storage.getStore(existingUser.storeId);
          if (!store || store.ownerId !== req.user!.userId) {
            return res.status(403).json({ message: "Access denied: Cannot update user from store you don't own" });
          }
        } else {
          return res.status(403).json({ message: "Access denied: Cannot update user without store assignment" });
        }
        
        // Prevent privilege escalation
        const allowedRoles = ["kasir", "administrasi"];
        if (userData.role && !allowedRoles.includes(userData.role)) {
          return res.status(403).json({ 
            message: "Access denied: Cannot assign this role",
            allowedRoles 
          });
        }
        
        // Prevent changing storeId to store not owned by user
        if (userData.storeId && userData.storeId !== existingUser.storeId) {
          const newStore = await storage.getStore(userData.storeId);
          if (!newStore || newStore.ownerId !== req.user!.userId) {
            return res.status(403).json({ message: "Access denied: Cannot move user to store you don't own" });
          }
        }
      }
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole(["administrator", "owner"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get existing user for ownership validation
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify ownership for non-administrators
      if (req.user!.role !== 'administrator') {
        // Check if user belongs to a store owned by the current user
        if (existingUser.storeId) {
          const store = await storage.getStore(existingUser.storeId);
          if (!store || store.ownerId !== req.user!.userId) {
            return res.status(403).json({ message: "Access denied: Cannot delete user from store you don't own" });
          }
        } else {
          return res.status(403).json({ message: "Access denied: Cannot delete user without store assignment" });
        }
        
        // Prevent deletion of administrators or owners
        if (existingUser.role === 'administrator' || existingUser.role === 'owner') {
          return res.status(403).json({ message: "Access denied: Cannot delete administrators or owners" });
        }
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const products = await storage.getAllProducts(req.storeId!);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/low-stock", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts(req.storeId!);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers(req.storeId!);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers(req.storeId!);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, supplierData);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSupplier(id);
      
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Category routes
  app.get("/api/categories", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const categories = await storage.getAllCategories(req.storeId!);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Sales routes
  app.get("/api/sales", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const sales = await storage.getAllSales(req.storeId!);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", requireAuth, async (req, res) => {
    try {
      const { items, paymentMethod, customerId } = req.body;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }
      
      if (!paymentMethod || !["cash", "card", "digital"].includes(paymentMethod)) {
        return res.status(400).json({ message: "Valid payment method is required" });
      }
      
      // Calculate totals server-side for security
      let subtotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "Invalid item data" });
        }
        
        // Get current product price from database (security: don't trust client prices)
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        if (!product.isActive) {
          return res.status(400).json({ message: `Product ${product.name} is not active` });
        }
        
        const currentStock = parseFloat(product.stock);
        if (currentStock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${currentStock.toFixed(3)}, Requested: ${item.quantity}` 
          });
        }
        
        const unitPrice = parseFloat(product.sellingPrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          total: lineTotal.toFixed(2)
        });
      }
      
      // Calculate tax and total server-side
      const taxRate = 0.085; // 8.5%
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
      
      // Prepare sale data with server-calculated values
      const saleData = {
        customerId: customerId === "walk-in" || !customerId ? null : customerId,
        userId: req.user!.userId,
        total: total.toFixed(2),
        tax: tax.toFixed(2),
        discount: "0.00",
        paymentMethod,
        status: "completed" as const
      };
      
      // Validate sale data
      const validatedSaleData = insertSaleSchema.parse(saleData);
      
      // Process sale atomically - all operations succeed or none do
      const result = await storage.processSaleAtomic(validatedSaleData, validatedItems);
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.status(201).json({
        ...result.sale,
        calculatedSubtotal: subtotal.toFixed(2),
        calculatedTax: tax.toFixed(2),
        calculatedTotal: total.toFixed(2),
        receiptData: {
          items: result.items,
          timestamp: new Date().toISOString(),
          receiptNumber: result.sale.id
        }
      });
    } catch (error) {
      console.error("Sale processing error:", error);
      res.status(400).json({ 
        message: "Failed to process sale",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/sales/:id/items", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getSaleItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale items" });
    }
  });

  // Cash Flow routes
  app.get("/api/cashflow/today", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const stats = await storage.getTodayCashFlowStats(req.storeId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's cash flow stats" });
    }
  });

  app.get("/api/cashflow/entries", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const entries = await storage.getCashFlowEntries(req.storeId!);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cash flow entries" });
    }
  });

  app.post("/api/cashflow/entries", requireAuth, async (req, res) => {
    try {
      const entryData = insertCashFlowEntrySchema.parse({
        ...req.body,
        userId: req.user!.userId
      });
      const entry = await storage.createCashFlowEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid cash flow entry data" });
    }
  });

  app.put("/api/cashflow/entries/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const entryData = insertCashFlowEntrySchema.partial().parse(req.body);
      
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const entry = await storage.updateCashFlowEntry(id, entryData, user.storeId);
      
      if (!entry) {
        return res.status(404).json({ message: "Cash flow entry not found or access denied" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid cash flow entry data" });
    }
  });

  app.delete("/api/cashflow/entries/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const success = await storage.deleteCashFlowEntry(id, user.storeId);
      
      if (!success) {
        return res.status(404).json({ message: "Cash flow entry not found or access denied" });
      }
      
      res.json({ message: "Cash flow entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cash flow entry" });
    }
  });

  app.get("/api/cashflow/entries/date-range", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const entries = await storage.getCashFlowEntriesByDateRange(
        new Date(startDate as string), 
        new Date(endDate as string),
        user.storeId
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cash flow entries" });
    }
  });

  app.get("/api/cashflow/entries/unpaid", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const entries = await storage.getUnpaidCashFlowEntries(req.storeId!);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unpaid entries" });
    }
  });

  app.get("/api/cashflow/entries/customer/:customerId", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const { customerId } = req.params;
      const entries = await storage.getCashFlowEntriesByCustomer(customerId, req.storeId!);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer entries" });
    }
  });

  // Cash Flow Categories routes
  app.get("/api/cashflow/categories", requireAuth, requireStore, validateStoreAccess, async (req, res) => {
    try {
      const { type } = req.query;
      
      const categories = type 
        ? await storage.getCashFlowCategoriesByType(type as 'income' | 'expense', req.storeId!)
        : await storage.getAllCashFlowCategories(req.storeId!);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cash flow categories" });
    }
  });

  app.post("/api/cashflow/categories", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const categoryData = insertCashFlowCategorySchema.parse(req.body);
      const category = await storage.createCashFlowCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/cashflow/categories/:id", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCashFlowCategorySchema.partial().parse(req.body);
      
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const category = await storage.updateCashFlowCategory(id, categoryData, user.storeId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found or access denied" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/cashflow/categories/:id", requireAuth, requireRole(["administrator"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const success = await storage.deleteCashFlowCategory(id, user.storeId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found or access denied" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Subscription Plans routes
  app.get("/api/subscription-plans", requireAuth, async (req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/subscription-plans/all", requireAuth, requireRole(["administrator"]), async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all subscription plans" });
    }
  });

  app.post("/api/subscription-plans", requireAuth, requireRole(["administrator"]), async (req, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription plan data" });
    }
  });

  app.put("/api/subscription-plans/:id", requireAuth, requireRole(["administrator"]), async (req, res) => {
    try {
      const { id } = req.params;
      const planData = insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(id, planData);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription plan data" });
    }
  });

  // User Subscriptions routes
  app.get("/api/subscriptions/me", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getActiveUserSubscription(req.user!.userId);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Get the plan details
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      res.json({ subscription, plan });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get("/api/subscriptions/user/:userId", requireAuth, requireRole(["administrator"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user subscriptions" });
    }
  });

  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const subscriptionData = insertUserSubscriptionSchema.parse(req.body);
      
      // Security: Enforce ownership - users can only create subscriptions for themselves
      if (req.user!.role !== 'administrator' && subscriptionData.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot create subscription for another user" });
      }
      
      // Validate plan exists and is active
      const plan = await storage.getSubscriptionPlan(subscriptionData.planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      if (!plan.isActive) {
        return res.status(400).json({ message: "Subscription plan is not available" });
      }
      
      // Check if user already has an active subscription
      const existingSubscription = await storage.getActiveUserSubscription(subscriptionData.userId);
      if (existingSubscription) {
        return res.status(400).json({ message: "User already has an active subscription" });
      }
      
      const subscription = await storage.createUserSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data" });
    }
  });

  app.put("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const subscriptionData = insertUserSubscriptionSchema.partial().parse(req.body);
      
      // Get subscription and verify ownership
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Security: Enforce ownership - users can only update their own subscriptions
      if (req.user!.role !== 'administrator' && subscription.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot update another user's subscription" });
      }
      
      // If planId is being updated, validate the new plan
      if (subscriptionData.planId) {
        const plan = await storage.getSubscriptionPlan(subscriptionData.planId);
        if (!plan) {
          return res.status(400).json({ message: "Invalid subscription plan" });
        }
        if (!plan.isActive) {
          return res.status(400).json({ message: "Subscription plan is not available" });
        }
      }
      
      const updatedSubscription = await storage.updateUserSubscription(id, subscriptionData);
      res.json(updatedSubscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data" });
    }
  });

  app.patch("/api/subscriptions/:id/cancel", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get subscription and verify ownership
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Security: Enforce ownership - users can only cancel their own subscriptions
      if (req.user!.role !== 'administrator' && subscription.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied: Cannot cancel another user's subscription" });
      }
      
      // Cancel the subscription
      const updatedSubscription = await storage.updateUserSubscription(id, { 
        status: "cancelled",
        autoRenew: false 
      });
      
      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Subscription Payments routes
  app.get("/api/subscriptions/:subscriptionId/payments", requireAuth, async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      
      // Verify subscription access
      const subscription = await storage.getUserSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      if (req.user!.role !== 'administrator' && subscription.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payments = await storage.getSubscriptionPayments(subscriptionId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/subscription-payments", requireAuth, async (req, res) => {
    try {
      const paymentData = insertSubscriptionPaymentSchema.parse(req.body);
      
      // Verify subscription access
      const subscription = await storage.getUserSubscription(paymentData.subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      if (req.user!.role !== 'administrator' && subscription.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payment = await storage.createSubscriptionPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Quota checking routes
  app.get("/api/quota/stores", requireAuth, async (req, res) => {
    try {
      const ownerId = req.user!.userId;
      const result = await storage.canCreateStore(ownerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to check store quota" });
    }
  });

  app.get("/api/quota/users", requireAuth, async (req, res) => {
    try {
      const ownerId = req.user!.userId;
      const result = await storage.canCreateUser(ownerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to check user quota" });
    }
  });

  // Accounts Receivable routes
  app.get("/api/accounts-receivable", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const receivables = await storage.getAccountsReceivable(user.storeId);
      res.json(receivables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts receivable" });
    }
  });

  // Inventory routes
  app.get("/api/inventory/movements/:productId", requireAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.storeId) {
        return res.status(401).json({ message: "User not found or not assigned to a store" });
      }
      
      const movements = await storage.getInventoryMovements(productId, user.storeId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory movements" });
    }
  });

  app.post("/api/inventory/adjustment", requireAuth, requireRole(["administrator", "owner", "administrasi"]), async (req, res) => {
    try {
      const { productId, quantity, reason } = req.body;
      
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Update stock
      await storage.updateProductStock(productId, quantity);
      
      // Create movement record
      const movement = await storage.createInventoryMovement({
        productId,
        type: "adjustment",
        quantity,
        reason,
        userId: req.user!.userId,
        storeId: user.storeId!
      });
      
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ message: "Invalid adjustment data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
