import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Building,
  Lock,
  CheckCircle,
  Loader2,
  Shield,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  serviceName: string;
  vendorName: string;
}

const paymentMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, logos: ["Visa", "Mastercard", "Rupay"] },
  { id: "upi", label: "UPI", icon: Smartphone, logos: ["GPay", "PhonePe", "Paytm"] },
  { id: "wallet", label: "Wallet", icon: Wallet, logos: ["Paytm", "PhonePe", "Amazon Pay"] },
  { id: "netbanking", label: "Net Banking", icon: Building, logos: ["HDFC", "SBI", "ICICI"] },
];

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, serviceName, vendorName }: PaymentModalProps) => {
  const { toast } = useToast();
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "processing" | "success">("select");
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window.Razorpay !== 'undefined') {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setRazorpayLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const serviceCharge = amount;
  const platformFee = Math.round(amount * 0.02);
  const gst = Math.round((serviceCharge + platformFee) * 0.18);
  const totalAmount = serviceCharge + platformFee + gst;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentStep("processing");
      setError(null);

      if (!razorpayKey) {
        throw new Error("Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file.");
      }

      const options = {
        key: razorpayKey,
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Servify",
        description: serviceName,
        image: "/logo.png", // Your logo URL
        handler: function (response: any) {
          console.log("Payment successful:", response);

          // Payment successful
          setPaymentStep("success");

          toast({
            title: "Payment Successful!",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });

          setTimeout(() => {
            onSuccess();
          }, 2000);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          service: serviceName,
          vendor: vendorName,
        },
        theme: {
          color: "#8B5CF6", // Your primary color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentStep("select");
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive",
            });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setError(response.error.description || "Payment failed");
        setPaymentStep("select");
        setIsProcessing(false);

        toast({
          title: "Payment Failed",
          description: response.error.description || "Please try again",
          variant: "destructive",
        });
      });

      razorpayInstance.open();
      setIsProcessing(false);

    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setPaymentStep("select");
      setIsProcessing(false);

      toast({
        title: "Payment Error",
        description: err.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStep("select");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-success" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {/* Payment Summary */}
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vendor</span>
            <span className="font-medium">{vendorName}</span>
          </div>
          <div className="border-t border-border my-2 pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Charge</span>
              <span>₹{serviceCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Payment Method Selection */}
        {paymentStep === "select" && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                    }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <method.icon className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.label}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      {method.logos.map((logo) => (
                        <span key={logo} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {logo}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
              Pay ₹{totalAmount.toLocaleString()}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secured by Razorpay with 256-bit encryption</span>
            </div>
          </div>
        )}

        {/* Processing State */}
        {paymentStep === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <h3 className="font-semibold text-lg mb-2">Opening Payment Gateway</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        )}

        {/* Success State */}
        {paymentStep === "success" && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your booking has been confirmed. Redirecting to dashboard...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
