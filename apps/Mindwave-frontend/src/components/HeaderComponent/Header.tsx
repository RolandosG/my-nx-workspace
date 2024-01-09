// import React, { useEffect } from 'react';
// import styles from './Header.module.scss';
// import { useRecoilState } from 'recoil';
// import { themeState } from '../UtilityComponents/ThemeState';
// import moon from '../../assets/SVGs/moon-icon.svg';
// import sun from '../../assets/SVGs/sun.svg';

// const Header = () => {
//   const [theme, setTheme] = useRecoilState(themeState);

//   useEffect(() => {
    
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       setTheme(savedTheme);
//       document.documentElement.setAttribute('data-theme', savedTheme);
//     } else {
//       setTheme('light');
//       document.documentElement.setAttribute('data-theme', 'light');
//     }
//   }, [setTheme]);

//   const toggleTheme = () => {
//     const newTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.setAttribute('data-theme', newTheme);
//   };

//   return (
//     <div className={styles.header}>


//       <div className={styles.rightSection}>

//       <div
//         className={`${styles.themeToggle} ${theme === 'dark' ? styles.dark : ''}`}
//         onClick={toggleTheme}
//       >
//         <img className={`${styles.icon} ${styles.moon} ${theme === 'dark' ? styles.dark : styles.dark}`} src={moon} alt="Moon" />
//         <img className={`${styles.icon} ${styles.sun} ${theme === 'dark' ? styles.dark : styles.dark}`} src={sun} alt="Sun" />

//         <img className={`${styles.icon} ${styles.moon} ${theme === 'dark' ? styles.dark : styles.dark}`} src={moon} alt="Moon" />
//         <img className={`${styles.icon} ${styles.sun} ${theme === 'light' ? styles.dark : styles.dark}`} src={sun} alt="Sun" />

//       </div>
//     </div>
//     </div>
//   );
// };

// export default Header;
