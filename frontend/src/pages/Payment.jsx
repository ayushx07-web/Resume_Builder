import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setPremiumAccess } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const plans = [
  { id: 'MONTHLY', name: 'Monthly', price: 299, period: '/month', savings: null },
  { id: 'QUARTERLY', name: 'Quarterly', price: 799, period: '/quarter', savings: 'Save 10%' },
  { id: 'YEARLY', name: 'Yearly', price: 2999, period: '/year', savings: 'Save 16%', popular: true },
];

export default function Payment() {
  const { token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('YEARLY');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selected);
      
      const res = await axios.post(
        'http://localhost:8080/api/payments/create-order',
        { amount: plan.price, paymentType: 'SUBSCRIPTION', description: plan.name + ' Subscription' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const order = res.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: order.amount * 100,
        currency: order.currency,
        name: 'Resume Builder Premium',
        description: plan.name + ' Subscription',
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          try {
            await axios.post(
              'http://localhost:8080/api/payments/verify',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(setPremiumAccess(true));
            toast.success('Payment successful! Premium features unlocked.', { autoClose: 3000 });
            navigate('/dashboard');
          } catch (err) {
            toast.error('Payment verification failed.');
            console.error(err);
          }
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Upgrade to Premium</h1>
          <p className="text-gray-500 text-lg">Unlock all templates and features</p>
        </div>

        {state?.template && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 flex items-center gap-4">
            <span className="text-3xl">👑</span>
            <div>
              <p className="font-bold text-yellow-800">Premium Template: {state.template.name}</p>
              <p className="text-yellow-600 text-sm">Purchase a plan to access this template</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)}
              className={`bg-white rounded-2xl p-6 cursor-pointer border-2 transition relative ${selected === plan.id ? 'border-blue-500 shadow-lg' : 'border-gray-100 hover:border-gray-300'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">MOST POPULAR</div>}
              {plan.savings && <div className="text-xs text-green-600 font-bold mb-2 bg-green-50 px-2 py-0.5 rounded-full w-fit">{plan.savings}</div>}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="text-3xl font-black text-gray-900 mb-1">₹{plan.price}<span className="text-base font-normal text-gray-500">{plan.period}</span></div>
              <div className={`w-6 h-6 rounded-full border-2 mt-4 flex items-center justify-center ${selected === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {selected === plan.id && <span className="text-white text-xs">✓</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">What's included:</h3>
          <div className="grid grid-cols-2 gap-3">
            {['All 8 premium templates', 'Unlimited resumes', 'PDF export', 'Priority support', 'Auto-save drafts', 'Template updates'].map(f => (
              <div key={f} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handlePayment} disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? 'Processing...' : `Pay ₹${plans.find(p => p.id === selected)?.price} - Proceed to Razorpay`}
        </button>
        <p className="text-center text-gray-400 text-sm mt-3">Secure payment powered by Razorpay</p>
      </div>
    </div>
  );
}
