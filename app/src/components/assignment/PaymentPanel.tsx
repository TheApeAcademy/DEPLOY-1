import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Assignment } from '@/types';

interface PaymentPanelProps {
  assignment: Assignment;
  user: { id: string; name: string; email: string };
  onPaymentComplete: () => void;
  onPaymentFailed: (error: string) => void;
}

export function PaymentPanel({ assignment, user, onPaymentComplete, onPaymentFailed }: PaymentPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = () => {
    if (!assignment.paymentAmount) {
      toast.error('No payment amount set');
      return;
    }
    setIsLoading(true);
    // Replace this URL with the actual payment link you copied from Flutterwave
    const paymentLink = `https://checkout.flutterwave.com/v3/https://flutterwave.com/pay/ctiqneyy3cgv?amount=${assignment.paymentAmount}&currency=GBP&customer_email=${user.email}`;
    window.open(paymentLink, '_blank');
    setIsLoading(false);
    onPaymentComplete();
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-emerald-100">
          <span className="text-4xl">💳</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay £{assignment.paymentAmount?.toFixed(2)}</h3>
        <p className="text-gray-500 text-sm mb-6">Click below to complete payment securely</p>
        <Button
          onClick={handlePay}
          disabled={isLoading}
          className="h-12 px-8 rounded-xl text-white font-semibold"
          style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Pay Now</span>}
        </Button>
      </CardContent>
    </Card>
  );
}
