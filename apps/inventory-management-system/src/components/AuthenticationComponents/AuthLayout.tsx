import React, { ReactNode } from 'react';
import styles from './AuthLayout.module.scss'; // Assuming you have this SCSS file

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.authLayout}>
      {children}
    </div>
  );
};

export default AuthLayout;
