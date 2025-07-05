import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models/User';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? "https://whisperspace-backend.onrender.com/api/auth/google/callback"
        : `http://localhost:${process.env.PORT || 3001}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google strategy triggered for:', profile.emails?.[0]?.value);
        
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing user found with Google ID');
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          console.log('Existing user found with email, linking Google account');
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos?.[0]?.value || '';
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName || profile.emails?.[0]?.value.split('@')[0],
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value || ''
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;