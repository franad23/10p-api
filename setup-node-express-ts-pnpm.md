# Setup de un proyecto Node + Express + TypeScript con pnpm

Guía paso a paso para levantar un proyecto base de Express con TypeScript usando pnpm.

## 1. Crear el proyecto

```bash
mkdir mi-api && cd mi-api
pnpm init
```

## 2. Instalar Express

```bash
pnpm add express
```

## 3. Instalar dependencias de desarrollo

```bash
pnpm add -D typescript@5.7.3 @types/node @types/express ts-node-dev
```

> ⚠️ **Importante:** fijar `typescript@5.7.3` (o cualquier versión `5.x`) explícitamente. Si se instala sin especificar versión, pnpm puede traer `typescript@7.x`, que es una versión beta/experimental (reescritura del compilador en Go) y rompe con `ts-node-dev`.

## 4. Generar `tsconfig.json`

```bash
pnpm exec tsc --init
```

> Usar `pnpm exec`, **no** `pnpm dlx`. `pnpm dlx tsc` descarga un paquete distinto llamado `tsc` desde el registro de npm, que no es el compilador real de TypeScript.

## 5. Editar `tsconfig.json`

Reemplazar el contenido por:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "verbatimModuleSyntax": false,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 6. Confirmar que `package.json` NO tenga `"type": "module"`

Este proyecto usa CommonJS de punta a punta, así que esa línea no debe estar en el `package.json`.

## 7. Crear `src/main.ts`

```typescript
import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hola mundo');
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
```

## 8. Agregar scripts en `package.json`

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js"
  }
}
```

## 9. Crear `.gitignore`

```
node_modules/
dist/
.env
```

## 10. Levantar el proyecto

```bash
pnpm dev
```

Si todo salió bien, deberías ver en consola:

```
Server corriendo en http://localhost:3000
```

---

## Errores comunes y por qué pasan

| Error | Causa | Solución |
|---|---|---|
| `This is not the tsc command you are looking for` | `pnpm dlx tsc` descarga un paquete llamado `tsc` que no es el compilador de TypeScript | Usar `pnpm exec tsc --init` en vez de `pnpm dlx tsc --init` |
| `Cannot read properties of undefined (reading 'fileExists')` | Se instaló `typescript@7.x` (versión beta/experimental), incompatible con las APIs internas que usa `ts-node` | Fijar `typescript@5.x` explícitamente al instalar |
| `Must use import to load ES Module` | Choque entre `"type": "module"` en `package.json` y la config de `tsconfig.json` apuntando a CommonJS | Sacar `"type": "module"` del `package.json` (o migrar todo a ESM) |
| `ECMAScript imports and exports cannot be written in a CommonJS file under 'verbatimModuleSyntax'` | `verbatimModuleSyntax: true` exige que la sintaxis de módulos coincida exactamente con el tipo real de módulo del archivo | Poner `verbatimModuleSyntax: false` en `tsconfig.json` |

## ¿Por qué no usar la última versión de TypeScript?

TypeScript 7 es una reescritura del compilador en **Go** (en vez de TypeScript/JavaScript), pensada para ser mucho más rápida. Está en desarrollo activo y todavía no expone de la misma forma las APIs internas (`ts.sys.fileExists`, etc.) de las que depende `ts-node` para compilar archivos al vuelo.

Por eso:
- `tsc` como CLI puede funcionar con TS 7 en muchos casos (usa una interfaz más estable).
- `ts-node` / `ts-node-dev` se rompen, porque se enganchan directamente a las entrañas del compilador viejo.
- `tsx` (alternativa a `ts-node-dev`, usa esbuild por debajo) es más resistente a este tipo de cambios internos.

**Lección:** "última versión" no siempre es sinónimo de "estable para tu caso de uso". Cuando una herramienta depende de las APIs internas de otra, conviene fijar versiones conocidas en vez de dejar que se instale lo último sin control — especialmente en un entorno de clase donde todos deben tener el mismo comportamiento.

## Alternativa recomendada a futuro: `tsx`

Si en algún momento querés evitar por completo estos problemas de compatibilidad con `ts-node`, se puede reemplazar `ts-node-dev` por `tsx`:

```bash
pnpm remove ts-node-dev
pnpm add -D tsx
```

```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts"
  }
}
```

`tsx` usa esbuild por debajo en vez de engancharse a las APIs internas de TypeScript, por lo que es más tolerante a cambios de versión.
