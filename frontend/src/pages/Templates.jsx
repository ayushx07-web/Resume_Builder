import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const templates = [
  { id: 1, name: 'Corporate Minimalist', category: 'Professional', isPremium: false, price: 0, color: '#1f2937', description: 'Clean serif layout with subtle styling for traditional applications.' },
  { id: 2, name: 'Emerald Sidebar', category: 'Creative', isPremium: false, price: 0, color: '#059669', description: 'Left aesthetic strip with an elegant right-hand content flow.' },
  { id: 6, name: 'Tech Timeline', category: 'Modern', isPremium: false, price: 0, color: '#3b82f6', description: 'A sleek, chronological timeline style preferred by developers.' },
  { id: 3, name: 'Executive Split', category: 'Modern', isPremium: true, price: 299, color: '#1f2937', description: 'Premium two-column layout separating dates and experience.' },
  { id: 4, name: 'Ivy League Grid', category: 'Executive', isPremium: true, price: 399, color: '#000000', description: 'Centered formatting with commanding, thick bold underlines.' },
  { id: 5, name: 'Symmetrical Authority', category: 'Professional', isPremium: true, price: 349, color: '#111827', description: 'Elegant layout using horizontal lines to bracket sections.' },
  { id: 7, name: 'Modern Dual-Tone', category: 'Creative', isPremium: true, price: 349, color: '#1e3a8a', description: 'Striking full-width colored header with a perfect 2-column split body.' },
  { id: 8, name: 'Startup Functional', category: 'Modern', isPremium: true, price: 299, color: '#10b981', description: 'Monospaced typography and bracketed titles for a cutting-edge vibe.' },
];

const categories = ['All', 'Professional', 'Modern', 'Creative', 'Executive'];

export default function Templates() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [selected, setSelected] = useState('All');
  const [preview, setPreview] = useState(null);

  const filtered = selected === 'All' ? templates : templates.filter(t => t.category === selected);

  const useTemplate = (template) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (template.isPremium && !user?.hasPremiumAccess) {
      toast.info('This is a premium template. Please purchase to use it.', { autoClose: 3000 });
      navigate('/payment', { state: { template } });
      return;
    }
    navigate('/resume/new', { state: { templateId: template.id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Templates</h1>
          <p className="text-gray-500 text-lg">Choose from our collection of professional templates</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelected(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${selected === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              {/* Preview area */}
              <div className="relative h-52 overflow-hidden" style={{ backgroundColor: template.color + '15' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 bg-white rounded-lg shadow-md p-3 transform group-hover:scale-105 transition">
                    <div className="h-2 rounded mb-1" style={{ backgroundColor: template.color }}></div>
                    <div className="h-1.5 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-1 bg-gray-100 rounded mb-2 w-1/2"></div>
                    <div className="space-y-1">
                      {[1,2,3].map(i => <div key={i} className="h-1 bg-gray-100 rounded" style={{ width: `${90-i*10}%` }}></div>)}
                    </div>
                    <div className="mt-2 h-1.5 rounded w-1/2" style={{ backgroundColor: template.color + '80' }}></div>
                    <div className="space-y-1 mt-1">
                      {[1,2].map(i => <div key={i} className="h-1 bg-gray-100 rounded"></div>)}
                    </div>
                  </div>
                </div>
                {template.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    👑 PREMIUM
                  </div>
                )}
                {!template.isPremium && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    FREE
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-gray-900">
                    {template.isPremium ? (user?.hasPremiumAccess ? 'Unlocked ✨' : `₹${template.price}`) : 'Free'}
                  </span>
                  <button onClick={() => useTemplate(template)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${template.isPremium && !user?.hasPremiumAccess ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {template.isPremium && !user?.hasPremiumAccess ? 'Buy Now' : 'Use Template'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Banner */}
        {!user?.hasPremiumAccess && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Unlock All Premium Templates</h2>
            <p className="text-blue-100 mb-6">Get access to all 8 templates, unlimited downloads, and priority support</p>
            <div className="flex justify-center gap-6 mb-8">
              {[['₹299/mo', 'Monthly'], ['₹799', 'Quarterly (Save 10%)'], ['₹2999', 'Yearly (Save 16%)']].map(([price, plan]) => (
                <div key={plan} className="bg-white bg-opacity-20 rounded-xl p-4 cursor-pointer hover:bg-opacity-30 transition" onClick={() => navigate('/payment')}>
                  <div className="text-2xl font-bold">{price}</div>
                  <div className="text-sm text-blue-100">{plan}</div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/payment')} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
              Get Premium Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
