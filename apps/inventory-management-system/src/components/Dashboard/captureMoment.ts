import axios from 'axios';
import config from '../../config';
const apiBaseUrl = config.apiBaseUrl;
export const captureMoment = async (
  momentDescription: any, 
  emotionTag: any, 
  moodScore: any, 
  gifUrl: any,
  token: string  // <-- Add the token parameter
  
) => {
  try {
    
    // // Log the input variables for debugging
    // console.log(`Sending the following payload: 
    //   momentDescription: ${momentDescription}, 
    //   emotionTag: ${emotionTag}, 
    //   moodScore: ${moodScore}, 
    //   gifUrl: ${gifUrl},
    //   token: ${token}`);
      
    const payload = {
      momentDescription,
      emotionTag,
      moodScore,
      gifUrl  // <-- Include gifUrl in the payload
    };
    
    const config = {
      headers: {
        'Authorization': `${token}`  // Add the Authorization header
      }
    };
    // console.log("Payload about to be sent: ", payload);
    const response = await axios.post(`${apiBaseUrl}/moments/capture`, payload, config);
    
    if (response.status === 201) {
      // console.log('Moment captured successfully', response.data);
      return true;
    }
  } catch (error: any) {
    console.error('An error occurred:', error);
    // Log detailed response if available
    if (error.response) {
      console.error('Server responded with:', error.response.status, error.response.data);
    }
    return false;
  }
};