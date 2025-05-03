"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const systeminformation_1 = __importDefault(require("systeminformation"));
const prisma_1 = require("./lib/prisma");
function getUsageStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const [cpuLoad, mem, disks] = yield Promise.all([
            systeminformation_1.default.currentLoad(),
            systeminformation_1.default.mem(),
            systeminformation_1.default.fsSize()
        ]);
        // CPU
        const cpuUsage = cpuLoad.currentLoad.toFixed(2);
        const cpuCores = cpuLoad.cpus.length;
        const activeCores = ((cpuLoad.currentLoad * cpuLoad.cpus.length) / 100).toFixed(2);
        // Memória
        const memTotal = (mem.total / (1024 ** 2)).toFixed(2); // MB
        const memUsed = ((mem.active || (mem.total - mem.available)) / (1024 ** 2)).toFixed(2); // MB
        const memPercent = ((Number(memUsed) / Number(memTotal)) * 100).toFixed(2);
        // Disco
        const diskTotal = (disks.reduce((acc, d) => acc + d.size, 0) / (1024 ** 2)).toFixed(2); // MB
        const diskUsed = (disks.reduce((acc, d) => acc + d.used, 0) / (1024 ** 2)).toFixed(2); // MB
        const diskPercent = ((Number(diskUsed) / Number(diskTotal)) * 100).toFixed(2);
        return {
            cpu: {
                cores: cpuCores,
                usage: cpuUsage,
            },
            memory: {
                totalGB: memTotal,
                usedGB: memUsed,
            },
            disk: {
                totalGB: diskTotal,
                usedGB: diskUsed,
            }
        };
    });
}
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield getUsageStats();
    const data = yield prisma_1.prisma.pCUsage.create({
        data: {
            coresUage: Number(t.cpu.usage),
            totalCores: Number(t.cpu.cores),
            memoryUsage: Number(t.memory.usedGB),
            totalMemory: Number(t.memory.totalGB),
            diskUsage: Number(t.disk.usedGB),
            totalDisk: Number(t.disk.totalGB)
        }
    });
    console.log(`[DEBUG] Usage stats saved to database ${data.createdAt}`);
}), 10000);
