import User from '../models/User';  // Replace with the actual path to your User model
import bcrypt from 'bcrypt';

export async function validateUser(credentials: any) {
    const { username, password } = credentials;
  
    console.log("Inside validateUser with credentials:", { username, password }); // Debug log
  
    const user = await User.findOne({ username });
  
    console.log("User fetched from DB inside validateUser:", user); // Debug log
  
    if (user) {
      console.log("Password for validation: ", password);
      const isPasswordValid = user.validPassword(password);
      console.log(`Is password valid: ${isPasswordValid}`); // Debug log

      if (isPasswordValid) {
        console.log("Password is valid inside validateUser"); // Debug log
        return user;
      } else {
        console.log("Password is invalid inside validateUser"); // Debug log
        console.log(`Stored hash: ${user.password}`);
        console.log(`Generated hash: ${bcrypt.hashSync(password, bcrypt.genSaltSync(8))}`);
        return null;
      }
    } else {
      console.log("User not found inside validateUser"); // Debug log
      return null;
    }
}
    