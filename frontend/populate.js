const baseUrl = 'http://localhost:8080/api';

async function run() {
  const email = 'sarah.m' + Math.floor(Math.random() * 10000) + '@example.com';
  
  try {
    const signup = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.split('@')[0], name: 'Sarah Mitchell', fullName: 'Sarah Mitchell', email, password: 'Password123!' })
    });
  } catch(e) {}

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: email, password: 'Password123!' })
  });
  const loginText = await loginRes.text();
  let token = null;
  try {
     const loginData = JSON.parse(loginText);
     token = loginData.data?.token || loginData.token;
  } catch(e) {}
  
  if (!token) {
     console.log('Login failed');
     return;
  }

  const resume = {
    title: 'Senior Data Scientist',
    templateId: 3, 
    personalInfo: {
      fullName: 'Sarah Mitchell',
      email: email,
      phone: '+1 (555) 123-4567',
      address: 'Seattle, WA',
      linkedin: 'linkedin.com/in/sarah-mitchell-ds',
      github: 'github.com/sarah-m-data',
      website: 'sarah-portfolio.dev',
      summary: 'Data Scientist with 5+ years of experience in deploying scalable machine learning models. Adept at building end-to-end predictive pipelines and turning messy data into actionable insights.'
    },
    experience: [
      {
        company: 'Meta',
        position: 'Senior Data Scientist',
        startDate: '2021-06',
        endDate: '',
        location: 'Seattle, WA',
        description: 'Led the development of a real-time recommendation engine that increased user engagement by 15%.\nOrchestrated A/B tests to identify high-conversion user flows across 5 platforms.\nMentored 3 junior data scientists and established ML best practices.'
      },
      {
        company: 'Zillow',
        position: 'Data Analyst',
        startDate: '2018-09',
        endDate: '2021-05',
        location: 'Seattle, WA',
        description: 'Developed automated dashboarding solutions saving the analytics team 10 hours per week.\nPerformed ad-hoc SQL querying to support marketing decisions.'
      }
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'M.S. in Computer Science',
        startDate: '2016-09',
        endDate: '2018-06',
        gpa: '3.9'
      }
    ],
    skills: ['Python', 'SQL', 'TensorFlow', 'PyTorch', 'AWS', 'Tableau', 'Spark'],
    projects: [
      {
        name: 'Predictive Churn Model',
        tech: 'Python, XGBoost, Docker',
        link: 'github.com/sarah-m-data/churn-model',
        description: 'Built a predictive model that identifies at-risk subscribers with 92% accuracy.\nDeployed the model on AWS ECS using a custom Docker container.'
      }
    ]
  };

  const payload = {
    title: resume.title,
    content: JSON.stringify(resume),
    templateId: resume.templateId,
    isDraft: false
  };

  const createRes = await fetch(`${baseUrl}/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  console.log('Create res', createRes.status);
  const data = await createRes.json();
  console.log('Resume created ID:', data.data?.id, 'Email:', email);
}
run();
