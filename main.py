import psutil
import time
import os
import psycopg2
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

if 'INTERVAL_IN_SECONDS' not in os.environ:
    raise Exception('INTERVAL_IN_SECONDS is not set')

interval = float(os.environ['INTERVAL_IN_SECONDS'])

# Configuração do banco de dados
DB_CONFIG = {
    'dbname':  os.environ['DATABASE_NAME'],
    'user': os.environ['DATABASE_USER'],
    'password': os.environ['DATABASE_PASSWORD'],
    'host': os.environ['DATABASE_HOST'],
}

def get_usage_stats():
    # CPU
    cpu_percent = psutil.cpu_percent()
    physical_cores = psutil.cpu_count(logical=False)
    
    # Mantém o valor em porcentagem (0-100%)
    cpu_usage = round(cpu_percent, 2)
    
    print(f"[DEBUG] CPU Usage: {cpu_usage}% (Total cores: {physical_cores})")
    
    # Memória (convertendo para MB)
    mem = psutil.virtual_memory()
    mem_total = round(mem.total / (1024 ** 2), 2)  # MB
    mem_used = round(mem.used / (1024 ** 2), 2)    # MB
    
    # Disco (convertendo para GB)
    disk = psutil.disk_usage('/')
    disk_total = round(disk.total / (1024 ** 3), 2)  # GB
    disk_used = round(disk.used / (1024 ** 3), 2)    # GB
    
    return {
        'cpu': {
            'cores': physical_cores,
            'usage': cpu_usage  # Agora retorna a porcentagem direta
        },
        'memory': {
            'totalGB': mem_total,
            'usedGB': mem_used
        },
        'disk': {
            'totalGB': disk_total,
            'usedGB': disk_used
        }
    }

def main():
    print("[DEBUG] Starting usage stats collection")
    
    # Conectar ao banco de dados
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Criar tabela se não existir
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "PCUsage" (
            id SERIAL PRIMARY KEY,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            coresUsage FLOAT,
            totalCores INTEGER,
            memoryUsage FLOAT,
            totalMemory FLOAT,
            diskUsage FLOAT,
            totalDisk FLOAT
        )
    """)
    conn.commit()
    
    try:
        while True:
            stats = get_usage_stats()
            current_time = datetime.now()

            # Inserir dados
            cur.execute("""
                INSERT INTO "PCUsage" (
                    "coresUsage", "totalCores", "memoryUsage", 
                    "totalMemory", "diskUsage", "totalDisk",
                    "updatedAt", "createdAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING "createdAt"
            """, (
                stats['cpu']['usage'],
                stats['cpu']['cores'],
                float(stats['memory']['usedGB']),
                float(stats['memory']['totalGB']),
                float(stats['disk']['usedGB']),
                float(stats['disk']['totalGB']),
                current_time,
                current_time
            ))
            
            created_at = cur.fetchone()[0]
            conn.commit()
            
            print(f"[DEBUG] Usage stats saved to database {created_at}")
            print(f"[DEBUG] Interval: {interval}")
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\nEncerrando a coleta de dados...")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()