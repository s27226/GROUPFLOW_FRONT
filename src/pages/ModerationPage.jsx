import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModerationPanel from '../components/ModerationPanel';
import Layout from '../components/Layout';

const ModerationPage = () => {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ModerationPage - user:', user, 'isModerator:', isModerator);
    if (user && !isModerator) {
      console.log('Redirecting - not a moderator');
      navigate('/');
    }
  }, [user, isModerator, navigate]);

  if (!user) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <Layout>
      <ModerationPanel />
    </Layout>
  );
};

export default ModerationPage;
