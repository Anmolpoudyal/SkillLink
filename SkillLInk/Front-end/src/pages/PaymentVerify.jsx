import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle, Copy, Shield } from 'lucide-react';
import api from '../services/api';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [completionOtp, setCompletionOtp] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
            paidAt: response.paidAt,
            bookingId: response.bookingId
          });
          // Store the completion OTP
          if (response.completionOtp) {
            setCompletionOtp(response.completionOtp);
          }
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

  const handleCopyOtp = () => {
    if (completionOtp) {
      navigator.clipboard.writeText(completionOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          description: 'Your payment has been processed. Share the completion code with your service provider after the work is done.'
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
            <>
              {/* Payment Details */}
              <div className="bg-green-50 rounded-lg p-4 mb-4 text-left">
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

              {/* Completion OTP Section */}
              {completionOtp && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Completion Code</span>
                  </div>
                  
                  {/* OTP Display */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {completionOtp.split('').map((digit, index) => (
                      <div
                        key={index}
                        className="w-10 h-12 bg-white border-2 border-amber-300 rounded-lg flex items-center justify-center text-xl font-bold text-amber-800"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyOtp}
                    className="flex items-center justify-center gap-2 w-full py-2 text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {copied ? 'Copied!' : 'Copy Code'}
                    </span>
                  </button>

                  {/* Warning */}
                  <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Important:</strong> Only share this code with your service provider 
                      <strong> after the work is completed</strong> to your satisfaction. 
                      This code confirms job completion and releases the payment.
                    </p>
                  </div>
                </div>
              )}
            </>
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
