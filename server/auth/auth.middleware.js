import passport from 'passport';

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false })(req, res, next);
};

export { authMiddleware };
