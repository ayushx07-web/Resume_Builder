import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { token, user } = useSelector((state) => state.auth);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(res.data.data?.content || res.data.data || []);
    } catch (err) {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Resume deleted!');
      fetchResumes();
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  const downloadPdf = async (id, title) => {
    navigate(`/resume/${id}`);
    toast.info("Opening editor to generate high-quality PDF. Click 'Download PDF' at the top!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.username || 'User'}!</p>
          </div>
          <button
            onClick={() => navigate('/resume/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>+</span> Create Resume
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No resumes yet</h2>
            <p className="text-gray-500 mb-8">Create your first professional resume in minutes</p>
            <button
              onClick={() => navigate('/resume/new')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{resume.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {resume.isDraft && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Draft</span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/resume/${resume.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => downloadPdf(resume.id, resume.title)}
                    className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => deleteResume(resume.id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            <div
              onClick={() => navigate('/resume/new')}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition min-h-[160px]"
            >
              <span className="text-4xl text-gray-300 mb-2">+</span>
              <p className="text-gray-500 font-medium">Create New Resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
