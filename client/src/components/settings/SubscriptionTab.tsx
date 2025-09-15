import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Crown, Package, Users, Store, Calendar, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import type { SubscriptionPlan, UserSubscription, SubscriptionPayment } from "@shared/schema";

interface SubscriptionWithPlan {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
}

interface QuotaInfo {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  maxAllowed: number;
}

export default function SubscriptionTab() {
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSubscription, isLoading: loadingSubscription, isError: subscriptionError, refetch: refetchSubscription } = useQuery<SubscriptionWithPlan>({
    queryKey: ['/api/subscriptions/me'],
    retry: 2,
  });

  const { data: availablePlans = [], isLoading: loadingPlans, isError: plansError, refetch: refetchPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    retry: 2,
  });

  const { data: storeQuota, isError: storeQuotaError, refetch: refetchStoreQuota } = useQuery<QuotaInfo>({
    queryKey: ['/api/quota/stores'],
    retry: 2,
  });

  const { data: userQuota, isError: userQuotaError, refetch: refetchUserQuota } = useQuery<QuotaInfo>({
    queryKey: ['/api/quota/users'],
    retry: 2,
  });

  const { data: paymentHistory = [], isLoading: loadingPayments } = useQuery<SubscriptionPayment[]>({
    queryKey: ['/api/subscriptions', currentSubscription?.subscription.id, 'payments'],
    enabled: paymentHistoryOpen && !!currentSubscription?.subscription.id,
    retry: 2,
  });

  const selectPlanMutation = useMutation({
    mutationFn: (planId: string) => {
      if (currentSubscription) {
        // Update existing subscription
        return apiRequest(`/api/subscriptions/${currentSubscription.subscription.id}`, 'PUT', { planId });
      } else {
        // Create new subscription
        return apiRequest('/api/subscriptions', 'POST', { planId, userId: "" }); // userId will be set by server
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quota/stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quota/users'] });
      toast({
        title: "Plan Updated",
        description: currentSubscription ? "Your subscription plan has been updated." : "Your subscription has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: (subscriptionId: string) => 
      apiRequest(`/api/subscriptions/${subscriptionId}/cancel`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/me'] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string, currency: string = "IDR") => {
    const numAmount = parseFloat(amount);
    if (currency === "IDR") {
      return `Rp ${numAmount.toLocaleString('id-ID')}`;
    }
    return `${currency} ${numAmount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (current: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const handleRetry = () => {
    refetchSubscription();
    refetchPlans();
    refetchStoreQuota();
    refetchUserQuota();
  };

  // Error handling
  if (subscriptionError || plansError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load subscription information. Please try again.</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (loadingSubscription || loadingPlans) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your active subscription plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{currentSubscription.plan.name}</h3>
                <p className="text-sm text-muted-foreground">{currentSubscription.plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(currentSubscription.plan.price, currentSubscription.plan.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {currentSubscription.plan.interval}
                </div>
                <Badge className={getStatusColor(currentSubscription.subscription.status)}>
                  {currentSubscription.subscription.status.charAt(0).toUpperCase() + 
                   currentSubscription.subscription.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Usage Quotas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Store Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stores</span>
                      <span>{storeQuota?.currentCount || 0} / {storeQuota?.maxAllowed || 0}</span>
                    </div>
                    <Progress 
                      value={storeQuota ? calculateProgress(storeQuota.currentCount, storeQuota.maxAllowed) : 0} 
                      className="h-2"
                    />
                    {storeQuotaError && (
                      <p className="text-xs text-red-600">Failed to load store quota</p>
                    )}
                    {storeQuota && !storeQuota.allowed && (
                      <p className="text-xs text-red-600">{storeQuota.reason}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Users</span>
                      <span>{userQuota?.currentCount || 0} / {userQuota?.maxAllowed || 0}</span>
                    </div>
                    <Progress 
                      value={userQuota ? calculateProgress(userQuota.currentCount, userQuota.maxAllowed) : 0} 
                      className="h-2"
                    />
                    {userQuotaError && (
                      <p className="text-xs text-red-600">Failed to load user quota</p>
                    )}
                    {userQuota && !userQuota.allowed && (
                      <p className="text-xs text-red-600">{userQuota.reason}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Start Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(currentSubscription.subscription.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {currentSubscription.subscription.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">End Date</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(currentSubscription.subscription.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Auto Renew</div>
                  <div className="text-sm text-muted-foreground">
                    {currentSubscription.subscription.autoRenew ? "Enabled" : "Disabled"}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentSubscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Dialog open={paymentHistoryOpen} onOpenChange={setPaymentHistoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="payment-history-button">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment History
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Payment History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {loadingPayments ? (
                      <div className="flex justify-center p-4">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : paymentHistory.length > 0 ? (
                      paymentHistory.map((payment, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No payment history found</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {currentSubscription.subscription.status === 'active' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => cancelSubscriptionMutation.mutate(currentSubscription.subscription.id)}
                  disabled={cancelSubscriptionMutation.isPending}
                  data-testid="cancel-subscription-button"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              No Active Subscription
            </CardTitle>
            <CardDescription>
              Subscribe to a plan to start managing stores and users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have an active subscription. Choose a plan below to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                currentSubscription?.plan.id === plan.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : ''
              }`}
            >
              {currentSubscription?.plan.id === plan.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-2xl font-bold">
                  {formatCurrency(plan.price, plan.currency)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max Stores</span>
                    <span className="font-medium">{plan.maxStores === 999 ? 'Unlimited' : plan.maxStores}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Users</span>
                    <span className="font-medium">{plan.maxUsers === 999 ? 'Unlimited' : plan.maxUsers}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Features</h4>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={currentSubscription?.plan.id === plan.id || selectPlanMutation.isPending}
                  onClick={() => selectPlanMutation.mutate(plan.id)}
                  data-testid={`select-plan-${plan.id}`}
                >
                  {selectPlanMutation.isPending ? 'Updating...' : 
                   currentSubscription?.plan.id === plan.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}