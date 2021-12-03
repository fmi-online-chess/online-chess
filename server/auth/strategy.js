import passportJwt from "passport-jwt";
import dotenv from "dotenv";

const {
  SECRET_KEY
} = dotenv.config().parsed;

const options = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtStrategy = new passportJwt.Strategy(options, async (payload, done) => {
  const user = {
    id: payload.id,
    username: payload.username,
    role: payload.role
  };

  done(null, user); // req.user = user;
});

export default jwtStrategy;