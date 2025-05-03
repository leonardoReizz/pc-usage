"# Monitor de Recursos do Sistema

Este projeto é um monitor de recursos do sistema que coleta informações sobre CPU, memória e disco, armazenando os dados em um banco PostgreSQL.

## 📋 Funcionalidades

- Monitoramento de uso de CPU (cores físicos e utilização)
- Monitoramento de memória (total e uso em MB)
- Monitoramento de disco (total e uso em GB)
- Armazenamento automático dos dados em PostgreSQL
- Intervalo de coleta configurável

## 🔧 Requisitos

- Python 3.11+
- PostgreSQL
- Docker (opcional)

## 🚀 Como Executar

### Usando Python diretamente

1. Instale as dependências:
\`\`\`bash
pip install psutil psycopg2-binary
\`\`\`

2. Configure as variáveis de ambiente:
\`\`\`bash
# Windows (PowerShell)
\$env:INTERVAL_IN_SECONDS=\"5\"
\$env:DB_NAME=\"seu_banco\"
\$env:DB_USER=\"seu_usuario\"
\$env:DB_PASSWORD=\"sua_senha\"
\$env:DB_HOST=\"localhost\"
\$env:DB_PORT=\"5432\"

# Linux/Mac
export INTERVAL_IN_SECONDS=5
export DB_NAME=seu_banco
export DB_USER=seu_usuario
export DB_PASSWORD=sua_senha
export DB_HOST=localhost
export DB_PORT=5432
\`\`\`

3. Execute o script:
\`\`\`bash
python main.py
\`\`\`

### Usando Docker

1. Construa a imagem:
\`\`\`bash
docker build -t pc-usage-monitor .
\`\`\`

2. Execute o container:
\`\`\`bash
docker run -e INTERVAL_IN_SECONDS=5 \\
    -e DB_NAME=seu_banco \\
    -e DB_USER=seu_usuario \\
    -e DB_PASSWORD=sua_senha \\
    -e DB_HOST=seu_host \\
    -e DB_PORT=5432 \\
    pc-usage-monitor
\`\`\`

### Usando Docker Compose

1. Execute:
\`\`\`bash
docker-compose up --build
\`\`\`

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| INTERVAL_IN_SECONDS | Intervalo entre as coletas em segundos | - |
| DB_NAME | Nome do banco de dados | - |
| DB_USER | Usuário do banco | - |
| DB_PASSWORD | Senha do banco | - |
| DB_HOST | Host do banco | localhost |
| DB_PORT | Porta do banco | 5432 |

### Estrutura do Banco

A tabela \`pc_usage\` é criada automaticamente com a seguinte estrutura:

\`\`\`sql
CREATE TABLE pc_usage (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cores_usage FLOAT,
    total_cores INTEGER,
    memory_usage FLOAT,
    total_memory FLOAT,
    disk_usage FLOAT,
    total_disk FLOAT
);
\`\`\`

## 📊 Dados Coletados

- **CPU**:
  - \`total_cores\`: Número total de cores físicos
  - \`cores_usage\`: Número equivalente de cores em uso (0 a total_cores)
- **Memória**:
  - \`total_memory\`: Memória total em MB
  - \`memory_usage\`: Memória em uso em MB
- **Disco**:
  - \`total_disk\`: Espaço total em GB
  - \`disk_usage\`: Espaço usado em GB
