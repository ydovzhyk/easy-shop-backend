const passport = require("passport");
const { Strategy } = require("passport-google-oauth2");
const bcrypt = require("bcrypt");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL, BASE_URL } =
  process.env;

const { User } = require("../models/user");

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/api/auth/google/callback`,
  passReqToCallback: true,
};

const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  console.log(profile);
  try {
    const { email, name, picture } = profile;
    const user = await User.findOne({ email });
    const prePassword = "u4Dbx4m5x86_C87";
    if (user) {
      return done(null, user);
    }
    const password = await bcrypt.hash(prePassword, 10);
    const newUser = await User.create({
      email,
      password,
      username: name,
      userAvatar: picture,
    });
    return done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);
passport.use("google", googleStrategy);

module.exports = passport;
