# Dependencias necesarias

Lista minima para ejecutar el proyecto tal como esta configurado (modelo `google/gemini-2.5-flash`):

- @browserbasehq/stagehand
- dotenv
- zod
- @ai-sdk/google

Nota: `fs` es modulo nativo de Node.js; no se instala.

## Instalacion

1. Requisito de Node.js: `^20.19.0` o `>=22.12.0`.
2. En la raiz del proyecto, instale las dependencias minimas:

```
npm install @browserbasehq/stagehand dotenv zod @ai-sdk/google
```

## Pasos para realizar la practica

1. Cree un archivo `.env` en la raiz con la clave del proveedor de Google:

```
GOOGLE_GENERATIVE_AI_API_KEY=TU_CLAVE
```

2. Ejecute la practica principal:

```
node Demostracion.mjs
```

3. Si desea probar el agente autonomo:

```
node agente.mjs
```
