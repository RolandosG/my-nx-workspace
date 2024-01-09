import React, { FC } from 'react';
import styles from './TermsModal.module.scss'; // Create appropriate styling
import { CSSTransition } from 'react-transition-group';
import ReactDOM from 'react-dom';

interface TermsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const TermsModal: FC<TermsModalProps> = ({ isVisible, onClose }) => {
  return ReactDOM.createPortal(
    
    <CSSTransition 
      in={isVisible}
      timeout={300}
      classNames={{
        enter: styles.fadeEnter,
        enterActive: styles.fadeEnterActive,
        exit: styles.fadeExit,
        exitActive: styles.fadeExitActive
      }}
      unmountOnExit
    >
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.termsModal}>
        <div className={styles.termsContent}>
        {/* Your terms and conditions text here */}
<h1>Terms and Conditions</h1>
<h2>Introduction</h2>
<p>
  Welcome to Moments. By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. 
</p>

<h2>Intellectual Property</h2>
<p>
  The website and its original content, features, and functionality are owned by Moments and are protected by international copyright, trademark, and other intellectual property or proprietary rights laws.
</p>

<h2>Termination</h2>
<p>
  We may terminate your access to the site, without cause or notice, which may result in the forfeiture and destruction of all information associated with you.
</p>

<h2>Links To Other Websites</h2>
<p>
  Our site contains links to third-party sites that are not owned or controlled by Moments. Moments has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
</p>

<h2>Changes To This Agreement</h2>
<p>
  We reserve the right to modify these Terms and Conditions at any time. Your decision to continue to visit and make use of the site after such changes have been made constitutes your formal acceptance of the new Terms and Conditions.
</p>

<h2>Contact Us</h2>
<p>
  If you have any questions about this agreement, please feel free to contact us at [mindwaveworks@gmail.com].
</p>
<button className={styles.closeButton} onClick={onClose}>×</button>
        {/* More text */}
      </div>
    </div>
    </>
    </CSSTransition>,
    document.body
  );
};

export default TermsModal;
