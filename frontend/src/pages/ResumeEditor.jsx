import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

const EMPTY_RESUME = {
  title: 'My Resume',
  personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  templateId: 1,
};
const TEMPLATES = [
  { id: 1, name: 'Corporate Minimalist', color: '#1f2937', isPremium: false },
  { id: 2, name: 'Emerald Sidebar', color: '#059669', isPremium: false },
  { id: 6, name: 'Tech Timeline', color: '#3b82f6', isPremium: false },
  { id: 3, name: 'Executive Split', color: '#1f2937', isPremium: true },
  { id: 4, name: 'Ivy League Grid', color: '#000000', isPremium: true },
  { id: 5, name: 'Symmetrical Authority', color: '#111827', isPremium: true },
  { id: 7, name: 'Modern Dual-Tone', color: '#1e3a8a', isPremium: true },
  { id: 8, name: 'Startup Functional', color: '#10b981', isPremium: true },
];

function ATSScoreWidget({ resume }) {
  let score = 0;
  if (resume) {
    const wordCount = JSON.stringify(resume).split(/\s+/).length;
    if (wordCount > 150) score += 25;
    
    let contacts = 0;
    if (resume.personalInfo?.email) contacts++;
    if (resume.personalInfo?.phone) contacts++;
    if (resume.personalInfo?.linkedin) contacts++;
    if (contacts >= 2) score += 25;

    if (resume.skills?.length >= 5) score += 25;

    let hasVerbs = false;
    const actionVerbs = ['managed', 'led', 'developed', 'created', 'built', 'orchestrated', 'designed', 'improved', 'increased', 'optimized'];
    resume.experience?.forEach(exp => {
      actionVerbs.forEach(v => {
        if (exp.description?.toLowerCase().includes(v)) hasVerbs = true;
      });
    });
    if (hasVerbs) score += 25;
  }

  const scoreColor = score < 50 ? 'text-red-500' : score < 80 ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className="flex items-center gap-3">
       <div className="text-xs text-gray-500 font-medium whitespace-nowrap">ATS Score</div>
       <div className={`font-bold text-lg ${scoreColor}`}>{score}/100</div>
       <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
         <div className={`h-full ${scoreColor.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
       </div>
    </div>
  );
}

function ResumePreview({ data, templateId }) {
  const t = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const customColor = data.settings?.color || t.color;

  if (templateId === 2) return <CatherineTemplate data={data} color={customColor} />;
  if (templateId === 3) return <AndrewSplitTemplate data={data} />;
  if (templateId === 4) return <LeeHarvardTemplate data={data} />;
  if (templateId === 5) return <NadiaTemplate data={data} />;
  if (templateId === 6) return <TechTimelineTemplate data={data} color={customColor} />;
  if (templateId === 7) return <ModernDualToneTemplate data={data} color={customColor} />;
  if (templateId === 8) return <StartupFunctionalTemplate data={data} />;
  return <ClassicAndrewTemplate data={data} />;
}

function CoverLetterPreview({ data, templateId }) {
   const t = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
   const customColor = data.settings?.color || t.color;
   const info = data.personalInfo || {};
   const cl = data.coverLetter || {};
   const isMono = templateId === 8;
   const isSerif = templateId === 1;
   
   return (
     <div className={`bg-white w-full min-h-full ${isMono ? 'font-mono' : isSerif ? 'font-serif' : 'font-sans'} text-[13px] text-gray-800 p-[50px] leading-[1.6]`}>
        <div style={{ borderTop: `8px solid ${customColor}` }} className="pt-8">
           <h1 className="text-[36px] font-bold tracking-tight mb-1" style={{ color: customColor }}>{info.fullName || 'Your Name'}</h1>
           <div className="flex gap-4 text-[12px] text-gray-500 mb-10">
              {info.email && <span>{info.email}</span>}
              {info.phone && <span>{info.phone}</span>}
              {info.address && <span>{info.address}</span>}
           </div>
           
           <div className="mb-8 font-medium">
             {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
             <br/><br/>
             {cl.recipient || 'Hiring Manager\nCompany Name\nCompany Address'}
           </div>

           <div className="whitespace-pre-wrap leading-[1.8] text-justify text-gray-700">
             {cl.body || 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position at your company. With my proven track record in the industry and dedication to delivering high-quality results, I am confident in my ability to make an immediate impact on your team.\n\nOver the course of my career, I have developed a deep expertise in modern methodologies and tools, consistently driving successful project outcomes. My unique blend of technical proficiency and collaborative leadership makes me a strong fit for your current goals.\n\nI look forward to the possibility of discussing this exciting opportunity with you.\n\nThank you for your time and consideration.'}
           </div>
           
           <div className="mt-10">
             Sincerely,<br/><br/><br/>
             <strong style={{ color: customColor }}>{info.fullName || 'Your Name'}</strong>
           </div>
        </div>
     </div>
   );
}

function ClassicAndrewTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-serif text-[12px] text-black p-[50px] leading-[1.5]">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4 mb-2">
          {info.photo && <img src={info.photo} alt="Profile" className="w-[70px] h-[70px] rounded-full object-cover border border-gray-300 shadow-sm" />}
          <div>
            <h1 className="text-[32px] font-bold mb-1 tracking-tight">{info.fullName || 'Andrew O\'Sullivan'}</h1>
            {info.title && <div className="italic text-[16px]">{info.title}</div>}
          </div>
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-800 tracking-tight">
          {[
            info.address && `📍 ${info.address}`,
            info.phone && `📞 ${info.phone}`,
            info.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a></span>,
            info.linkedin && <span className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn</a></span>,
            info.github && <span className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">GitHub</a></span>,
            info.website && <span className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Portfolio</a></span>
          ].filter(Boolean).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {info.summary && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-1 mb-2">Profile</h2>
            <p className="text-[12px] text-justify">{info.summary}</p>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-1 mb-3">Work Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[14px]">{exp.position}</span>
                  <span className="text-[12px]">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="italic text-[13px]">{exp.company}</span>
                  <span className="text-[12px]">{exp.location}</span>
                </div>
                {exp.description && (
                  <ul className="list-disc pl-5 text-[12px] space-y-0.5 ml-2 mt-1">
                    {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-1 mb-3">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[14px]">
                    {edu.degree}
                    {edu.gpa && <span className="font-normal italic text-[12px] text-gray-600 ml-2">GPA: {edu.gpa}</span>}
                  </span>
                  <span className="text-[12px]">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="italic text-[13px]">{edu.institution}</span>
                  <span className="text-[12px]">{edu.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-1 mb-2">Skills</h2>
            <ul className="list-disc pl-5 text-[12px] grid grid-cols-2 gap-x-8 gap-y-1 ml-2">
              {data.skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {data.projects?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-1 mb-3">Projects / Awards</h2>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[13px]">
                  {p.name} 
                  {p.tech && <span className="font-normal italic"> | {p.tech}</span>}
                  {p.link && <span className="font-normal mx-2">| <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                </span>
                {p.description && (
                  <ul className="list-disc pl-5 text-[12px] mt-1 space-y-0.5 ml-2">
                    {p.description?.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatherineTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full flex font-sans text-black">
      {/* Accent Strip */}
      <div className="w-[12%] bg-green-800" style={{ backgroundImage: 'linear-gradient(to bottom, #064e3b, #0f766e)' }}></div>
      
      {/* Main Content Area */}
      <div className="w-[88%] p-[50px] leading-[1.5]">
        <div className="mb-8 flex justify-between items-start">
          <div className="w-[75%]">
            <h1 className="text-[38px] font-semibold mb-1">{info.fullName || 'Catherine Bale'}</h1>
            {info.title && <div className="italic text-[18px] text-gray-700 mb-4">{info.title}</div>}
            <div className="flex flex-wrap gap-4 text-[12px] text-gray-800 font-medium">
              {info.email && <div className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a></div>}
              {info.phone && <div className="flex items-center gap-1">📞 {info.phone}</div>}
              {info.address && <div className="flex items-center gap-1">📍 {info.address}</div>}
              {info.linkedin && <div className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn</a></div>}
              {info.github && <div className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">GitHub</a></div>}
              {info.website && <div className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Portfolio</a></div>}
            </div>
          </div>
          <div className={`w-[20%] bg-gray-200 h-[100px] flex items-center justify-center text-gray-400 rounded overflow-hidden ${!info.photo ? 'border-2 border-dashed border-gray-300' : ''}`}>
            {info.photo ? <img src={info.photo} alt="Profile" className="w-full h-full object-cover" /> : '[Photo]'}
          </div>
        </div>

        <div className="space-y-6">
          {info.summary && (
            <div>
              <h2 className="text-[16px] font-bold border-b-2 border-black pb-1 mb-2">Profile</h2>
              <p className="text-[13px]">{info.summary}</p>
            </div>
          )}

          {data.experience?.length > 0 && (
            <div>
              <h2 className="text-[16px] font-bold border-b-2 border-black pb-1 mb-3">Professional Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="text-[14px]">
                      <span className="font-bold">{exp.company}</span>, <span className="italic">{exp.position}</span>
                    </div>
                    <span className="text-[12px]">{exp.startDate} – {exp.endDate || 'Present'}</span>
                  </div>
                  <div className="text-right text-[12px] mb-1">{exp.location}</div>
                  {exp.description && (
                    <ul className="list-disc pl-5 text-[13px] space-y-0.5 ml-2">
                      {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education?.length > 0 && (
            <div>
              <h2 className="text-[16px] font-bold border-b-2 border-black pb-1 mb-3">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[14px]">
                      <span className="font-bold">{edu.institution}</span>, <span className="italic">{edu.degree}</span>
                      {edu.gpa && <span className="text-[12px] text-gray-500 italic ml-2">GPA: {edu.gpa}</span>}
                    </div>
                    <span className="text-[12px]">{edu.startDate} – {edu.endDate || 'Present'}</span>
                  </div>
                  <div className="text-right text-[12px]">{edu.location}</div>
                </div>
              ))}
            </div>
          )}

          {data.projects?.length > 0 && (
            <div>
              <h2 className="text-[16px] font-bold border-b-2 border-black pb-1 mb-3">Certificates / Projects</h2>
              <div className="text-[13px] flex items-center flex-wrap gap-y-1">
                {data.projects.map((p, i) => (
                  <span key={i} className="font-medium">
                    {p.name} 
                    {p.link && <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">Link</a>}
                    {i < data.projects.length - 1 && <span className="mx-1">•</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.skills?.length > 0 && (
            <div>
              <h2 className="text-[16px] font-bold border-b-2 border-black pb-1 mb-3">Skills</h2>
              <ul className="list-disc pl-5 text-[13px] flex flex-wrap gap-x-8 gap-y-2 ml-2">
                {data.skills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AndrewSplitTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-serif text-[12px] text-black p-[50px] leading-[1.5]">
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight inline-block">{info.fullName || 'Andrew O\'Sullivan'}</h1> 
            {info.title && <span className="font-normal italic text-[18px] ml-2 text-gray-700">{info.title}</span>}
          </div>
          {info.photo && <img src={info.photo} alt="Profile" className="w-[60px] h-[60px] rounded-sm object-cover border border-gray-300" />}
        </div>
        <div className="flex justify-between text-[12px] mt-2 border-b-2 border-black pb-4">
          <div className="flex gap-4">
            {info.address && <div className="flex items-center gap-1">📍 {info.address}</div>}
            {info.phone && <div className="flex items-center gap-1">📞 {info.phone}</div>}
          </div>
          <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-right">
            {info.email && <div className="flex items-center justify-end gap-1">✉ <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a></div>}
            {info.linkedin && <div className="flex items-center justify-end gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn</a></div>}
            {info.github && <div className="flex items-center justify-end gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">GitHub</a></div>}
            {info.website && <div className="flex items-center justify-end gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Portfolio</a></div>}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {info.summary && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-y-2 border-black py-1 mb-2">Profile</h2>
            <p className="text-[12px] text-justify">{info.summary}</p>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-y-2 border-black py-1 mb-3">Professional Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4 flex">
                <div className="w-[30%] text-[12px] pr-4">
                  <div className="mb-0.5">{exp.startDate} – {exp.endDate || 'Present'}</div>
                  <div className="italic text-gray-700">{exp.location}</div>
                </div>
                <div className="w-[70%]">
                  <div className="font-bold text-[14px]">{exp.position}</div>
                  <div className="italic text-[13px] mb-1">{exp.company}</div>
                  {exp.description && (
                    <ul className="list-disc pl-5 text-[12px] space-y-0.5 ml-1">
                      {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-y-2 border-black py-1 mb-3">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 flex">
                <div className="w-[30%] text-[12px] pr-4">
                  <div className="mb-0.5">{edu.startDate} – {edu.endDate || 'Present'}</div>
                  <div className="italic text-gray-700">{edu.location}</div>
                </div>
                <div className="w-[70%]">
                  <div className="font-bold text-[14px]">
                    {edu.degree}
                    {edu.gpa && <span className="font-normal italic text-[12px] text-gray-600 ml-2">GPA: {edu.gpa}</span>}
                  </div>
                  <div className="italic text-[13px]">{edu.institution}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold uppercase border-y-2 border-black py-1 mb-2">Skills</h2>
            <ul className="list-disc pl-5 text-[12px] grid grid-cols-2 gap-x-8 gap-y-1 ml-2">
              {data.skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function LeeHarvardTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-sans text-[12px] text-black pt-[50px] pb-[50px] pl-[60px] pr-[60px] leading-[1.5]">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          {info.photo && <img src={info.photo} alt="Profile" className="w-[70px] h-[70px] rounded object-cover shadow-sm" />}
        </div>
        <h1 className="text-[36px] font-bold mb-1 tracking-tight leading-none">{info.fullName || 'Lee Wang'}</h1>
        {info.title && <div className="text-[16px] italic text-gray-800 mb-1">{info.title}</div>}
        <div className="text-[13px] pt-1 font-medium flex flex-wrap justify-center gap-x-4 gap-y-1">
          {info.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a></span>}
          {info.phone && <span className="flex items-center gap-1">📞 {info.phone}</span>}
          {info.linkedin && <span className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn</a></span>}
          {info.github && <span className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">GitHub</a></span>}
          {info.website && <span className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Portfolio</a></span>}
        </div>
      </div>
      
      <div className="space-y-4">
        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold mb-1 border-b-[2px] border-black pb-0.5">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 mt-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[14px]">
                    {edu.institution}
                    {edu.gpa && <span className="font-normal italic text-[12px] text-gray-600 ml-2">GPA: {edu.gpa}</span>}
                  </span>
                  <span className="text-[12px]">{edu.endDate || edu.startDate}</span>
                </div>
                <div className="italic text-[13px] font-medium mb-1">{edu.degree}</div>
                {edu.location && <div className="text-[12px]">{edu.location}</div>}
              </div>
            ))}
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold mb-2 border-b-[2px] border-black pb-0.5">Technical Skills</h2>
            <ul className="list-disc pl-5 text-[12px] grid grid-cols-3 gap-x-4 gap-y-1 ml-2 mt-2 font-medium">
              {data.skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold mb-1 border-b-[2px] border-black pb-0.5 mt-2">Professional Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4 mt-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[14px]">{exp.company}</span>
                  <span className="text-[12px]">{exp.startDate} – {exp.endDate || 'present'}</span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="italic text-[13px] font-medium">{exp.position}</span>
                  <span className="text-[12px] font-medium">{exp.location}</span>
                </div>
                {exp.description && (
                  <ul className="list-disc pl-5 text-[12px] space-y-0.5 ml-2 mt-1 font-medium">
                    {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold mb-1 border-b-[2px] border-black pb-0.5 mt-2">Projects</h2>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-2 mt-2">
                <span className="font-bold text-[13px]">
                  {p.name}
                  {p.link && <span className="font-normal mx-2">| <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                </span>
                {p.description && (
                  <ul className="list-disc pl-5 text-[12px] mt-1 space-y-0.5 ml-2 font-medium">
                    {p.description?.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NadiaTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-serif text-[12px] text-black pt-[50px] pb-[50px] pl-[60px] pr-[60px] leading-[1.5]">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          {info.photo && <img src={info.photo} alt="Profile" className="w-[75px] h-[75px] rounded-full object-cover border-2 border-gray-200" />}
        </div>
        <h1 className="text-[32px] font-bold mb-2 tracking-tight">{info.fullName || 'Nadia Smith'}</h1>
        {info.title && <div className="text-[15px] text-gray-700 italic tracking-wide mb-2 uppercase">{info.title}</div>}
        <div className="text-[12px] font-medium flex flex-wrap justify-center gap-x-4 gap-y-1">
          {info.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a></span>}
          {info.phone && <span className="flex items-center gap-1">📞 {info.phone}</span>}
          {info.linkedin && <span className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn</a></span>}
          {info.github && <span className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">GitHub</a></span>}
          {info.website && <span className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Portfolio</a></span>}
        </div>
      </div>
      
      <div className="space-y-4">
        {data.education?.length > 0 && (
          <div>
            <div className="border-y-[1px] border-black text-center py-1 mb-3">
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Education</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[13px] uppercase">
                    {edu.institution}
                    {edu.gpa && <span className="font-normal italic text-[12px] text-gray-500 normal-case ml-2">GPA: {edu.gpa}</span>}
                  </span>
                  <span className="text-[12px]">{edu.startDate} – {edu.endDate || 'Present'}</span>
                </div>
                <div className="italic text-[13px] mb-1">{edu.degree}</div>
                {edu.location && <div className="text-[12px] mb-1">{edu.location}</div>}
              </div>
            ))}
          </div>
        )}

        {data.experience?.length > 0 && (
          <div>
            <div className="border-y-[1px] border-black text-center py-1 mb-3 mt-1">
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Work Experience</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[13px] uppercase">{exp.company}</span>
                  <span className="text-[12px]">{exp.startDate} – {exp.endDate || 'present'}</span>
                </div>
                <div className="italic text-[13px] mb-1 uppercase">{exp.position}</div>
                {exp.description && (
                  <ul className="list-disc pl-5 text-[12px] space-y-0.5 ml-2 mt-1">
                    {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <div className="border-y-[1px] border-black text-center py-1 mb-3 mt-1">
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Skills</h2>
            </div>
            <div className="text-[12px] text-center">{data.skills.join(' • ')}</div>
          </div>
        )}
        
        {data.projects?.length > 0 && (
          <div>
            <div className="border-y-[1px] border-black text-center py-1 mb-3 mt-1">
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Projects</h2>
            </div>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[13px] uppercase">
                  {p.name}
                  {p.link && <span className="font-normal normal-case mx-2">| <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                </span>
                {p.description && (
                  <ul className="list-disc pl-5 text-[12px] mt-1 space-y-0.5 ml-2">
                    {p.description?.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 leading-[1.5]">{l}</li> : null)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TechTimelineTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-sans text-[12px] text-gray-800 p-[50px] leading-[1.6]">
      <div className="border-b-2 border-blue-500 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[34px] font-extrabold text-gray-900 leading-none tracking-tight mb-1">{info.fullName || 'Alex Developer'}</h1>
            {info.title && <div className="text-[16px] text-blue-600 font-bold">{info.title}</div>}
          </div>
          {info.photo && <img src={info.photo} alt="Profile" className="w-[60px] h-[60px] rounded-full object-cover border-2 border-blue-100" />}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-600 mt-3 font-medium">
          {info.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:text-blue-500">{info.email}</a></span>}
          {info.phone && <span className="flex items-center gap-1">📞 {info.phone}</span>}
          {info.address && <span className="flex items-center gap-1">📍 {info.address}</span>}
          {info.linkedin && <span className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">LinkedIn</a></span>}
          {info.github && <span className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">GitHub</a></span>}
          {info.website && <span className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Portfolio</a></span>}
        </div>
      </div>

      <div className="space-y-5">
        {info.summary && (
          <div>
             <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-1">Profile</h2>
             <p className="text-[13px]">{info.summary}</p>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-3">Experience</h2>
            <div className="border-l-2 border-gray-200 pl-4 space-y-4 ml-1">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-white"></div>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-gray-900">{exp.company}</span>
                    <span className="text-[12px] font-medium text-gray-500 bg-gray-50 px-2 rounded">{exp.startDate} – {exp.endDate || 'Present'}</span>
                  </div>
                  <div className="italic text-[13px] text-blue-600 font-medium mb-1">{exp.position} <span className="text-gray-400 not-italic font-normal">| {exp.location}</span></div>
                  {exp.description && (
                    <ul className="list-disc pl-4 text-[12px] space-y-0.5">
                      {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1 text-gray-700">{l}</li> : null)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-3">Education</h2>
            <div className="border-l-2 border-gray-200 pl-4 space-y-3 ml-1">
              {data.education.map((edu, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 bg-gray-400 rounded-full ring-4 ring-white"></div>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-gray-900">{edu.institution}</span>
                    <span className="text-[12px] font-medium text-gray-500">{edu.startDate} – {edu.endDate || 'Present'}</span>
                  </div>
                  <div className="text-[13px] text-gray-800">
                    <span className="italic">{edu.degree}</span>
                    {edu.gpa && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[11px] font-bold">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-2">Projects</h2>
            <div className="grid grid-cols-1 gap-3">
              {data.projects.map((p, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-bold text-[13px] text-gray-900 mb-0.5">
                    {p.name}
                    {p.link && <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline font-normal text-[12px]">↗ Link</a>}
                  </div>
                  {p.tech && <div className="text-[11px] text-blue-600 font-medium mb-1">{p.tech}</div>}
                  {p.description && <p className="text-[12px] text-gray-700 leading-snug">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-2">Technical Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[11px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModernDualToneTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full font-sans text-gray-800 leading-[1.6]">
      {/* Heavy Header */}
      <div className="bg-slate-900 text-white p-[40px] px-[50px]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-1">{info.fullName || 'Jordan Smith'}</h1>
            {info.title && <div className="text-[18px] text-blue-400 font-medium mb-3">{info.title}</div>}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-300">
              {info.email && <div className="flex items-center gap-1">✉ <a href={`mailto:${info.email}`} className="hover:text-white">{info.email}</a></div>}
              {info.phone && <div className="flex items-center gap-1">📞 {info.phone}</div>}
              {info.address && <div className="flex items-center gap-1">📍 {info.address}</div>}
              {info.linkedin && <div className="flex items-center gap-1">🔗 <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></div>}
              {info.github && <div className="flex items-center gap-1">💻 <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></div>}
              {info.website && <div className="flex items-center gap-1">🌐 <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Portfolio</a></div>}
            </div>
          </div>
          {info.photo && <img src={info.photo} alt="Profile" className="w-[80px] h-[80px] rounded object-cover border-2 border-slate-700" />}
        </div>
      </div>
      
      {/* 2-Column Body */}
      <div className="flex p-[50px] gap-8">
        
        {/* Left Column (Narrower) */}
        <div className="w-[35%] space-y-6">
          {info.summary && (
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 border-b-2 border-blue-500 pb-1 mb-2 uppercase tracking-wide">Summary</h2>
              <p className="text-[12px] text-gray-600 text-justify">{info.summary}</p>
            </div>
          )}

          {data.education?.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 border-b-2 border-blue-500 pb-1 mb-3 uppercase tracking-wide">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-[13px] text-slate-800">{edu.degree}</div>
                    <div className="text-[12px] text-gray-600 font-medium">{edu.institution}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{edu.startDate} – {edu.endDate || 'Present'}</div>
                    {edu.gpa && <div className="text-[11px] font-bold text-blue-600 mt-0.5">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills?.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 border-b-2 border-blue-500 pb-1 mb-3 uppercase tracking-wide">Skills</h2>
              <ul className="list-none text-[12px] space-y-1 font-medium text-gray-700">
                {data.skills.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (Wider) */}
        <div className="w-[65%] space-y-6">
          {data.experience?.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 border-b-2 border-blue-500 pb-1 mb-3 uppercase tracking-wide">Experience</h2>
              <div className="space-y-5">
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-[15px] text-slate-900">{exp.position}</span>
                      <span className="text-[12px] font-bold text-blue-600">{exp.startDate} – {exp.endDate || 'Present'}</span>
                    </div>
                    <div className="italic text-[13px] text-gray-600 mb-2">{exp.company} | {exp.location}</div>
                    {exp.description && (
                      <ul className="list-disc pl-4 text-[12px] text-gray-700 space-y-1">
                        {exp.description.split('\n').map((l, idx) => l.trim() ? <li key={idx} className="pl-1">{l}</li> : null)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.projects?.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 border-b-2 border-blue-500 pb-1 mb-3 uppercase tracking-wide">Key Projects</h2>
              <div className="space-y-4">
                {data.projects.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-[14px] text-slate-900">{p.name}</span>
                      {p.link && <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 font-bold">View Project ↗</a>}
                    </div>
                    {p.tech && <div className="text-[12px] font-medium text-slate-500 mb-1">{p.tech}</div>}
                    {p.description && <p className="text-[12px] text-gray-700">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StartupFunctionalTemplate({ data }) {
  const info = data.personalInfo || {};
  return (
    <div className="bg-white w-full min-h-full p-[50px] leading-[1.6]">
      <div className="font-mono text-[11px] text-gray-800">
        
        {/* Header Block */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-2">
            {info.photo && <img src={info.photo} alt="img" className="w-[80px] h-[80px] object-cover border border-black p-0.5" />}
            <div>
               <h1 className="text-[32px] font-bold text-black leading-none mb-1">{info.fullName || 'root@user'}</h1>
               {info.title && <div className="text-[15px] bg-black text-white px-2 py-0.5 inline-block font-bold">~/{info.title}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4 text-[11px] border-y border-dashed border-gray-400 py-3">
            {info.email && <div><span className="text-gray-500">email:</span> <a href={`mailto:${info.email}`} className="text-blue-600 hover:underline">{info.email}</a></div>}
            {info.phone && <div><span className="text-gray-500">phone:</span> {info.phone}</div>}
            {info.address && <div><span className="text-gray-500">loc:</span> {info.address}</div>}
            {info.linkedin && <div><span className="text-gray-500">in:</span> <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></div>}
            {info.github && <div><span className="text-gray-500">git:</span> <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a></div>}
            {info.website && <div><span className="text-gray-500">web:</span> <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></div>}
          </div>
        </div>

        {info.summary && (
          <div className="mb-5">
            <h2 className="font-bold text-[13px] text-black mb-1">[ profile_summary ]</h2>
            <div className="pl-4 border-l-2 border-gray-200 text-gray-700">
               {info.summary}
            </div>
          </div>
        )}

        {data.skills?.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-[13px] text-black mb-2">[ core_technologies ]</h2>
            <div className="flex flex-wrap gap-2 pl-4">
              {data.skills.map((s, i) => (
                <span key={i} className="border border-black px-1.5 py-0.5 font-bold uppercase text-[10px] bg-gray-50 tracking-wider">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-[13px] text-black mb-3">[ professional_experience ]</h2>
            <div className="pl-4 space-y-5">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[14px] text-black">{exp.position}</span>
                    <span className="text-gray-400">@</span>
                    <span className="font-bold text-[13px] text-gray-800">{exp.company}</span>
                  </div>
                  <div className="text-gray-500 mb-1.5">
                    {exp.startDate} -{'>'} {exp.endDate || 'HEAD'} | {exp.location}
                  </div>
                  {exp.description && (
                    <div className="space-y-1">
                      {exp.description.split('\n').map((l, idx) => l.trim() ? (
                        <div key={idx} className="flex items-start text-gray-700">
                          <span className="text-gray-400 mr-2">{'>'}</span> 
                          <span>{l}</span>
                        </div>
                      ) : null)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects?.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-[13px] text-black mb-3">[ shipped_projects ]</h2>
            <div className="pl-4 grid grid-cols-2 gap-4">
              {data.projects.map((p, i) => (
                <div key={i} className="border border-gray-300 p-2 border-l-4 border-l-black bg-gray-50">
                  <div className="font-bold text-[13px] text-black mb-0.5">
                    {p.name}
                  </div>
                  {p.link && <div className="mb-1"><a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">src_link</a></div>}
                  {p.tech && <div className="text-gray-500 font-bold mb-1 border-b border-dashed border-gray-300 pb-1">{p.tech}</div>}
                  {p.description && <p className="text-gray-700 leading-tight mt-1">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education?.length > 0 && (
          <div className="mb-2">
            <h2 className="font-bold text-[13px] text-black mb-3">[ education_log ]</h2>
            <div className="pl-4 space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[13px] text-black">{edu.degree} {edu.gpa && <span className="bg-green-100 text-green-800 px-1 ml-1 font-bold">GPA:{edu.gpa}</span>}</div>
                    <div className="text-gray-700">{edu.institution}</div>
                  </div>
                  <div className="text-gray-500 text-right">
                    <div>{edu.startDate} -{'>'} {edu.endDate || 'HEAD'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ResumeEditor() {
  const { id } = useParams();
  const { token, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [resume, setResume] = useState(EMPTY_RESUME);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [enhancing, setEnhancing] = useState({});
  const autoSaveRef = useRef(null);

  const enhanceText = async (type, idx) => {
    const textToEnhance = resume[type]?.[idx]?.description;
    if (!textToEnhance || textToEnhance.trim() === '') return toast.error('Add basic text first to enhance!');
    
    setEnhancing(p => ({ ...p, [`${type}_${idx}`]: true }));
    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!groqKey) {
        toast.error('VITE_GROQ_API_KEY is missing in .env!');
        setEnhancing(p => ({ ...p, [`${type}_${idx}`]: false }));
        return;
      }
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'system',
            content: 'You are an expert executive resume writer. Take the user\'s bullet points and rewrite them to be highly professional, action-oriented, quantifiable, and ATS-friendly. Return ONLY the rewritten text, formatted as a bulleted list. Do not include introductory remarks.'
          }, {
            role: 'user',
            content: `Rewrite this description to be professional and impactful:\n\n${textToEnhance}`
          }],
          temperature: 0.7,
        })
      });
      const groqData = await response.json();
      if (groqData.choices && groqData.choices.length > 0) {
        let enhancedText = groqData.choices[0].message.content.trim();
        if (enhancedText.startsWith('"') && enhancedText.endsWith('"')) enhancedText = enhancedText.slice(1, -1);
        const updateFunc = type === 'experience' ? updateExp : updateProject;
        updateFunc(idx, 'description', enhancedText);
        toast.success('Enhanced with Groq AI!');
      } else {
        toast.error(groqData.error?.message || 'AI format failed.');
      }
    } catch(e) {
      toast.error('Failed to connect to Groq.');
      console.error(e);
    } finally {
      setEnhancing(p => ({ ...p, [`${type}_${idx}`]: false }));
    }
  };

  useEffect(() => {
    if (id && id !== 'new') fetchResume();
  }, [id]);

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (id && id !== 'new') autoSave();
    }, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [resume]);

  const fetchResume = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      const content = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || {});
      setResume({ title: data.title, templateId: data.templateId || 1, ...EMPTY_RESUME, ...content });
    } catch { toast.error('Failed to load resume'); }
  };

  const autoSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/resumes/${id}`,
        { title: resume.title, content: JSON.stringify(resume), templateId: resume.templateId, isDraft: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {}
  };

  const saveResume = async () => {
    setSaving(true);
    setShowSaveModal(false);
    try {
      const activeTitle = saveTitle || resume.title || 'My Resume';
      if (resume.title !== activeTitle) update('title', activeTitle);
      
      const payload = {
        title: activeTitle,
        content: JSON.stringify({...resume, title: activeTitle}),
        templateId: resume.templateId || 1,
        isDraft: false
      };

      console.log('Saving resume...', payload);

      if (id && id !== 'new') {
        // Update existing resume
        const res = await axios.put(`http://localhost:8080/api/resumes/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', res.data);
        toast.success('Resume saved successfully!');
      } else {
        // Create new resume
        const res = await axios.post('http://localhost:8080/api/resumes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Create response:', res.data);
        const newId = res.data.data?.id;
        if (newId) {
          toast.success('Resume created successfully!');
          navigate(`/resume/${newId}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      console.error('Error response:', err.response);
      toast.error(err.response?.data?.message || 'Failed to save resume. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const element = document.getElementById('resume-preview-container');
      if (!element) {
        toast.error('Resume preview not found');
        return;
      }
      toast.info('Generating PDF...');
      
      const safeTitle = (resume?.title || 'My_Resume').replace(/[^a-zA-Z0-9-_\s]/g, '');
      const finalFilename = `${safeTitle}.pdf`;
      const opt = {
        margin:       0,
        filename:     finalFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).output('blob').then(async (pdfBlob) => {
        try {
          if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
              suggestedName: finalFilename,
              types: [{
                description: 'PDF Document',
                accept: { 'application/pdf': ['.pdf'] }
              }]
            });
            const writable = await handle.createWritable();
            await writable.write(pdfBlob);
            await writable.close();
            toast.success('Downloaded PDF successfully!');
            return;
          }
        } catch (err) {
          if (err.name === 'AbortError') return;
          console.error('File picker error:', err);
        }
        
        saveAs(pdfBlob, finalFilename);
        toast.success('Downloaded PDF successfully!');
      });
    } catch {
      toast.error('Failed to generate PDF');
    }
  };



  const update = (path, value) => {
    const parts = path.split('.');
    setResume(prev => {
      const next = { ...prev };
      if (parts.length === 1) next[parts[0]] = value;
      else if (parts.length === 2) next[parts[0]] = { ...next[parts[0]], [parts[1]]: value };
      return next;
    });
  };

  const addExp = () => setResume(p => ({ ...p, experience: [...(p.experience || []), { company: '', position: '', startDate: '', endDate: '', location: '', description: '' }] }));
  const removeExp = (i) => setResume(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  const updateExp = (i, field, val) => setResume(p => { const arr = [...p.experience]; arr[i] = { ...arr[i], [field]: val }; return { ...p, experience: arr }; });

  const addEdu = () => setResume(p => ({ ...p, education: [...(p.education || []), { institution: '', degree: '', startDate: '', endDate: '', gpa: '' }] }));
  const removeEdu = (i) => setResume(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));
  const updateEdu = (i, field, val) => setResume(p => { const arr = [...p.education]; arr[i] = { ...arr[i], [field]: val }; return { ...p, education: arr }; });

  const handleDragStart = (e, index, listType) => {
    e.dataTransfer.setData('sourceIndex', index);
    e.dataTransfer.setData('listType', listType);
  };
  
  const handleDrop = (e, targetIndex, listType) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData('sourceIndex');
    const sourceList = e.dataTransfer.getData('listType');
    if (sourceList !== listType || sourceIndex === '') return;
    
    const src = parseInt(sourceIndex);
    if (src === targetIndex) return;
    
    setResume(p => {
      const arr = [...(p[listType] || [])];
      const [removed] = arr.splice(src, 1);
      arr.splice(targetIndex, 0, removed);
      return { ...p, [listType]: arr };
    });
  };
  const handleDragOver = (e) => e.preventDefault();

  const addSkill = () => { if (newSkill.trim()) { setResume(p => ({ ...p, skills: [...(p.skills || []), newSkill.trim()] })); setNewSkill(''); } };
  const removeSkill = (i) => setResume(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  const addProject = () => setResume(p => ({ ...p, projects: [...(p.projects || []), { name: '', description: '', tech: '', link: '' }] }));
  const removeProject = (i) => setResume(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));
  const updateProject = (i, field, val) => setResume(p => { const arr = [...p.projects]; arr[i] = { ...arr[i], [field]: val }; return { ...p, projects: arr }; });

  const tabs = [
    { id: 'personal', label: '👤 Personal' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '⚡ Skills' },
    { id: 'projects', label: '🚀 Projects' },
    { id: 'coverLetter', label: '📝 Cover Letter' },
    { id: 'template', label: '🎨 Template' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900">← Back</button>
          <input
            value={resume.title}
            onChange={e => update('title', e.target.value)}
            className="text-lg font-bold border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-3">
          <span className="text-xs text-gray-400 self-center">Auto-saving...</span>
          <button onClick={() => { setSaveTitle(resume.title || 'My Resume'); setShowSaveModal(true); }} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {id && id !== 'new' && (
            <button
              onClick={downloadPdf}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Form Panel */}
        <div className="w-1/2 bg-white overflow-y-auto border-r">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b bg-gray-50">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Personal Info */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                {[
                  ['fullName', 'Full Name', 'text', 'John Doe'],
                  ['title', 'Job Title', 'text', 'e.g. Senior Data Analyst'],
                  ['email', 'Email', 'email', 'john@example.com'],
                  ['phone', 'Phone', 'tel', '+1 234 567 8900'],
                  ['address', 'Address / City', 'text', 'New York, NY'],
                  ['linkedin', 'LinkedIn URL', 'text', 'linkedin.com/in/johndoe'],
                  ['github', 'GitHub URL', 'text', 'github.com/johndoe'],
                  ['website', 'Website / Portfolio', 'text', 'johndoe.com'],
                ].map(([field, label, type, ph]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} placeholder={ph}
                      value={resume.personalInfo?.[field] || ''}
                      onChange={e => update(`personalInfo.${field}`, e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                  <textarea rows={4} placeholder="Write a brief professional summary..."
                    value={resume.personalInfo?.summary || ''}
                    onChange={e => update('personalInfo.summary', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Optional)</label>
                  <input type="file" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => update('personalInfo.photo', reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  {resume.personalInfo?.photo && (
                     <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded border">
                       <img src={resume.personalInfo.photo} alt="Preview" className="h-12 w-12 rounded object-cover border"/>
                       <button onClick={() => update('personalInfo.photo', '')} className="text-red-500 text-sm hover:underline font-medium">Remove Photo</button>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Work Experience</h2>
                  <button onClick={addExp} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add</button>
                </div>
                {(resume.experience || []).map((exp, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white"
                     draggable
                     onDragStart={(e) => handleDragStart(e, i, 'experience')}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, i, 'experience')}
                  >
                    <div className="flex justify-between items-center cursor-move text-gray-400">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-800">☰</span>
                         <span className="font-medium text-gray-700">Experience #{i + 1}</span>
                      </div>
                      <button onClick={() => removeExp(i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    {[['position', 'Job Title'], ['company', 'Company'], ['location', 'Location']].map(([f, l]) => (
                      <div key={f}>
                        <label className="text-xs text-gray-500">{l}</label>
                        <input value={exp[f] || ''} onChange={e => updateExp(i, f, e.target.value)}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1" />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500">Start Date</label><input type="month" value={exp.startDate || ''} onChange={e => updateExp(i, 'startDate', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mt-1" /></div>
                      <div><label className="text-xs text-gray-500">End Date</label><input type="month" value={exp.endDate || ''} onChange={e => updateExp(i, 'endDate', e.target.value)} placeholder="Present" className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mt-1" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-gray-500">Description</label>
                        <button onClick={() => enhanceText('experience', i)} disabled={enhancing[`experience_${i}`]} className="text-[11px] bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition">
                          {enhancing[`experience_${i}`] ? '✨ Enhancing...' : '✨ Enhance with AI'}
                        </button>
                      </div>
                      <textarea rows={3} value={exp.description || ''} onChange={e => updateExp(i, 'description', e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mt-1" />
                    </div>
                  </div>
                ))}
                {(resume.experience || []).length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                    <p>No experience added yet.</p>
                    <button onClick={addExp} className="mt-2 text-blue-600 hover:underline text-sm">+ Add Experience</button>
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Education</h2>
                  <button onClick={addEdu} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add</button>
                </div>
                {(resume.education || []).map((edu, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white"
                     draggable
                     onDragStart={(e) => handleDragStart(e, i, 'education')}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, i, 'education')}
                  >
                    <div className="flex justify-between items-center cursor-move text-gray-400">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-800">☰</span>
                         <span className="font-medium text-gray-700">Education #{i + 1}</span>
                      </div>
                      <button onClick={() => removeEdu(i)} className="text-red-500 text-sm hover:underline">Remove</button>
                    </div>
                    {[['institution', 'Institution / University'], ['degree', 'Degree / Major'], ['gpa', 'GPA (optional)']].map(([f, l]) => (
                      <div key={f}><label className="text-xs text-gray-500">{l}</label>
                        <input value={edu[f] || ''} onChange={e => updateEdu(i, f, e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mt-1" /></div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500">Start Year</label><input type="month" value={edu.startDate || ''} onChange={e => updateEdu(i, 'startDate', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none mt-1" /></div>
                      <div><label className="text-xs text-gray-500">End Year</label><input type="month" value={edu.endDate || ''} onChange={e => updateEdu(i, 'endDate', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none mt-1" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Skills</h2>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Type a skill and press Enter or Add"
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(resume.skills || []).map((skill, i) => (
                    <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                      <button onClick={() => removeSkill(i)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                  ))}
                </div>
                {(resume.skills || []).length === 0 && (
                  <p className="text-gray-400 text-sm">No skills added. Type above and click Add.</p>
                )}
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Projects</h2>
                  <button onClick={addProject} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add</button>
                </div>
                {(resume.projects || []).map((proj, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Project #{i + 1}</span>
                      <button onClick={() => removeProject(i)} className="text-red-500 text-sm">Remove</button>
                    </div>
                    {[['name', 'Project Name'], ['tech', 'Technologies Used'], ['link', 'Project Link']].map(([f, l]) => (
                      <div key={f}><label className="text-xs text-gray-500">{l}</label>
                        <input value={proj[f] || ''} onChange={e => updateProject(i, f, e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mt-1" /></div>
                    ))}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-gray-500">Description</label>
                        <button onClick={() => enhanceText('projects', i)} disabled={enhancing[`projects_${i}`]} className="text-[11px] bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition">
                          {enhancing[`projects_${i}`] ? '✨ Enhancing...' : '✨ Enhance with AI'}
                        </button>
                      </div>
                      <textarea rows={3} value={proj.description || ''} onChange={e => updateProject(i, 'description', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none resize-none mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Cover Letter Editor */}
            {activeTab === 'coverLetter' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Cover Letter Details</h2>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Recipient Details (Hiring Manager, Company, etc.)</label>
                  <textarea rows={3} value={resume.coverLetter?.recipient || ''} onChange={e => update('coverLetter.recipient', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1" 
                    placeholder="e.g. John Doe&#10;Hiring Manager&#10;Google Inc." />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Letter Body</label>
                  <textarea rows={12} value={resume.coverLetter?.body || ''} onChange={e => update('coverLetter.body', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1" 
                    placeholder="Dear Hiring Manager,&#10;&#10;I am writing to..." />
                </div>
              </div>
            )}

            {/* Template Selector */}
            {activeTab === 'template' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Choose Template</h2>
                  {user?._id && (
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-gray-600">Accent Color:</span>
                       <input type="color" value={resume.settings?.color || TEMPLATES.find(t => t.id === resume.templateId)?.color || '#1f2937'} 
                         onChange={e => update('settings.color', e.target.value)} 
                         className="w-8 h-8 cursor-pointer p-0 border-0" 
                       />
                       {(resume.settings?.color) && (
                         <button onClick={() => update('settings.color', '')} className="text-xs text-red-500 hover:underline">Reset</button>
                       )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => (!t.isPremium || user?.hasPremiumAccess) && update('templateId', t.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition ${resume.templateId === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'} ${(t.isPremium && !user?.hasPremiumAccess) ? 'opacity-70' : ''}`}>
                      <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: t.color }}></div>
                      <p className="font-medium text-sm">{t.name}</p>
                      {t.isPremium ? (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">👑 Premium</span>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Free</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-1/2 bg-gray-200 overflow-y-auto">
          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">📄 Live Preview</h3>
              <ATSScoreWidget resume={resume} />
            </div>
            <div id="resume-preview-container" className="bg-white rounded-xl shadow-lg overflow-hidden flex" style={{ minHeight: '842px' }}>
              {activeTab === 'coverLetter' ? (
                <CoverLetterPreview data={resume} templateId={resume.templateId || 1} />
              ) : (
                <ResumePreview data={resume} templateId={resume.templateId || 1} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save As Modal Overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Name Your Resume</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume Document Title:</label>
              <input 
                type="text" 
                value={saveTitle} 
                onChange={(e) => setSaveTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveResume()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-800 font-medium"
                placeholder="e.g. Data Analyst - Google App"
              />
              <p className="text-xs text-gray-500 mt-2">This is the filename that will be saved in your dashboard.</p>
            </div>
            
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveResume}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
