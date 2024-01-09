import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const countryDivisionType = {
  'USA': 'state',
  'Canada': 'province',
  'Australia': 'state',
  'India': 'state',
  'Mexico': 'state',
  'Brazil': 'state',
  'Nigeria': 'state',
  'Germany': 'state',
  'Argentina': 'state',
  'Malaysia': 'state',
  'Pakistan': 'state',
  'Venezuela': 'state',
  'Sudan': 'state',
  'China': 'province',
  'Italy': 'province',
  'South Africa': 'province',
  'Spain': 'province',
  'Indonesia': 'province',
  'Democratic Republic of the Congo': 'province',
  'Philippines': 'province',
  'Afghanistan': 'province',
  'Colombia': 'province'
  // Add other countries as needed
};

interface ILocation {
  country: string;
  city: string;
  state: string;
  province: string;
}

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  location?: ILocation;
  generateHash(password: string): string;
  validPassword(password: string): boolean;
  hasConsentedToLocation?: boolean; 
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  isEmailVerified?: boolean;
  countryOfResidence: string;
  lastCountryChangeDate: Date;
  lastLoginDate: Date,
  accountStatus: 'active' | 'banned' | 'suspended';
  hasAgreedToTerms: boolean;
  termsAgreementDate: Date;
  selectedCountry: string;
  likedMoments: Schema.Types.ObjectId[];
  followers: Schema.Types.ObjectId[]; 
  //following: Schema.Types.ObjectId[];
  following: IFollowing[]; 
  passwordResetToken: string,
  passwordResetExpires: Date,
  profilePrivacy: 'public' | 'private' | 'friendsOnly',
}
interface IFollowing {
  _id: mongoose.Types.ObjectId;
  follower_id: mongoose.Types.ObjectId;
  followee_id: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
  // ... other properties
}
type IUserModel = Model<IUser>
const LocationSchema: Schema = new Schema({
  country: {
    type: String,
    required: false, // Change to true if required
  },
  state: {
    type: String,
    required: false, // Change to true if required
  },
  province: {
    type: String,
    required: false, // Change to true if required
  },
  city: {
    type: String,
    required: false, // Change to true if required
  },
  // Add other fields as necessary
});
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(email) {
        // Simple email regex (You can use a more comprehensive one)
        return /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
      },
      message: props => `${props.value} is not a valid email!`
    },
  },
  
   isEmailVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: LocationSchema,
    required: false, // Change to true if required
  },
  hasConsentedToLocation: {
    type: Boolean,
    default: false
  },
  hasAgreedToTerms: {
    type: Boolean,
    default: false,
    required: true,
  },
  accountStatus: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active',
  },
  countryChangeCount: {
    type: Number,
    default: 0,
  },
  selectedCountry: { 
    type: String, 
    required: true 
  },
  termsAgreementDate: Date,
  // Token fields for email verification
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  // Additional fields for password reset
  passwordResetToken: {
    type: String,
    required: false
  },
  passwordResetExpires: {
    type: Date,
    required: false
  },
  likedMoments: [{
    type: Schema.Types.ObjectId,
    ref: 'Moment',  // This is the model the ID references
    default: []
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the same User model
    default: []
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    default: []
  }],
  profilePrivacy: {
    type: String,
    enum: ['public', 'private', 'friendsOnly'],
    default: 'public'
  },
});
UserSchema.pre('save', function(next) {
  if (this.isModified('password') || this.isNew) {
    console.log("Password before hashing: ", this.password);
    this.password = this.generateHash(this.password);
    console.log("Hashed password: ", this.password);
  }
  next();
});
UserSchema.pre('save', function(next) {
  // `this` refers to the user instance
  if (this.location && this.location.country) {
    const divisionType = countryDivisionType[this.location.country];
    
    if (divisionType) {
      // Ensure the correct division type is populated
      if (!this.location[divisionType]) {
        // You can set it to a default value or log an error
        this.location[divisionType] = 'Unknown';
      }
    }
  }
  next();
});
// Don't use arrow functions here to make sure that `this` refers to the document instance
UserSchema.methods.generateHash = function(password: string): string {
  console.log("Inside generateHash, raw password: ", password);
  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  console.log("Inside generateHash, hashed password: ", hashedPassword);
  return hashedPassword;
};

UserSchema.methods.validPassword = function(password: string): boolean {
  console.log("Inside validPassword, comparing against stored hash: ", this.password); // New log statement
  const isValid = bcrypt.compareSync(password, this.password);
  console.log("Inside validPassword, is password valid?: ", isValid); // New log statement
  return isValid;
};

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;