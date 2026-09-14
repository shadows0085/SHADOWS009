"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
exports.prisma = global.__prisma ||
    new client_1.PrismaClient({
        log: [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' }
        ]
    });
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
exports.prisma.$on('error', (e) => {
    logger_1.logger.error({ err: e }, 'Prisma Database Error');
});
