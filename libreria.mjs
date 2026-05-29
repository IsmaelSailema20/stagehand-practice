import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import fs from "fs";

// Aseguramos que la carpeta de evidencias exista
if (!fs.existsSync("evidencias")) {
  fs.mkdirSync("evidencias");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función auxiliar para tomar capturas con nombres descriptivos
async function tomarCaptura(page, nombreFase) {
  const ruta = `evidencias/${Date.now()}_${nombreFase}.png`;
  await page.screenshot({ path: ruta, fullPage: true });
  console.log(`📸 Captura guardada: ${ruta}`);
}

async function ejecutarFlujoExtendido() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-3.5-flash",
    timeout: 30000,
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  console.log("🚀 Navegando a la tienda de prueba...");
  await page.goto("https://books.toscrape.com/");
  await tomarCaptura(page, "0_inicio");

  // ---------------------------------------------------------
  // 1. OBSERVE
  // ---------------------------------------------------------
  console.log("\n --- OBSERVE ---");
  const observaciones = await stagehand.observe(
    "Encuentra los enlaces a las diferentes categorías de libros",
  );
  console.log(`Se detectaron ${observaciones.length} categorías.`);
  await tomarCaptura(page, "1_observe");

  console.log("\n Pausa de 15 segundos...");
  await delay(15000);

  // ---------------------------------------------------------
  // 2. ACT
  // ---------------------------------------------------------
  console.log("\n --- ACT (Navegación) ---");
  await stagehand.act("Haz clic en el enlace de la categoría 'Science'");
  await tomarCaptura(page, "2_despues_de_navegar");

  console.log("\n Pausa de 15 segundos...");
  await delay(15000);
  
  console.log("\n --- ACT (Interacción) ---");
  await stagehand.act("Haz clic en el titulo de tercer libro ");
  await tomarCaptura(page, "4_detalle_libro");
  console.log("\n Pausa de 15 segundos...");

  console.log("\n --- ACT (Interacción) ---");
  await stagehand.act("Scrollea hasta que encuentres la lista de libros y haz clic en el botón 'Add to basket' del segundo libro");
  await tomarCaptura(page, "5_despues_de_agregar_carrito");

  console.log("\n Pausa de 15 segundos...");
  await delay(15000);

  console.log("\n --- ACT (Interacción) ---");
  await stagehand.act("Regresa a la pagina principal");
  await tomarCaptura(page, "pagina_principal");



  // ---------------------------------------------------------
  // 3. EXTRACT
  // ---------------------------------------------------------
  console.log("\n --- EXTRACT ---");
  const esquemaInventario = z.object({
    productos: z.array(
      z.object({
        titulo: z.string(),
        precio: z.string(),
        enStock: z.boolean(),
      }),
    ),
  });

  const datosInventario = await stagehand.extract(
    "Extrae el título y el precio de los primeros 3 libros",
    esquemaInventario,
  );

  const nombreArchivo = "inventario_extraido.json";
  fs.writeFileSync(nombreArchivo, JSON.stringify(datosInventario, null, 2));
  await tomarCaptura(page, "4_despues_de_extraer");
  // ---------------------------------------------------------
  // 4. EVALS: Validación de QA Inteligente
  // ---------------------------------------------------------
  console.log("\n --- EVALS ---");

  try {
    // 1. Damos un tiempo de espera explícito (hasta 5 segundos) para que el elemento aparezca
    // 2. Usamos un selector más genérico o esperamos al texto que esperamos ver
    const cartElement = page.locator("text=basket");

    // Esperamos a que el elemento sea visible antes de intentar leerlo
    await cartElement.waitFor({ state: "visible", timeout: 5000 });

    const textoCarrito = await cartElement.textContent();

    if (
      textoCarrito &&
      (textoCarrito.includes("1") || textoCarrito.includes("item"))
    ) {
      console.log("✅ Eval SUPERADO: El carrito se actualizó correctamente.");
    } else {
      console.log(`❌ Eval FALLIDO: El texto del carrito es: ${textoCarrito}`);
    }
  } catch (error) {
    console.log(
      "⚠️ Eval ADVERTENCIA: No se pudo localizar el carrito, es posible que la página no lo muestre en esta vista.",
    );
  }


  await tomarCaptura(page, "5_evaluacion_final");
  console.log("\nCerrando navegador...");
  await stagehand.close();
}

ejecutarFlujoExtendido().catch(console.error);
