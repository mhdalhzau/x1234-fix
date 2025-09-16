import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Printer, Settings as SettingsIcon, ShieldAlert, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import UsersTab from "@/components/settings/UsersTab";
import PrinterTab from "@/components/settings/PrinterTab";
import MenuRestrictionsTab from "@/components/settings/MenuRestrictionsTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === "owner" ? "subscription" : "users");

  // Access control: administrators and store owners can access settings
  if (user?.role !== "administrator" && user?.role !== "owner") {
    return (
      <main className="p-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have permission to access this page. Only administrators and store owners can manage settings.
          </p>
        </div>
      </main>
    );
  }

  const isAdmin = user?.role === "administrator";
  const isOwner = user?.role === "owner";

  return (
    <main className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : isOwner ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {(isAdmin || isOwner) && (
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Management
                </TabsTrigger>
              )}
              <TabsTrigger value="printer" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Printer Settings
              </TabsTrigger>
              <TabsTrigger value="menu-restrictions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Menu Restrictions
              </TabsTrigger>
            </TabsList>
            
            {(isAdmin || isOwner) && (
              <TabsContent value="subscription" className="mt-6">
                <SubscriptionTab />
              </TabsContent>
            )}
            
            {isAdmin && (
              <TabsContent value="users" className="mt-6">
                <UsersTab />
              </TabsContent>
            )}
            
            <TabsContent value="printer" className="mt-6">
              <PrinterTab />
            </TabsContent>
            
            <TabsContent value="menu-restrictions" className="mt-6">
              <MenuRestrictionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}