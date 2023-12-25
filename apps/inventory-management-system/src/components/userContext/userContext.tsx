import React from 'react';

const UserContext = React.createContext({
    loggedInUserId: null, // default value
    // ... you can add more user-related data here
  });
  
  export default UserContext;