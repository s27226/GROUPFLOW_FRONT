import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { ModerationPanel } from '../../../components/moderation';
import { Layout } from '../../../components/layout';

const ModerationPage = () => {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && !isModerator) {
      navigate('/');
    }
  }, [user, isModerator, navigate]);

  if (!user) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>{t('common.loading')}</p>
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
