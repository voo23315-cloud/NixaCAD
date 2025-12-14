"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/prisma"));
async function main() {
    console.log('Seeding database...');
    const user = await prisma_1.default.user.upsert({
        where: { email: 'admin@nixacad.local' },
        update: {},
        create: { email: 'admin@nixacad.local', password: await Promise.resolve().then(() => __importStar(require('bcrypt'))).then(m => m.hash('changeme', 10)) }
    });
    const department = await prisma_1.default.department.upsert({
        where: { name: 'Polizei' },
        update: {},
        create: { name: 'Polizei', beschreibung: 'Polizeibehörde' }
    });
    const role = await prisma_1.default.role.upsert({
        where: { name: 'Officer' },
        update: {},
        create: { name: 'Officer', description: 'Standard Dienstrolle' }
    });
    const civilian = await prisma_1.default.civilian.create({
        data: {
            user_id: user.id,
            vorname: 'Max',
            nachname: 'Mustermann',
            adresse: 'Musterstraße 1',
            telefonnummer: '+49123456789'
        }
    });
    await prisma_1.default.medicalRecord.create({
        data: {
            civilian_id: civilian.id,
            blutgruppe: 'A+',
            allergien: 'Keine',
            notizen: 'Test-Patient'
        }
    });
    await prisma_1.default.license.create({
        data: {
            civilian_id: civilian.id,
            typ: 'FUEHRERSCHEIN',
            klasse: 'B',
            status: 'GUELTIG'
        }
    });
    await prisma_1.default.vehicle.create({
        data: {
            civilian_id: civilian.id,
            kennzeichen: 'NIXA-001',
            fahrzeugtyp: 'PKW',
            farbe: 'Schwarz'
        }
    });
    await prisma_1.default.application.create({
        data: {
            civilian_id: civilian.id,
            department_id: department.id,
            status: 'OFFEN'
        }
    });
    await prisma_1.default.roleAssignment.create({
        data: {
            civilian_id: civilian.id,
            role_id: role.id,
            dienststatus: 'AUSSER_DIENST'
        }
    });
    await prisma_1.default.criminalRecord.create({
        data: {
            civilian_id: civilian.id,
            straftat: 'Tunichtgut',
            beschreibung: 'Beispielhaft',
            datum: new Date(),
            status: 'OFFEN'
        }
    });
    console.log('Seeding finished');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
