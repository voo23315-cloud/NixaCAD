"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    const hash = await bcrypt_1.default.hash('changeme', 10);
    const u = await prisma_1.default.user.updateMany({ where: { email: 'admin@nixacad.local' }, data: { password: hash } });
    console.log('updated', u);
    await prisma_1.default.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
