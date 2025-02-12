import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const options = {
  site: `https://${process.env.SITE}` || "http://localhost:3000",

  providers: [
    Providers.Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
  ],
};

export default (req, res) => NextAuth(req, res, options);
