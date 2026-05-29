import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

async function runAgent() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-2.5-flash",
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  console.log(" Navigating to the test store...");
  await page.goto("https://books.toscrape.com/");

  // AGENT
  console.log("\n --- AGENT ---");
  console.log("Delegating autonomous navigation to the Agent...");
  const agent = stagehand.agent();
  
  // El agente planifica y ejecuta todos los pasos necesarios por su cuenta
  await agent.execute(
    "Navigate to the 'Poetry' category",
  );

  // EVALS
  console.log("\n --- EVALS ---");
  const currentUrl = page.url();
  if (currentUrl.includes("poetry")) {
    console.log(" Eval PASSED: The agent successfully found and navigated to the Poetry category.");
  } else {
    console.log(` Eval FAILED: The agent ended up on an unexpected path: ${currentUrl}`);
  }

  console.log("\nClosing browser...");
  await stagehand.close();
}

runAgent().catch(console.error);