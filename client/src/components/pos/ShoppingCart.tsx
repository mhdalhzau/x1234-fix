import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { ShoppingCart as CartIcon, CreditCard, Banknote, Smartphone, Pause, Trash2, Minus, Plus, Receipt, Printer, Clock, Package } from "lucide-react";
import ThermalReceipt, { printThermalReceipt } from "./ThermalReceipt";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onHoldOrder?: (type: string, customerName: string) => void;
}

export default function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldOrder,
}: ShoppingCartProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("cash");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("walk-in");
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>("");
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdType, setHoldType] = useState<string>("Dine In");
  const [holdCustomerName, setHoldCustomerName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const processSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(saleData),
      });
      if (!response.ok) throw new Error("Failed to process sale");
      return response.json();
    },
    onSuccess: (data) => {
      // Store sale data for receipt printing
      setLastSaleData(data);
      
      // Print thermal receipt automatically
      if (data.receiptData) {
        printThermalReceipt({
          ...data.receiptData,
          subtotal: data.calculatedSubtotal || subtotal.toFixed(2),
          tax: data.calculatedTax || tax.toFixed(2),
          total: data.calculatedTotal || total.toFixed(2),
          paymentMethod,
          customerName: getCustomerName(selectedCustomer)
        });
      }
      
      toast({
        title: "Sale processed successfully",
        description: "Receipt has been printed",
      });
      
      onClearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cashflow/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cashflow/entries"] });
    },
    onError: (error) => {
      toast({
        title: "Sale failed",
        description: error instanceof Error ? error.message : "Failed to process sale",
        variant: "destructive",
      });
    },
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.085; // 8.5%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Helper function to get proper customer name
  const getCustomerName = (customerId: string): string => {
    if (customerId === "walk-in") return "Walk-in Customer";
    const customer = customers.find((c: any) => c.id === customerId);
    if (!customer) return "Unknown Customer";
    const firstName = customer.firstName || "";
    const lastName = customer.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Unknown Customer";
  };

  const holdOrderTypes = [
    "Dine In",
    "Take Out", 
    "Delivery",
    "Pickup",
    "Reserved",
    "Catering"
  ];

  const handleHoldOrder = () => {
    if (!onHoldOrder) return;
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before holding order",
        variant: "destructive",
      });
      return;
    }

    const customerName = holdCustomerName.trim() || getCustomerName(selectedCustomer);

    onHoldOrder(holdType, customerName);
    
    toast({
      title: "Order held successfully",
      description: `${holdType} order for ${customerName} has been saved`,
    });
    
    setShowHoldDialog(false);
    setHoldCustomerName("");
    setHoldType("Dine In");
  };

  const handleProcessPayment = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before processing payment",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customerId: selectedCustomer === "walk-in" ? null : selectedCustomer,
      total: total.toFixed(2),
      tax: tax.toFixed(2),
      discount: "0.00",
      paymentMethod,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        total: item.total.toFixed(2),
      })),
    };

    processSaleMutation.mutate(saleData);
  };

  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Current Sale</h3>
        
        {/* Cart Items */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CartIcon className="w-16 h-16 mx-auto mb-4" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start a sale</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-sm" data-testid={`cart-item-${item.id}`}>
                    {item.name}
                  </h5>
                  <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 0.1))}
                    data-testid={`decrease-${item.id}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  {editingQuantity === item.id ? (
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      onBlur={() => {
                        const newQty = parseFloat(tempQuantity);
                        if (!isNaN(newQty) && newQty > 0) {
                          onUpdateQuantity(item.id, newQty);
                        }
                        setEditingQuantity(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newQty = parseFloat(tempQuantity);
                          if (!isNaN(newQty) && newQty > 0) {
                            onUpdateQuantity(item.id, newQty);
                          }
                          setEditingQuantity(null);
                        }
                      }}
                      className="w-16 h-6 text-center text-sm px-1"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="w-16 text-center text-sm cursor-pointer hover:bg-muted rounded px-1" 
                      data-testid={`quantity-${item.id}`}
                      onClick={() => {
                        setEditingQuantity(item.id);
                        setTempQuantity(item.quantity.toString());
                      }}
                    >
                      {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(3)}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 0.1)}
                    data-testid={`increase-${item.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-right ml-3">
                  <p className="font-semibold text-sm" data-testid={`total-${item.id}`}>
                    ${item.total.toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive text-xs h-auto p-0"
                    onClick={() => onRemoveItem(item.id)}
                    data-testid={`remove-${item.id}`}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {items.length > 0 && (
          <>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal:</span>
                <span data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Tax (8.5%):</span>
                <span data-testid="cart-tax">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span data-testid="cart-total">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger data-testid="customer-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  className="p-3 h-auto flex-col"
                  onClick={() => setPaymentMethod("cash")}
                  data-testid="payment-cash"
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  className="p-3 h-auto flex-col"
                  onClick={() => setPaymentMethod("card")}
                  data-testid="payment-card"
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "digital" ? "default" : "outline"}
                  className="p-3 h-auto flex-col"
                  onClick={() => setPaymentMethod("digital")}
                  data-testid="payment-digital"
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span className="text-xs">Digital</span>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                disabled={items.length === 0 || processSaleMutation.isPending}
                data-testid="button-process-payment"
              >
                {processSaleMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 w-4 h-4" />
                    Process Payment
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to process this payment of ${total.toFixed(2)} via {paymentMethod}?
                  <div className="mt-2 p-3 bg-muted rounded">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleProcessPayment}>
                  <Printer className="mr-2 w-4 h-4" />
                  Confirm & Print Receipt
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" data-testid="button-hold">
                    <Pause className="mr-1 w-4 h-4" />
                    Hold
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Hold Order
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hold-type">Order Type</Label>
                      <Select value={holdType} onValueChange={setHoldType}>
                        <SelectTrigger data-testid="hold-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {holdOrderTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                {type}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-name">Customer Name (Optional)</Label>
                      <Input
                        id="customer-name"
                        value={holdCustomerName}
                        onChange={(e) => setHoldCustomerName(e.target.value)}
                        placeholder="Enter customer name or leave blank"
                        data-testid="hold-customer-name"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Default: {selectedCustomer === "walk-in" ? "Walk-in Customer" : 
                          customers.find((c: any) => c.id === selectedCustomer)?.firstName + " " + 
                          customers.find((c: any) => c.id === selectedCustomer)?.lastName}
                      </p>
                    </div>

                    <div className="bg-muted p-3 rounded">
                      <div className="text-sm font-medium mb-2">Order Summary:</div>
                      <div className="text-sm text-muted-foreground">
                        {items.length} items • Total: ${total.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowHoldDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleHoldOrder}
                        data-testid="confirm-hold"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Hold Order
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onClearCart}
                data-testid="button-clear"
              >
                <Trash2 className="mr-1 w-4 h-4" />
                Clear
              </Button>
            </div>
          )}
          
          {/* Manual Print Receipt Button */}
          {lastSaleData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (lastSaleData.receiptData) {
                  printThermalReceipt({
                    ...lastSaleData.receiptData,
                    subtotal: lastSaleData.calculatedSubtotal,
                    tax: lastSaleData.calculatedTax,
                    total: lastSaleData.calculatedTotal,
                    paymentMethod,
                    customerName: customers.find((c: any) => c.id === selectedCustomer)?.firstName + " " + customers.find((c: any) => c.id === selectedCustomer)?.lastName
                  });
                  toast({
                    title: "Receipt reprinted",
                    description: "Thermal receipt has been sent to printer"
                  });
                }
              }}
              data-testid="button-reprint"
            >
              <Printer className="mr-1 w-4 h-4" />
              Reprint Last Receipt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
