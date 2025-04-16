/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:npg_xbzKPtn4MWg3@ep-shrill-dream-a5aks9z2-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
        }
  };