import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Home() {
  const { isAuthenticated } = useSelector(s => s.auth);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          🚀 Build Professional Resumes in Minutes
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
          Create Your Perfect<br /><span className="text-blue-600">Resume Today</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Professional templates, live preview, and one-click PDF export. Get hired faster with resumes that stand out.
        </p>
        <div className="flex justify-center gap-4 mb-20">
          <Link to={isAuthenticated ? '/dashboard' : '/signup'}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg">
            Get Started Free
          </Link>
          <Link to="/templates" className="bg-white text-gray-700 px-10 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-blue-400 transition">
            View Templates
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '⚡', title: 'Live Preview', desc: 'See your resume update in real-time as you type. No more guessing what it looks like.' },
            { icon: '🎨', title: '8+ Templates', desc: 'Professional, modern, and creative templates for every industry and role.' },
            { icon: '📥', title: 'PDF Export', desc: 'Download your resume as a high-quality PDF, ready to send to employers.' },
            { icon: '☁️', title: 'Cloud Saved', desc: 'Your resumes are automatically saved to the cloud. Access them anywhere.' },
            { icon: '🔒', title: 'Secure', desc: 'Your data is encrypted and secure. We never share your information.' },
            { icon: '💳', title: 'Premium Plans', desc: 'Unlock all templates and features with our affordable premium plans.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-black mb-4">Ready to build your resume?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of professionals who've landed their dream jobs</p>
          <Link to={isAuthenticated ? '/resume/new' : '/signup'}
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition inline-block">
            Start Building Now — It's Free!
          </Link>
        </div>
      </div>
    </div>
  );
}
