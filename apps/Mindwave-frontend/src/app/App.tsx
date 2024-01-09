import { Route, Routes, Navigate  } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import { RecoilRoot, useRecoilState } from 'recoil';
import { themeState } from '../components/UtilityComponents/ThemeState';
//import Header from '../components/HeaderComponent/Header';
import LeftSidebar from '../components/SidebarComponents/LeftSideBarComponent/LeftSidebarComponent'; 
import RightSidebarComponent from '../components/SidebarComponents/RightSideBarComponent/RightSidebarComponent';
import UserProfile from '../components/UserComponents/UserProfileComponent';
import LoginPage from '../components/AuthenticationComponents/LoginModal/LoginPage';
import styles from './App.module.scss';
import { AuthProvider, useAuth } from '../components/AuthenticationComponents/AuthContext';
import VerifyEmail from '../components/AuthenticationComponents/VerifyEmailComponent/VerifyEmail';
import { useLocation } from 'react-router-dom';
import ResetPassword from '../components/AuthenticationComponents/passwordResetComponent/PasswordReset';
import ForgotPassword from '../components/AuthenticationComponents/passwordResetComponent/ForgotPasswordComponent';
import SettingsPage from '../components/UserComponents/SettingPageComponent';
import VerifyEmailSuccess from '../components/RegisterComponents/VerifyEmailSuccess';
import HelpPage from '../components/HelpComponent/HelpComponent';

type ProtectedRouteProps = {
  children: ReactNode;
};
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // console.log("Accessing Protected Route, Auth Status:", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};


function App() {
  const [, setTheme] = useRecoilState(themeState);
  // console.log('process.env: ',process.env);
  
// ProtectedRoute Component

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    const header = document.querySelector('.header') as HTMLElement;
    const sidebar = document.querySelector('.leftSidebar') as HTMLElement;
    if (header && sidebar) {
      sidebar.style.top = `${header.offsetHeight}px`;
    }
  }, [setTheme]);
  
  return (
    <AuthProvider>
    <RecoilRoot>
      <Routes>
        <Route path="*" element={<Layout />} />
      </Routes>
    </RecoilRoot>
    </AuthProvider>
  );
}

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname.startsWith('/reset-password');
  const isVerifyEmailSuccessPage = location.pathname === '/auth/verify-email-success';

  return (
    <AuthProvider>
      <div className={isAuthPage ? styles.authLayout : styles.layout}>
      {!isAuthPage && !isVerifyEmailSuccessPage && <LeftSidebar />}
        <div className={styles['dashboard-container']}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/user/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/settings" element={<SettingsPage/>} />
            <Route path="/auth/verify-email-success" element={<VerifyEmailSuccess/>} />
            <Route path="/help" element={<HelpPage />} />
            {/* Other routes */}
          </Routes>
        </div>
        {!isAuthPage && !isVerifyEmailSuccessPage && <RightSidebarComponent />}
      </div>
    </AuthProvider>
  );
}

export default App;
