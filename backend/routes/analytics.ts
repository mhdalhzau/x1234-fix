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
import { requireAuth, requireSuperadmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get SaaS metrics (superadmin only)
router.get('/metrics', requireAuth, requireSuperadmin, async (req, res) => {
  try {
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

    // Get total active subscriptions
    const [activeSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const activeSubscriptions = activeSubscriptionsResult?.count || 0;

    // Get total MRR from active subscriptions
    const mrrResult = await db
      .select({
        totalMrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(subscriptions.status, 'active'),
        eq(subscriptionPlans.interval, 'monthly')
      ));

    const currentMrr = mrrResult[0]?.totalMrr || 0;
    const arr = Number(currentMrr) * 12;

    // Get previous period MRR for comparison
    const periodLength = Date.now() - dateFilter.getTime();
    const previousPeriodDate = new Date(dateFilter.getTime() - periodLength);
    
    // Get previous period MRR
    const previousMrrResult = await db
      .select({
        totalMrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(subscriptions.status, 'active'),
        eq(subscriptionPlans.interval, 'monthly'),
        gte(subscriptions.createdAt, previousPeriodDate),
        lt(subscriptions.createdAt, dateFilter)
      ));

    const previousMrr = previousMrrResult[0]?.totalMrr || 0;
    const mrrChange = Number(previousMrr) > 0 ? ((Number(currentMrr) - Number(previousMrr)) / Number(previousMrr)) * 100 : 0;
    
    // Calculate ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions > 0 ? Number(currentMrr) / activeSubscriptions : 0;

    // Get previous period active subscriptions for comparison
    const [previousActiveSubsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, 'active'),
        gte(subscriptions.createdAt, previousPeriodDate),
        lt(subscriptions.createdAt, dateFilter)
      ));

    const previousActiveSubs = previousActiveSubsResult?.count || 0;
    const subsChange = previousActiveSubs > 0 ? ((activeSubscriptions - previousActiveSubs) / previousActiveSubs) * 100 : 0;

    // Get total users count
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);
    
    const totalUsers = totalUsersResult?.count || 0;

    // Get new users in the time period
    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, dateFilter));

    const newUsers = newUsersResult?.count || 0;

    // Get previous period users for comparison
    const [previousUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        gte(users.createdAt, previousPeriodDate),
        lt(users.createdAt, dateFilter)
      ));

    const previousUsers = previousUsersResult?.count || 0;
    const usersChange = previousUsers > 0 ? ((newUsers - previousUsers) / previousUsers) * 100 : 0;

    // Calculate churn rate (simplified - cancelled subscriptions in period)
    const [cancelledSubscriptionsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, 'cancelled'),
        gte(subscriptions.updatedAt, dateFilter)
      ));

    const cancelledSubscriptions = cancelledSubscriptionsResult?.count || 0;
    const churnRate = activeSubscriptions > 0 ? (cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) * 100 : 0;

    // Calculate CLV (simplified: ARPU / churn rate * 100)
    const clv = churnRate > 0 ? (arpu * 100) / churnRate : arpu * 36; // Default to 36 months if no churn

    // Get revenue from billing history
    const revenueResult = await db
      .select({
        totalRevenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(and(
        eq(billingHistory.status, 'paid'),
        gte(billingHistory.createdAt, dateFilter)
      ));

    const periodRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get previous period revenue for comparison
    const previousRevenueResult = await db
      .select({
        totalRevenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(and(
        eq(billingHistory.status, 'paid'),
        gte(billingHistory.createdAt, previousPeriodDate),
        lt(billingHistory.createdAt, dateFilter)
      ));

    const previousRevenue = previousRevenueResult[0]?.totalRevenue || 0;
    const revenueChange = Number(previousRevenue) > 0 ? ((Number(periodRevenue) - Number(previousRevenue)) / Number(previousRevenue)) * 100 : 0;

    // Calculate ARPU change
    const previousArpu = previousActiveSubs > 0 ? Number(previousMrr) / previousActiveSubs : 0;
    const arpuChange = previousArpu > 0 ? ((arpu - previousArpu) / previousArpu) * 100 : 0;

    // Calculate CLV change (simplified)
    const previousChurnRate = previousActiveSubs > 0 ? (cancelledSubscriptions / (previousActiveSubs + cancelledSubscriptions)) * 100 : 0;
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

// Get user analytics
router.get('/users', requireAuth, requireSuperadmin, async (req, res) => {
  try {
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

    // Get user registration trends
    const userTrends = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(gte(users.createdAt, dateFilter))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get user roles distribution
    const roleDistribution = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
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

// Get subscription analytics
router.get('/subscriptions', requireAuth, requireSuperadmin, async (req, res) => {
  try {
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

    // Get subscription trends
    const subscriptionTrends = await db
      .select({
        date: sql<string>`DATE(${subscriptions.createdAt})`,
        count: count()
      })
      .from(subscriptions)
      .where(gte(subscriptions.createdAt, dateFilter))
      .groupBy(sql`DATE(${subscriptions.createdAt})`)
      .orderBy(sql`DATE(${subscriptions.createdAt})`);

    // Get plan distribution
    const planDistribution = await db
      .select({
        planName: subscriptionPlans.name,
        count: count(),
        revenue: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, 'active'))
      .groupBy(subscriptionPlans.id, subscriptionPlans.name);

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: subscriptions.status,
        count: count()
      })
      .from(subscriptions)
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

// Get revenue analytics
router.get('/revenue', requireAuth, requireSuperadmin, async (req, res) => {
  try {
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

    // Get revenue trends from billing history
    const revenueTrends = await db
      .select({
        date: sql<string>`DATE(${billingHistory.createdAt})`,
        revenue: sum(billingHistory.amount)
      })
      .from(billingHistory)
      .where(and(
        eq(billingHistory.status, 'paid'),
        gte(billingHistory.createdAt, dateFilter)
      ))
      .groupBy(sql`DATE(${billingHistory.createdAt})`)
      .orderBy(sql`DATE(${billingHistory.createdAt})`);

    // Get MRR trends (monthly recurring revenue)
    const mrrTrends = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${subscriptions.createdAt})`,
        mrr: sum(subscriptionPlans.price)
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(subscriptions.status, 'active'),
        eq(subscriptionPlans.interval, 'monthly'),
        gte(subscriptions.createdAt, dateFilter)
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

export default router;