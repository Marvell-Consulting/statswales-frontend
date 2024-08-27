import dotenv from 'dotenv';

import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    const requiredEnvVars = [
        'BACKEND_SERVER',
        'BACKEND_PORT',
        'BACKEND_PROTOCOL',
        'SESSION_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];

    requiredEnvVars.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is missing`);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
