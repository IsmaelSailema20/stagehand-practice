import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import fs from "fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function flujoEbayAvanzado() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-2.5-flash",
    timeout: 90000, // Aumentado por las nuevas acciones
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  async function tomarCaptura(page, nombreFase) {
    const ruta = `evidencias/${Date.now()}_${nombreFase}.png`;
    await page.screenshot({ path: ruta, fullPage: true });
    console.log(` Captura guardada: ${ruta}`);
  }

  try {
    console.log(" Iniciando Pipeline Híbrido en eBay...");
    await page.goto("https://www.ebay.com/");
    await delay(5000);
    // ---------------------------------------------------------
    // FASE 1: NAVEGACIÓN DETERMINISTA (PLAYWRIGHT NATIVO)
    // ---------------------------------------------------------
    console.log("\n⌨ [NATIVO - 0 Tokens] Ejecutando búsqueda estructurada...");
    await page.locator("#gh-ac").fill("laptop gaming");
    await delay(1000); // Pausa humana
    await page.locator("#gh-search-btn").click();
    
    console.log(" Esperando carga del DOM...");
    await delay(6000);
    
    console.log("\n [NATIVO - 0 Tokens] Simulando scroll humano para Lazy Loading...");
    // Bajar para cargar imágenes y subir para estabilizar la vista
    await page.evaluate(() => window.scrollBy(0, 1200));
    await delay(3000);
    await page.evaluate(() => window.scrollBy(0, -600));
    await delay(2000);
    await tomarCaptura(page, "1_resultados_busqueda");

    // Preprocesamiento del DOM
    console.log("\n [NATIVO - 0 Tokens] Mutando el DOM (Eliminando target='_blank')...");
    await page.evaluate(() => {
      document.querySelectorAll('a[target="_blank"]').forEach((enlace) => {
        enlace.removeAttribute("target");
      });
    });

    // ---------------------------------------------------------
    // FASE 2: TOMA DE DECISIONES DIFUSAS (IA - STAGEHAND ACT)
    // ---------------------------------------------------------
    console.log("\n [IA - Consumo API] Identificando producto real entre anuncios...");
    await stagehand.act(
      "Haz clic en el título del primer producto de la lista que sea claramente una laptop. Ignora filtros laterales, accesorios o anuncios patrocinados superiores.",
    );

    console.log(" Esperando renderizado de la página de producto...");
    await delay(8000);
    await tomarCaptura(page, "2_pagina_producto");

    // Scroll nativo para asegurar que el cuadro de compra y envío esté a la vista
    console.log("\n [NATIVO - 0 Tokens] Ajustando viewport al área de transacciones...");
    await page.evaluate(() => window.scrollBy(0, 400));
    await delay(3000);

    // ---------------------------------------------------------
    // FASE 3: OBSERVACIÓN SEMÁNTICA (IA - STAGEHAND OBSERVE)
    // ---------------------------------------------------------
    console.log("\n [IA - Consumo API] Evaluando logística de envío...");
    // El método observe no interactúa, solo localiza y reporta elementos basados en una orden semántica
    const observacionEnvio = await stagehand.observe(
      "Encuentra la sección de envío (shipping) y detecta si es gratis o si tiene un costo asociado."
    );
    console.log(" Observaciones logísticas detectadas:", observacionEnvio);
    await delay(2000);

    // ---------------------------------------------------------
    // FASE 4: EXTRACCIÓN ESTRUCTURADA (IA - STAGEHAND EXTRACT)
    // ---------------------------------------------------------
    console.log("\n [IA - Consumo API] Ejecutando minería de datos estructurada...");
    const esquemaLaptop = z.object({
      producto: z.object({
        nombre: z.string(),
        precio: z.string(),
        condicion: z.string().describe("Nuevo, usado, reacondicionado, etc."),
        especificacionesClave: z.array(z.string()),
        politicaDevolucion: z.boolean().describe("Verdadero si el vendedor acepta devoluciones, falso si no."),
      }),
    });

    const datos = await stagehand.extract(
      "Analiza la página actual. Extrae el nombre, precio, condición, políticas de devolución y un arreglo con las características principales de hardware.",
      esquemaLaptop,
    );

    await tomarCaptura(page, "3_despues_de_extraccion");
    console.log("Datos consolidados en JSON:", JSON.stringify(datos, null, 2));
    fs.writeFileSync("laptop_ebay_hibrido.json", JSON.stringify(datos, null, 2));
    
  } catch (error) {
    console.error("Fallo crítico en el pipeline:", error.message);
  } finally {
    console.log("Liberando recursos y cerrando navegador...");
    await stagehand.close();
  }
}

flujoEbayAvanzado().catch(console.error);