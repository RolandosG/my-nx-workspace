import React from 'react';
import styles from './HelpComponent.module.scss';

const HelpPage = () => {
  return (
    <div className={styles.container}>
      <h1>Frequently Asked Questions (FAQ)</h1>
      <div className={styles.question}>
        <h3>1. How do I create an account?</h3>
        <p>
          To create an account, click on the "Sign Up" button on the top right corner of the page. Fill in the required information, including your email address and password, and click "Register."
        </p>
      </div>

      <div className={styles.question}>
        <h3>2. I forgot my password. How can I reset it?</h3>
        <p>
          If you forgot your password, go to the login page and click on the "Forgot Password" link. Follow the instructions to reset your password. You will receive an email with a password reset link.
        </p>
      </div>

      <div className={styles.question}>
        <h3>3. How can I update my profile information?</h3>
        <p>
          To update your profile information, log in to your account and go to the "Settings" page. You can edit your profile details, including your username, profile picture, and bio, from there.
        </p>
      </div>

      <div className={styles.question}>
        <h3>4. What should I do if I encounter a bug or issue?</h3>
        <p>
          If you come across a bug or experience any issues while using our platform, please report it to our support team. You can contact us through the "Contact Us" page or send an email to support@example.com.
        </p>
      </div>

      <div className={styles.question}>
        <h3>5. How can I delete my account?</h3>
        <p>
          If you wish to delete your account, go to the "Settings" page and click on the "Delete Account" button. Please note that this action is irreversible, and all your data will be permanently deleted.
        </p>
      </div>

      <div className={styles.question}>
        <h3>6. How do I change my password?</h3>
        <p>
          To change your password, log in to your account and go to the "Settings" page. Enter your current password, then provide your new password and confirm it. Click "Change Password" to save the changes.
        </p>
      </div>

      <div className={styles.question}>
        <h3>7. Is my data secure?</h3>
        <p>
          We take data security seriously. Your data is encrypted and stored securely. We do not share your information with third parties. For more details, please review our Privacy Policy.
        </p>
      </div>

      <div className={styles.question}>
        <h3>8. How can I contact customer support?</h3>
        <p>
          If you need assistance or have any questions, you can reach our customer support team through the "Contact Us" page. We are here to help you with any inquiries or concerns.
        </p>
      </div>

      {/* Add more questions and answers as needed */}

    </div>
  );
};

export default HelpPage;
