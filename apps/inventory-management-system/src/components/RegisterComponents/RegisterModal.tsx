import React, { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './RegisterModal.module.scss'; // Create appropriate styling
import { CSSTransition } from 'react-transition-group';
import { useNavigate } from 'react-router-dom';
import TermsModal from './TermsModal/TermsModal';
import countryBordersJSON from '../../Public/output.json';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import config from '../../config';

interface RegisterModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface CountryFeature {
  properties: {
    ADMIN: string;
  };
}
interface CountryBorders {
  features: CountryFeature[];
}

const countryBorders = countryBordersJSON as unknown as CountryBorders;

const RegisterModal: FC<RegisterModalProps> = ({ isVisible, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state variable
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const apiBaseUrl = config.apiBaseUrl;
  const navigate = useNavigate();
  useEffect(() => {
    const countryNames = countryBorders.features.map((feature: CountryFeature) => feature.properties.ADMIN);
    setCountries(countryNames);
  }, []);

  const handleTermsClick = () => {
    setIsTermsVisible(!isTermsVisible);
  };
  
  const handleRegisterClick = () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!hasAgreedToTerms) { // Check whether user agreed to terms
      setErrorMessage("You must agree to the terms and conditions");
      return;
    }
    setIsLoading(true);
    fetch(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email, hasAgreedToTerms, selectedCountry, hasConsentedToLocation: true,  }),
    })
    .then((res) => res.json())
    .then((data) => {
      setIsLoading(false);
      console.log("Response message:", data.message);
      if (data.message === 'User and Journal registered successfully') {
        console.log("Setting isSuccess to true");
        setIsSuccess(true);
        
      } else {
        setErrorMessage(data.message || "Registration failed");
      }
    })
    .catch((error) => {
      setIsLoading(false);
      setErrorMessage("An error occurred. Please try again.");
    });
  };
  const handleSuccessClose = () => {
    setIsSuccess(false); // Hide success modal
    onClose(); // Close the registration modal and presumably go back to login
  }

  const successModal = (
    <div className={styles.successModal}>
      <h1>Almost there!</h1>
      <p>Please check your email to verify your account.</p>
      <button onClick={handleSuccessClose}>Go to Login</button>
    </div>
  );
  
  const modalContent = (
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
      
      <div className={styles.registerModal}>
        
      <button className={styles.closeButton} onClick={onClose}>×</button>
      <h1>Create your account</h1>
      <div className={styles.container}>
      <div className={styles.column}>
        <p>*Username:</p>
        <input autoFocus type="text" placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} />
        <p>*Email:</p>
        <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
        <p>*Password:</p>
        <input type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className={styles.column}>
        <p>*Confirm Password:</p>
        <input type="password" placeholder="Confirm your password" onChange={(e) => setConfirmPassword(e.target.value)} />
        <p>*Birth Date:</p>
        <input type="date" onChange={(e) => {/* Handle date */}} />
        
        <p>*Country of current Residence</p>
        <FormControl variant="outlined" className={styles.formControl} style={{ marginLeft: '-190px' }}>

        <InputLabel id="country-label">Country</InputLabel>
        <Select
          labelId="country-label"
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value as string)}
          label="Country">
          <MenuItem value="">
            <em>Select your country</em>
          </MenuItem>
          {countries.map((country, index) => (
            <MenuItem key={index} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
      </div>


        <div className={styles.termsAgreement}>
        <h3 className={styles.termsText}>I agree to the *<span onClick={handleTermsClick} className={styles.termsLink}>Terms and Conditions</span></h3>

        <input
        className={styles.termsCheckbox}
        type="checkbox"
        id="hasAgreedToTerms"
        onChange={(e) => setHasAgreedToTerms(e.target.checked)}
        required
      />
      
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        
        
        
        <button className={styles.submitButton} onClick={handleRegisterClick} >{isLoading ? "Loading..." : "Register"}</button>
      </div>
    </CSSTransition>
  );

  return ReactDOM.createPortal(
    <>
      {/*console.log("Is success:", isSuccess)*/}
      {isSuccess ? successModal : modalContent}
      {isTermsVisible && <TermsModal isVisible={isTermsVisible} onClose={() => setIsTermsVisible(false)} />}
    </>,
    document.body
  );
};

export default RegisterModal;
