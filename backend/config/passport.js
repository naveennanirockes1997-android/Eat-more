import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import dotenv from 'dotenv';
import User from "../models/userModel.js";

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : '',
    callbackURL: "https://eat-more-backend-jpjz.onrender.com/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // If not found by googleId, check by email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save({ validateBeforeSave: false });
          }
        }
      }

      if (!user) {
        // Create new user if not found by googleId or email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `google_${profile.id}@eatmore.com`;
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName || profile.name.givenName || 'Google User',
          email: email.toLowerCase(),
          role: 'customer'
        });
      }

      return cb(null, user);
    } catch (error) {
      return cb(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;