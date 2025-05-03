import si from 'systeminformation';
import { prisma } from './prisma';


if(!process.env.INTERVAL_IN_SECONDS) {
  throw new Error('INTERVAL_IN_SECONDS is not set');
}

const interval = Number(process.env.INTERVAL_IN_SECONDS) * 1000;

async function getUsageStats() {
  const [cpuLoad, mem, disks, cpuInfo] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.cpu()
  ]);

  // CPU
  const cpuUsage = cpuLoad.currentLoad.toFixed(2);
  const physicalCores = cpuInfo.physicalCores;
  const activeCores = ((cpuLoad.currentLoad * physicalCores) / 100).toFixed(2);

  // Memória
  const memTotal = (mem.total / (1024 ** 2)).toFixed(2); // MB
  const memUsed = ((mem.active || (mem.total - mem.available)) / (1024 ** 2)).toFixed(2); // MB
  const memPercent = ((Number(memUsed) / Number(memTotal)) * 100).toFixed(2);

  // Disco
  // Convertendo bytes para GB (dividindo por 1024³)
  const diskTotal = (disks.reduce((acc, d) => acc + d.size, 0) / (1024 ** 3)).toFixed(2); // GB
  const diskUsed = (disks.reduce((acc, d) => acc + d.used, 0) / (1024 ** 3)).toFixed(2); // GB
  const diskPercent = ((Number(diskUsed) / Number(diskTotal)) * 100).toFixed(2);

  // Log para debug
  console.log('[DEBUG] Disk information:', {
    totalGB: diskTotal,
    usedGB: diskUsed,
    percent: diskPercent,
    rawDisks: disks.map(d => ({
      fs: d.fs,
      size: d.size,
      used: d.used,
      mount: d.mount
    }))
  });

  return {
    cpu: {
      cores: physicalCores,
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


console.log(`[DEBUG] Starting usage stats collection`);

setInterval(async () => {
  const t = await getUsageStats();
  const data = await prisma.pCUsage.create({
    data: {
      coresUsage: Number(t.cpu.usage),
      totalCores: Number(t.cpu.cores),
      memoryUsage: Number(t.memory.usedGB),
      totalMemory: Number(t.memory.totalGB),
      diskUsage: Number(t.disk.usedGB),
      totalDisk: Number(t.disk.totalGB)
    }
  })

  console.log(`[DEBUG] Usage stats saved to database ${data.createdAt}`);
  console.log(`[DEBUG] Interval: ${interval}`);
}, interval);