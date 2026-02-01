import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get('pidx');
      const paymentStatus = searchParams.get('status');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      if (!pidx) {
        setStatus('error');
        setError('Payment information not found');
        return;
      }

      try {
        const response = await api.payments.verifyPayment(pidx);
        
        if (response.success) {
          setStatus('success');
          setPaymentDetails({
            amount: response.amount,
            transactionId: response.transactionId,
            paidAt: response.paidAt
          });
        } else {
          setStatus(response.status || 'failed');
          setError(response.message);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setError(err.message || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Clock className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'expired':
        return <AlertCircle className="w-16 h-16 text-orange-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'verifying':
        return {
          title: 'Verifying Payment...',
          description: 'Please wait while we confirm your payment with Khalti.'
        };
      case 'success':
      case 'completed':
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.'
        };
      case 'pending':
        return {
          title: 'Payment Pending',
          description: 'Your payment is still being processed. Please wait.'
        };
      case 'expired':
        return {
          title: 'Payment Expired',
          description: 'The payment session has expired. Please try again.'
        };
      default:
        return {
          title: 'Payment Failed',
          description: error || 'Something went wrong with your payment.'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {statusInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {statusInfo.description}
          </p>

          {paymentDetails && (status === 'success' || status === 'completed') && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-gray-800">
                    NPR {paymentDetails.amount?.toLocaleString()}
                  </span>
                </div>
                {paymentDetails.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-800">
                      {paymentDetails.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/customer-dashboard')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              Go to Dashboard
            </Button>
            
            {(status === 'failed' || status === 'expired' || status === 'error') && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>

          {/* Khalti branding */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <span className="text-purple-600 font-semibold">Khalti</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentVerify;
