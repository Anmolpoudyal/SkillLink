import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.payments.getPaymentHistory();
      setPayments(response.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'initiated':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refund_requested':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      initiated: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      expired: 'bg-red-100 text-red-700',
      refund_requested: 'bg-orange-100 text-orange-700',
      refunded: 'bg-blue-100 text-blue-700',
    };

    const labels = {
      completed: 'Completed',
      pending: 'Pending',
      initiated: 'Initiated',
      failed: 'Failed',
      expired: 'Expired',
      refund_requested: 'Refund Requested',
      refunded: 'Refunded',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-600" />
                <h1 className="text-xl font-semibold text-gray-800">Payment History</h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayments}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700">{error}</p>
              <Button
                onClick={fetchPayments}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Payments Yet</h3>
              <p className="text-gray-500">Your payment history will appear here once you make a payment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left side */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-full">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {payment.serviceName || 'Service Payment'}
                          </h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {payment.bookingDescription?.substring(0, 60)}
                          {payment.bookingDescription?.length > 60 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{payment.otherPartyName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(payment.paidAt || payment.createdAt)}</span>
                          </div>
                        </div>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-400 mt-2">
                            Transaction ID: {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side - Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        NPR {payment.amount?.toLocaleString()}
                      </p>
                      {payment.status === 'completed' && (
                        <p className="text-sm text-green-600 flex items-center justify-end gap-1 mt-1">
                          <CheckCircle className="w-4 h-4" />
                          Paid
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {payments.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold">
                    {payments.filter(p => p.status === 'completed').length}
                  </p>
                  <p className="text-sm text-teal-100">Completed Payments</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    NPR {payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + (p.amount || 0), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-teal-100">Total Spent</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {payments.filter(p => p.status === 'pending' || p.status === 'initiated').length}
                  </p>
                  <p className="text-sm text-teal-100">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
