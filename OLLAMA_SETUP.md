# Configuración de ADARA con Ollama

## Requisitos Previos

1. **Ollama Instalado**: Descarga desde [ollama.ai](https://ollama.ai)
2. **Modelo deepseek-r1:8b**: Se descargará automáticamente

## Pasos de Instalación

### 1. Instalar Ollama

**Windows/Mac/Linux:**
- Descarga desde [ollama.ai](https://ollama.ai)
- Sigue las instrucciones del instalador

### 2. Descargar el Modelo deepseek-r1:8b

Abre una terminal y ejecuta:

```bash
ollama pull deepseek-r1:8b
```

Esto descargará el modelo (~8GB). Puede tomar varios minutos dependiendo de tu conexión.

### 3. Verificar que Ollama está Ejecutándose

Ollama debería ejecutarse automáticamente en `http://localhost:11434`

Para verificar:
```bash
curl http://localhost:11434/api/tags
```

Deberías ver una respuesta JSON con los modelos disponibles.

### 4. Configurar Variables de Entorno (Opcional)

Si Ollama está en un servidor diferente, configura:

```bash
# En Windows (PowerShell)
$env:OLLAMA_API_URL = "http://tu-servidor:11434"
$env:OLLAMA_MODEL = "deepseek-r1:8b"

# En Linux/Mac
export OLLAMA_API_URL="http://tu-servidor:11434"
export OLLAMA_MODEL="deepseek-r1:8b"
```

### 5. Ejecutar la Aplicación

```bash
# Terminal 1: Backend
cd backend
pnpm install
pnpm db:push
pnpm dev

# Terminal 2: Frontend
cd frontend
pnpm install
pnpm dev
```

## Solución de Problemas

### Ollama no responde
- Asegúrate de que Ollama está ejecutándose: `ollama serve`
- Verifica que está en `http://localhost:11434`

### Modelo no encontrado
- Ejecuta: `ollama pull deepseek-r1:8b`
- Verifica con: `ollama list`

### Respuestas lentas
- El modelo deepseek-r1:8b requiere recursos. Asegúrate de tener:
  - 8GB RAM mínimo
  - GPU recomendada (NVIDIA/AMD)

### ADARA no responde
- Abre la consola del navegador (F12) y busca errores
- Verifica que el backend está corriendo en puerto 3000
- Comprueba que Ollama está disponible

## Características de ADARA

✨ **ADARA (Amiga Digital de Atención y Recomendación Avanzada)**

- 💬 Chat contextual y conversacional
- 🍦 Recomendaciones de helados personalizadas
- 📦 Ayuda con pedidos y compras
- 🎯 Respuestas rápidas y precisas
- 🌙 Tema claro/oscuro automático
- 📱 Interface tipo Messenger compacta

## Modelos Alternativos

Si prefieres usar otro modelo, puedes cambiar en `backend/services/ollama.ts`:

```typescript
const OLLAMA_MODEL = "mistral:7b"; // o cualquier otro modelo
```

Modelos recomendados:
- `deepseek-r1:8b` (Recomendado - Mejor calidad)
- `mistral:7b` (Más rápido)
- `neural-chat:7b` (Optimizado para chat)
- `llama2:7b` (Alternativa popular)

## Monitoreo

Para ver el uso de recursos de Ollama:

```bash
# Ver modelos cargados
ollama list

# Ver historial
ollama show deepseek-r1:8b
```

## Rendimiento

Tiempos esperados de respuesta (primera vez):
- Primera consulta: 30-60 segundos (cargando modelo)
- Consultas siguientes: 5-15 segundos

Para mejorar rendimiento:
- Usa GPU (NVIDIA CUDA o AMD ROCm)
- Aumenta RAM disponible
- Cierra otras aplicaciones pesadas
