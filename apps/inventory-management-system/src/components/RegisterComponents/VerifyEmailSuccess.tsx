import React from 'react';
import './VerifyEmailSuccess.module.scss'; // Import the SCSS file for styling
import styles from './VerifyEmailSuccess.module.scss';
import { Link } from 'react-router-dom';
const VerifyEmailSuccess: React.FC = () => {
  return (
    
    <div className={styles['dashboard']}>
      <div className={styles['login-page-container']}>
        <div className={styles.loginPage}>
          {/* Apply the structure of the login page to VerifyEmailSuccess */}
          <div className={styles.rightSection}>
            <div className={styles.verifyEmailModal}>
              <h1>Email verified successfully.</h1>
              <p>Congratulations! You can now <Link to="/login">Return to Login.</Link></p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;