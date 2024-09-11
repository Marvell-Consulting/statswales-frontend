export const checkConfig = () => {
    if (process.env.NODE_ENV === 'test') return;

    const requiredEnvVars = ['FRONTEND_URL', 'BACKEND_URL', 'SESSION_SECRET', 'JWT_SECRET'];

    requiredEnvVars.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is missing`);
        }
    });
};
