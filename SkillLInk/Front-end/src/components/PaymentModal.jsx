import React, { useState } from 'react';
import { Button } from './ui/button';
import { X, CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const amount = booking.finalAmount || booking.estimatedAmount || 0;

  const handlePayWithKhalti = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.payments.initiatePayment(
        booking.id,
        amount
      );

      if (response.success && response.paymentUrl) {
        // Redirect to Khalti payment page
        window.location.href = response.paymentUrl;
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
      if (onPaymentError) {
        onPaymentError(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-800">Make Payment</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="text-gray-800 font-medium">
                  {booking.provider?.service || 'Service'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Provider:</span>
                <span className="text-gray-800">{booking.provider?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Description:</span>
                <span className="text-gray-800 truncate max-w-[200px]">
                  {booking.problemDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-teal-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-teal-600">
                NPR {amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              You will be redirected to Khalti to complete your payment securely.
            </p>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayWithKhalti}
            disabled={isProcessing || amount <= 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <img 
                  src="https://web.khalti.com/static/img/logo1.png" 
                  alt="Khalti" 
                  className="h-6 w-auto"
                  onError={(e) => e.target.style.display = 'none'}
                />
                Pay with Khalti
              </>
            )}
          </Button>

          {/* Cancel Button */}
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full mt-3 text-gray-600"
          >
            Cancel
          </Button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <CheckCircle className="w-3 h-3" />
            <span>Secure payment powered by Khalti</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
