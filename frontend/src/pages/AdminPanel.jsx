import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminPanel() {
  const { token } = useSelector(s => s.auth);
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalResumes: 0, totalPayments: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); if (tab === 'users') fetchUsers(); }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data.data || {});
    } catch { setStats({ totalUsers: 0, totalResumes: 0 }); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.data?.content || res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleBlock = async (userId, blocked) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${userId}/block`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(blocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Resumes', value: stats.totalResumes || 0, icon: '📄', color: 'bg-purple-500' },
    { label: 'Total Payments', value: stats.totalPayments || 0, icon: '💳', color: 'bg-green-500' },
    { label: 'Revenue', value: `₹${stats.totalRevenue || 0}`, icon: '💰', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
          {[['dashboard', '📊 Dashboard'], ['users', '👥 Users'], ['templates', '🎨 Templates'], ['payments', '💳 Payments']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                    {card.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{card.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => setTab('users')} className="p-4 bg-blue-50 rounded-xl text-blue-700 font-medium hover:bg-blue-100 transition">Manage Users</button>
                <button onClick={() => setTab('templates')} className="p-4 bg-purple-50 rounded-xl text-purple-700 font-medium hover:bg-purple-100 transition">Manage Templates</button>
                <button onClick={() => setTab('payments')} className="p-4 bg-green-50 rounded-xl text-green-700 font-medium hover:bg-green-100 transition">View Payments</button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">All Users</h2>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['ID', 'Username', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
                    ) : users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.active ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleBlock(user.id, !user.active)}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition ${user.active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                            {user.active ? 'Block' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {tab === 'templates' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">Template Management</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Classic Professional', category: 'Professional', isPremium: false, price: 0, downloads: 142 },
                { name: 'Modern Minimal', category: 'Modern', isPremium: false, price: 0, downloads: 98 },
                { name: 'Clean Creative', category: 'Creative', isPremium: false, price: 0, downloads: 76 },
                { name: 'Executive Dark', category: 'Executive', isPremium: true, price: 399, downloads: 34 },
                { name: 'Vibrant Design', category: 'Creative', isPremium: true, price: 449, downloads: 22 },
              ].map((t, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{t.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {t.isPremium ? '👑 Premium' : 'Free'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">Category: {t.category}</div>
                  <div className="text-sm text-gray-500">Price: {t.isPremium ? `₹${t.price}` : 'Free'}</div>
                  <div className="text-sm text-gray-500">Downloads: {t.downloads}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">Payment History</h2>
            <p className="text-gray-500">Payment records will appear here once transactions are made.</p>
          </div>
        )}
      </div>
    </div>
  );
}
