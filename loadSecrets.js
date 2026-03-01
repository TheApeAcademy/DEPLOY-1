// ES Module syntax
import 'dotenv/config'; // automatically loads .env

const supabaseServiceRole = process.env.SERVICE_ROLE_KEY;
const wiseApiKey = process.env.WISE_API_KEY;
const wiseProfileId = process.env.WISE_PROFILE_ID;
const wiseSandbox = process.env.WISE_SANDBOX === 'true';
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

console.log('Supabase Service Role Key loaded:', !!supabaseServiceRole);
console.log('WISE API Key loaded:', !!wiseApiKey);
console.log('WISE Profile ID loaded:', wiseProfileId);
console.log('WISE Sandbox mode:', wiseSandbox);
console.log('Cloudinary Secret loaded:', !!cloudinarySecret);
