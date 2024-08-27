import pino from 'pino';
import pinoHttp from 'pino-http';
import pick from 'lodash/pick';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'debug'
});

export const httpLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => {
            const ignorePathsRx = /^\/css|\/public|\/assets/;
            return ignorePathsRx.test(req.url || '');
        }
    },
    customLogLevel(req, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
        } else if (res.statusCode >= 500 || err) {
            return 'error';
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
            return 'silent';
        }
        return 'info';
    },
    serializers: {
        req(req) {
            return pick(req, ['method', 'url', 'query', 'params']);
        },
        res(res) {
            return pick(res, ['statusCode']);
        }
    }
});
