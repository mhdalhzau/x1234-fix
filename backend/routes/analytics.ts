import { Router } from 'express';
import { eq, desc, and, count, sum, sql, gte, lt } from 'drizzle-orm';
import { db } from '../models/database.js';
import { 
  tenants, 
  users, 
  subscriptions, 
  subscriptionPlans,
  billingHistory 
} from '../models/schema.js';
import { requireAuth, requireSuperadmin, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get SaaS metrics (role-based scoping)
router.get('/metrics', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperadmin = authReq.user?.role === 'superadmin';
    const userTenantId = authReq.user?.tenantId;
    
    const timeRange = req.query.timeRange as string || '30days';
    let dateFilter: Date;
    
    switch (timeRange) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total active subscriptions (tenant-scoped)
    const [activeSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ? 
        eq(subscriptions.status, 'active') :
        and(eq(subscriptions.status, 'active'), eq(subscriptions.tenantId, userTenantId!)));

    const activeSubscriptions = activeSubscriptionsResult?.count || 0;

    // Get total MRR from active subscriptions (tenant-scoped)
    const mrrResult = await db
      .select({
        totalMrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptionPlans.interval, 'monthly')
        ) :
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptionPlans.interval, 'monthly'),
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const currentMrr = mrrResult[0]?.totalMrr || 0;
    const arr = Number(currentMrr) * 12;

    // Get previous period snapshot (at dateFilter boundary)
    const periodLength = Date.now() - dateFilter.getTime();
    const previousPeriodDate = new Date(dateFilter.getTime() - periodLength);
    
    // Get previous period active subscriptions (active as of dateFilter) - tenant-scoped
    const [previousActiveSubsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          lt(subscriptions.createdAt, dateFilter), // Created before dateFilter
          // Not cancelled before dateFilter OR still active
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${dateFilter.toISOString()})`
        ) :
        and(
          lt(subscriptions.createdAt, dateFilter),
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${dateFilter.toISOString()})`,
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const previousActiveSubs = previousActiveSubsResult?.count || 0;
    
    // Get previous period MRR (from subscriptions active as of dateFilter) - tenant-scoped
    const previousMrrResult = await db
      .select({
        totalMrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(isSuperadmin ?
        and(
          eq(subscriptionPlans.interval, 'monthly'),
          lt(subscriptions.createdAt, dateFilter), // Created before dateFilter
          // Not cancelled before dateFilter OR still active
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${dateFilter.toISOString()})`
        ) :
        and(
          eq(subscriptionPlans.interval, 'monthly'),
          lt(subscriptions.createdAt, dateFilter),
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${dateFilter.toISOString()})`,
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const previousMrr = previousMrrResult[0]?.totalMrr || 0;
    const mrrChange = Number(previousMrr) > 0 ? ((Number(currentMrr) - Number(previousMrr)) / Number(previousMrr)) * 100 : 0;
    const subsChange = previousActiveSubs > 0 ? ((activeSubscriptions - previousActiveSubs) / previousActiveSubs) * 100 : 0;
    
    // Calculate ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions > 0 ? Number(currentMrr) / activeSubscriptions : 0;

    // Get total users count (tenant-scoped)
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(isSuperadmin ? sql`true` : eq(users.tenantId, userTenantId!));
    
    const totalUsers = totalUsersResult?.count || 0;

    // Get new users in the time period (tenant-scoped)
    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(isSuperadmin ?
        gte(users.createdAt, dateFilter) :
        and(gte(users.createdAt, dateFilter), eq(users.tenantId, userTenantId!)));

    const newUsers = newUsersResult?.count || 0;

    // Get previous period users for comparison (tenant-scoped)
    const [previousUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(isSuperadmin ?
        and(
          gte(users.createdAt, previousPeriodDate),
          lt(users.createdAt, dateFilter)
        ) :
        and(
          gte(users.createdAt, previousPeriodDate),
          lt(users.createdAt, dateFilter),
          eq(users.tenantId, userTenantId!)
        ));

    const previousUsers = previousUsersResult?.count || 0;
    const usersChange = previousUsers > 0 ? ((newUsers - previousUsers) / previousUsers) * 100 : 0;

    // Calculate churn rate (simplified - cancelled subscriptions from period-start cohort) - tenant-scoped
    const [cancelledSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, dateFilter),
          lt(subscriptions.createdAt, dateFilter) // Only count cancellations from period-start cohort
        ) :
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, dateFilter),
          lt(subscriptions.createdAt, dateFilter),
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const cancelledSubscriptions = cancelledSubscriptionsResult?.count || 0;
    const churnRate = previousActiveSubs > 0 ? (cancelledSubscriptions / previousActiveSubs) * 100 : 0;

    // Calculate CLV (simplified: ARPU / churn rate * 100)
    const clv = churnRate > 0 ? (arpu * 100) / churnRate : arpu * 36; // Default to 36 months if no churn

    // Get revenue from billing history (tenant-scoped)
    const revenueResult = await db
      .select({
        totalRevenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(isSuperadmin ?
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, dateFilter)
        ) :
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, dateFilter),
          eq(billingHistory.tenantId, userTenantId!)
        ));

    const periodRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get previous period revenue for comparison (tenant-scoped)
    const previousRevenueResult = await db
      .select({
        totalRevenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(isSuperadmin ?
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, previousPeriodDate),
          lt(billingHistory.createdAt, dateFilter)
        ) :
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, previousPeriodDate),
          lt(billingHistory.createdAt, dateFilter),
          eq(billingHistory.tenantId, userTenantId!)
        ));

    const previousRevenue = previousRevenueResult[0]?.totalRevenue || 0;
    const revenueChange = Number(previousRevenue) > 0 ? ((Number(periodRevenue) - Number(previousRevenue)) / Number(previousRevenue)) * 100 : 0;

    // Calculate ARPU change
    const previousArpu = previousActiveSubs > 0 ? Number(previousMrr) / previousActiveSubs : 0;
    const arpuChange = previousArpu > 0 ? ((arpu - previousArpu) / previousArpu) * 100 : 0;

    // Calculate CLV change (simplified)
    
    // Get previous period active subscriptions snapshot (at previousPeriodDate boundary) - tenant-scoped
    const [prevPeriodActiveSubsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          lt(subscriptions.createdAt, previousPeriodDate), // Created before previousPeriodDate
          // Not cancelled before previousPeriodDate OR still active
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${previousPeriodDate.toISOString()})`
        ) :
        and(
          lt(subscriptions.createdAt, previousPeriodDate),
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${previousPeriodDate.toISOString()})`,
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const prevPeriodActiveSubs = prevPeriodActiveSubsResult?.count || 0;
    
    // Previous period churn calculation (tenant-scoped)
    const [prevCancelledResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, previousPeriodDate),
          lt(subscriptions.updatedAt, dateFilter),
          lt(subscriptions.createdAt, previousPeriodDate) // Only count cancellations from previous period-start cohort
        ) :
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, previousPeriodDate),
          lt(subscriptions.updatedAt, dateFilter),
          lt(subscriptions.createdAt, previousPeriodDate),
          eq(subscriptions.tenantId, userTenantId!)
        ));
    
    const prevCancelled = prevCancelledResult?.count || 0;
    const previousChurnRate = prevPeriodActiveSubs > 0 ? (prevCancelled / prevPeriodActiveSubs) * 100 : 0;
    const previousClv = previousChurnRate > 0 ? (previousArpu * 100) / previousChurnRate : previousArpu * 36;
    const clvChange = previousClv > 0 ? ((clv - previousClv) / previousClv) * 100 : 0;

    const metrics = {
      mrr: {
        value: currentMrr,
        change: mrrChange,
        trend: mrrChange >= 0 ? 'up' as const : 'down' as const
      },
      arr: {
        value: arr,
        change: mrrChange, // ARR follows MRR trend
        trend: mrrChange >= 0 ? 'up' as const : 'down' as const
      },
      activeSubscribers: {
        value: activeSubscriptions,
        change: subsChange,
        trend: subsChange >= 0 ? 'up' as const : 'down' as const
      },
      churnRate: {
        value: churnRate,
        change: churnRate - previousChurnRate,
        trend: churnRate <= previousChurnRate ? 'up' as const : 'down' as const // Lower churn is good
      },
      arpu: {
        value: arpu,
        change: arpuChange,
        trend: arpuChange >= 0 ? 'up' as const : 'down' as const
      },
      clv: {
        value: clv,
        change: clvChange,
        trend: clvChange >= 0 ? 'up' as const : 'down' as const
      },
      totalUsers: {
        value: totalUsers,
        change: usersChange,
        trend: usersChange >= 0 ? 'up' as const : 'down' as const
      },
      newUsers: {
        value: newUsers,
        change: usersChange,
        trend: usersChange >= 0 ? 'up' as const : 'down' as const
      },
      periodRevenue: {
        value: periodRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? 'up' as const : 'down' as const
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user analytics (tenant-scoped)
router.get('/users', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperadmin = authReq.user?.role === 'superadmin';
    const userTenantId = authReq.user?.tenantId;
    
    const timeRange = req.query.timeRange as string || '30days';
    let dateFilter: Date;
    
    switch (timeRange) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user registration trends (tenant-scoped)
    const userTrends = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(isSuperadmin ?
        gte(users.createdAt, dateFilter) :
        and(gte(users.createdAt, dateFilter), eq(users.tenantId, userTenantId!)))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get user roles distribution (tenant-scoped)
    const roleDistribution = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .where(isSuperadmin ? sql`true` : eq(users.tenantId, userTenantId!))
      .groupBy(users.role);

    res.json({
      trends: userTrends,
      roleDistribution
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subscription analytics (tenant-scoped)
router.get('/subscriptions', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperadmin = authReq.user?.role === 'superadmin';
    const userTenantId = authReq.user?.tenantId;
    
    const timeRange = req.query.timeRange as string || '30days';
    let dateFilter: Date;
    
    switch (timeRange) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get subscription trends (tenant-scoped)
    const subscriptionTrends = await db
      .select({
        date: sql<string>`DATE(${subscriptions.createdAt})`,
        count: count()
      })
      .from(subscriptions)
      .where(isSuperadmin ?
        gte(subscriptions.createdAt, dateFilter) :
        and(gte(subscriptions.createdAt, dateFilter), eq(subscriptions.tenantId, userTenantId!)))
      .groupBy(sql`DATE(${subscriptions.createdAt})`)
      .orderBy(sql`DATE(${subscriptions.createdAt})`);

    // Get plan distribution (tenant-scoped)
    const planDistribution = await db
      .select({
        planName: subscriptionPlans.name,
        count: count(),
        revenue: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(isSuperadmin ?
        eq(subscriptions.status, 'active') :
        and(eq(subscriptions.status, 'active'), eq(subscriptions.tenantId, userTenantId!)))
      .groupBy(subscriptionPlans.id, subscriptionPlans.name);

    // Get status distribution (tenant-scoped)
    const statusDistribution = await db
      .select({
        status: subscriptions.status,
        count: count()
      })
      .from(subscriptions)
      .where(isSuperadmin ? sql`true` : eq(subscriptions.tenantId, userTenantId!))
      .groupBy(subscriptions.status);

    res.json({
      trends: subscriptionTrends,
      planDistribution,
      statusDistribution
    });
  } catch (error) {
    console.error('Subscription analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get revenue analytics (tenant-scoped)
router.get('/revenue', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperadmin = authReq.user?.role === 'superadmin';
    const userTenantId = authReq.user?.tenantId;
    
    const timeRange = req.query.timeRange as string || '30days';
    let dateFilter: Date;
    
    switch (timeRange) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get revenue trends from billing history (tenant-scoped)
    const revenueTrends = await db
      .select({
        date: sql<string>`DATE(${billingHistory.createdAt})`,
        revenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(isSuperadmin ?
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, dateFilter)
        ) :
        and(
          eq(billingHistory.status, 'paid'),
          gte(billingHistory.createdAt, dateFilter),
          eq(billingHistory.tenantId, userTenantId!)
        ))
      .groupBy(sql`DATE(${billingHistory.createdAt})`)
      .orderBy(sql`DATE(${billingHistory.createdAt})`);

    // Get MRR trends (monthly recurring revenue) - tenant-scoped
    const mrrTrends = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${subscriptions.createdAt})`,
        mrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptionPlans.interval, 'monthly'),
          gte(subscriptions.createdAt, dateFilter)
        ) :
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptionPlans.interval, 'monthly'),
          gte(subscriptions.createdAt, dateFilter),
          eq(subscriptions.tenantId, userTenantId!)
        ))
      .groupBy(sql`DATE_TRUNC('month', ${subscriptions.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${subscriptions.createdAt})`);

    res.json({
      revenueTrends,
      mrrTrends
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get churn analysis (tenant-scoped)
router.get('/churn', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isSuperadmin = authReq.user?.role === 'superadmin';
    const userTenantId = authReq.user?.tenantId;
    
    const timeRange = req.query.timeRange as string || '30days';
    let dateFilter: Date;
    
    switch (timeRange) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate current churn rate (tenant-scoped)
    const [activeSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        eq(subscriptions.status, 'active') :
        and(eq(subscriptions.status, 'active'), eq(subscriptions.tenantId, userTenantId!)));

    const activeSubscriptions = activeSubscriptionsResult?.count || 0;

    // Get cancelled subscriptions in the period (tenant-scoped)
    const [cancelledSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, dateFilter)
        ) :
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, dateFilter),
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const cancelledSubscriptions = cancelledSubscriptionsResult?.count || 0;

    // Calculate churn rate
    const totalPeriodCustomers = activeSubscriptions + cancelledSubscriptions;
    const churnRate = totalPeriodCustomers > 0 ? (cancelledSubscriptions / totalPeriodCustomers) * 100 : 0;

    // Get previous period churn for comparison (tenant-scoped)
    const periodLength = Date.now() - dateFilter.getTime();
    const previousPeriodDate = new Date(dateFilter.getTime() - periodLength);
    
    const [prevCancelledResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, previousPeriodDate),
          lt(subscriptions.updatedAt, dateFilter)
        ) :
        and(
          eq(subscriptions.status, 'cancelled'),
          gte(subscriptions.updatedAt, previousPeriodDate),
          lt(subscriptions.updatedAt, dateFilter),
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const prevCancelled = prevCancelledResult?.count || 0;
    const [prevActiveResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(isSuperadmin ?
        and(
          lt(subscriptions.createdAt, previousPeriodDate),
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${previousPeriodDate.toISOString()})`
        ) :
        and(
          lt(subscriptions.createdAt, previousPeriodDate),
          sql`(${subscriptions.status} != 'cancelled' OR ${subscriptions.updatedAt} > ${previousPeriodDate.toISOString()})`,
          eq(subscriptions.tenantId, userTenantId!)
        ));

    const prevActive = prevActiveResult?.count || 0;
    const prevTotalCustomers = prevActive + prevCancelled;
    const previousChurnRate = prevTotalCustomers > 0 ? (prevCancelled / prevTotalCustomers) * 100 : 0;
    
    const churnChange = churnRate - previousChurnRate;

    // Mock at-risk users calculation (in real world this would be based on engagement metrics)
    const atRiskUsers = Math.max(0, Math.floor(activeSubscriptions * 0.05)); // 5% of active users

    // Mock churn reasons (in real world this would come from exit surveys/feedback)
    const churnReasons = [
      { reason: 'Price concerns', count: Math.floor(cancelledSubscriptions * 0.35), percentage: 35.2 },
      { reason: 'Better competitor', count: Math.floor(cancelledSubscriptions * 0.26), percentage: 26.1 },
      { reason: 'Lack of features', count: Math.floor(cancelledSubscriptions * 0.17), percentage: 17.4 },
      { reason: 'Poor support', count: Math.floor(cancelledSubscriptions * 0.13), percentage: 13.0 },
      { reason: 'Technical issues', count: Math.floor(cancelledSubscriptions * 0.09), percentage: 8.7 }
    ];

    // Mock cohort retention data
    const cohortData = [
      { period: 'Month 1', retention: 95.2 },
      { period: 'Month 3', retention: 87.1 },
      { period: 'Month 6', retention: 78.9 },
      { period: 'Month 12', retention: 71.3 },
      { period: 'Month 24', retention: 65.8 }
    ];

    const churnAnalytics = {
      churnRate: {
        value: churnRate,
        change: churnChange,
        trend: churnChange <= 0 ? 'down' as const : 'up' as const // Lower churn is better
      },
      atRiskUsers,
      churnReasons,
      cohortData
    };

    res.json(churnAnalytics);
  } catch (error) {
    console.error('Churn analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;