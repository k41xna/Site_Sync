import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import config from './app.config.js';

// Serialize user ID into session
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

// Deserialize user from session ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Login Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy with Account Linking
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (!email) {
            return done(new Error('Google account did not return an email address.'));
          }

          // Flow:
          // 1. Find user by googleId -> log in if found
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. Find user by email -> if found, link googleId and log in
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            user.googleId = profile.id;
            if (!user.profilePicture && profile.photos && profile.photos[0]) {
              user.profilePicture = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 3. Create a new user account if not found
          // Retrieve accountType from session (set at route initiation)
          const accountType = req.session.accountType || 'worker';
          const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

          user = await User.create({
            name: profile.displayName || 'Google User',
            email: email.toLowerCase(),
            googleId: profile.id,
            accountType,
            profilePicture
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;
