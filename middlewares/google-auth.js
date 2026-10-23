const passport = require("passport");
const { Strategy } = require("passport-google-oauth2");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL_HEROKU, BASE_URL } =
  process.env;

const { User } = require("../models/user");

let callbackURL;
if (process.env.NODE_ENV === "production") {
  callbackURL = `${BASE_URL_HEROKU}/google/callback`;
} else {
  callbackURL = `${BASE_URL}/google/callback`;
}

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL,
  passReqToCallback: true,
};

const { getRequestReferer } = require("../helpers/frontendRedirect");

const googleUsername = profile => {
  const emailName = profile.email ? profile.email.split("@")[0] : "";
  const givenName = profile.name && profile.name.givenName;
  const raw =
    profile.given_name ||
    givenName ||
    profile.displayName ||
    emailName ||
    "user";
  const username = String(raw).trim().replace(/\s+/g, " ").slice(0, 25);
  return username.length >= 2 ? username : `${username}user`.slice(0, 25);
};

const profileEmail = profile => {
  if (profile.email) return profile.email;
  if (profile._json && profile._json.email) return profile._json.email;
  if (profile.emails && profile.emails[0] && profile.emails[0].value) {
    return profile.emails[0].value;
  }
  return "";
};

const profilePicture = profile => {
  if (profile.picture) return profile.picture;
  if (profile._json && profile._json.picture) return profile._json.picture;
  if (profile.photos && profile.photos[0] && profile.photos[0].value) {
    return profile.photos[0].value;
  }
  return "";
};

const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    const date = new Date();
    const today = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    const email = profileEmail(profile);
    if (!email) {
      return done(new Error("Google account has no email"), false);
    }

    const referer = getRequestReferer(req);
    const user = await User.findOne({ email });
    if (user) {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        referer ? { referer } : {},
        { new: true }
      );
      return done(null, updatedUser);
    }
    const password = await bcrypt.hash(shortid.generate(), 10);
    const newUser = await User.create({
      email,
      passwordHash: password,
      username: googleUsername({ ...profile, email }),
      userAvatar: profilePicture(profile),
      dateCreate: today,
      referer: referer || "/",
      verify: true,
    });
    return done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);
passport.use("google", googleStrategy);

module.exports = passport;
