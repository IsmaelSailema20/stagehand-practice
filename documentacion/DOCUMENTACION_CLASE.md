# 🚀 Stagehand - Guía Completa de Automatización y Scraping con IA

Esta página contiene la documentación completa, guías de instalación, configuración y análisis de los scripts del proyecto de automatización inteligente basado en **Stagehand** y **Playwright**, utilizando modelos de **Google Gemini**.

---

## 📌 Resumen del Proyecto
El proyecto utiliza **Stagehand**, una biblioteca de automatización web de nivel superior desarrollada por Browserbase. A diferencia de Playwright clásico que requiere selectores CSS/XPath rígidos y frágiles, Stagehand utiliza Modelos de Lenguaje (LLMs) para interactuar con la página de manera semántica mediante lenguaje natural, observar elementos y extraer datos estructurados con esquemas **Zod**.

---

## 📦 Requisitos e Instalación

### Requisitos Previos
* **Node.js**: Versión `^20.19.0` o `>=22.12.0`.
* **Clave de API**: Cuenta y API Key de Google AI Studio (Gemini).

### Instalación Paso a Paso
1. **Clonar o descargar** el proyecto a tu máquina local.
2. **Abrir la terminal** en la raíz del proyecto.
3. **Instalar las dependencias** con npm:
   ```bash
   npm install
   ```
   > 💡 **Nota:** Si estás inicializando desde cero, puedes instalar los paquetes individualmente:
   > ```bash
   > npm install @browserbasehq/stagehand dotenv zod @ai-sdk/google
   > ```

---

## 🔑 Configuración del Entorno (`.env`)

Crea un archivo llamado `.env` en la raíz del proyecto (si aún no existe) y agrega tu clave de API de Gemini:

```env
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_de_api_aqui
```

> ⚠️ **Importante:** Nunca compartas ni subas tu archivo `.env` a repositorios públicos como GitHub. Ya se encuentra en el archivo `.gitignore` si corresponde.

---

## 📂 Base de Datos de Scripts del Proyecto

| Nombre del Script | Propósito Principal | Modelo LLM Usado | Archivo de Salida | Estado de Práctica |
| :--- | :--- | :--- | :--- | :--- |
| `Demostracion.mjs` | Flujo completo de e-commerce (Observe, Act, Extract, Evals) | `google/gemini-3.5-flash` | `inventario_extraido.json` | ✅ Completado y Probado |
| `agente.mjs` | Navegación autónoma delegada al agente de Stagehand | `google/gemini-2.5-flash` | Ninguno (Consola) | ✅ Completado y Probado |
| `amazon.mjs` | Búsqueda y extracción de laptops (E-commerce real) | `google/gemini-2.5-pro` | `laptop_amazon.json` | ⚠️ Sujeto a Captchas/Bots |

---

## 🕹️ Explicación de los Scripts y Flujos

### 1. `Demostracion.mjs` (books.toscrape.com)
Este script demuestra las 4 operaciones principales de Stagehand en una tienda de libros de prueba:
* **OBSERVE**: Identifica categorías disponibles en la barra lateral sin selectores hardcodeados.
* **ACT**:
  * Navega haciendo clic en la categoría `"Science"`.
  * Hace clic en el título del tercer libro para ver detalles.
  * Agrega el segundo libro al carrito (`Add to basket`).
  * Regresa a la página principal.
* **EXTRACT**: Extrae datos estructurados de los primeros 3 libros usando un esquema Zod (`titulo`, `precio`, `enStock`) y los guarda en `inventario_extraido.json`.
* **EVALS**: Valida que la interacción del carrito funcionara buscando la presencia de texto "basket" o "1 item".
* **Captura de Pantalla**: Genera evidencias visuales en la carpeta `./evidencias/` con la marca de tiempo correspondiente.

### 2. `agente.mjs` (Agente Autónomo)
Demuestra el modo agente autónomo de Stagehand:
* En lugar de indicarle paso a paso qué hacer, se le da un objetivo de alto nivel: `Navigate to the 'Poetry' category`.
* El agente planifica, busca los enlaces, hace clic y decide cuándo ha terminado el objetivo.
* Se valida la URL final para confirmar el éxito del flujo.

### 3. `amazon.mjs` (Amazon Gaming Laptop Scraper)
Un caso de uso práctico en un sitio de producción de alta complejidad:
* Navega a Amazon.
* Interactúa con diálogos iniciales molestos (popups de ubicación, etc.).
* Escribe `"laptop gaming"` en la barra de búsqueda y presiona Enter.
* Entra al primer resultado y extrae información estructurada avanzada:
  * Nombre del producto.
  * Precio actual.
  * Puntuación/Rating de estrellas.
  * Lista de especificaciones clave.
* Guarda los datos en `laptop_amazon.json`.
* *Nota: Amazon implementa fuertes medidas antibot, por lo que el script usa un modelo más avanzado (`gemini-2.5-pro`) y pausas estratégicas (`delay`).*

---

## 🚀 Cómo Ejecutar los Scripts

Asegúrate de tener configurada tu API Key y corre los siguientes comandos en tu terminal:

* **Para ejecutar el flujo de libros interactivo:**
  ```bash
  node Demostracion.mjs
  ```

* **Para ejecutar el Agente Autónomo:**
  ```bash
  node agente.mjs
  ```

* **Para ejecutar el flujo de Amazon:**
  ```bash
  node amazon.mjs
  ```

---

## 🖼️ Capturas de Evidencias
Los scripts están configurados para guardar capturas de pantalla automáticas en la carpeta `evidencias/`.
* Las capturas siguen la nomenclatura: `evidencias/<timestamp>_<nombre_fase>.png`.
* Te permiten auditar el comportamiento visual del navegador local (`LOCAL` env) controlado por Stagehand.

---

## 🛠️ Solución de Problemas Comunes

> 💡 **Error: `API_KEY_INVALID` o similar**
> * Verifica que tu archivo `.env` esté en la raíz exacta del proyecto (no dentro de una subcarpeta).
> * Asegúrate de que la variable sea exactamente `GOOGLE_GENERATIVE_AI_API_KEY`.

> 💡 **Error: Tiempos de espera agotados (Timeout)**
> * Algunos sitios pesados como Amazon pueden demorar más en cargar. Si experimentas timeouts, puedes incrementar el valor de `timeout` en la inicialización de Stagehand o aumentar los retardos del script.

> 💡 **Fallo en Amazon (Detección de Bots / Captcha)**
> * Amazon detecta firmas de automatización de Playwright. Para entornos de producción, considera configurar Stagehand para usar Browserbase en la nube en lugar de `LOCAL`.
