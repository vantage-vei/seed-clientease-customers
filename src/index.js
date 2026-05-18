import dotenv from 'dotenv';

dotenv.config({
    quiet: false,
    debug: true
});

console.log(`Database Host: ${process.env.DB_HOST}`);