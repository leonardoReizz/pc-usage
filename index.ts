import si from 'systeminformation';
import { prisma } from './src/prisma';

async function getUsageStats() {
  const [cpuLoad, mem, disks] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize()
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
  const diskPercent = ((Number(diskUsed) / Number(diskTotal)  ) * 100).toFixed(2);

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
}



setInterval(async () => {
  const t = await getUsageStats();
  const data = await prisma.pCUsage.create({
    data: {
      coresUage: Number(t.cpu.usage)  ,
      totalCores: Number(t.cpu.cores),
      memoryUsage: Number(t.memory.usedGB),
      totalMemory: Number(t.memory.totalGB),
      diskUsage: Number(t.disk.usedGB),
      totalDisk: Number(t.disk.totalGB)
    }
  })

  console.log(`[DEBUG] Usage stats saved to database ${data.createdAt}`);
}, 10000);