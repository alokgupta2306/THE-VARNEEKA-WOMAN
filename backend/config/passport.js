const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile received:', profile.id);

      const email = profile.emails[0].value;

      // Build name from whatever Google gives us
      let name = 'User';
      if (profile.displayName && profile.displayName.trim() !== '') {
        name = profile.displayName;
      } else if (profile.name && profile.name.givenName) {
        name = profile.name.givenName + ' ' + (profile.name.familyName || '');
      } else {
        name = email.split('@')[0];
      }

      name = name.trim();

      const photo = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';

      // Check existing user by googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // Check existing user by email
      user = await User.findOne({ email });
      if (user) {
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
  googleId: profile.id,
  name: profile.displayName || profile.name?.givenName || profile.emails[0].value.split('@')[0] || 'User',
  email: profile.emails[0].value,
  profileImage: profile.photos?.[0]?.value || '',
  isVerified: true
});

      return done(null, user);
    } catch (error) {
      console.log('Passport error:', error.message);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};