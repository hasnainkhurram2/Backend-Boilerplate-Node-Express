import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config';
import type { JwtPayload } from '@/shared/types';

export function initPassport(): void {
  // JWT Strategy — validates access tokens from the Authorization header
  const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_ACCESS_SECRET,
  };

  passport.use(
    new JwtStrategy(jwtOptions, (payload: JwtPayload, done) => {
      return done(null, payload);
    }),
  );

  // Google OAuth2 Strategy — only registered when credentials are provided
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        (_accessToken, _refreshToken, profile, done) => {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google profile'));

          return done(null, {
            googleId: profile.id,
            email,
            name: profile.displayName,
          });
        },
      ),
    );
  }
}
