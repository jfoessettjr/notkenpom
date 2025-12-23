"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// lib/prisma.ts
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
exports.prisma = global.prisma ??
    new client_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
if (process.env.NODE_ENV !== "production")
    global.prisma = exports.prisma;
