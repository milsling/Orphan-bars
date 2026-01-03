import { db } from "./db";
import { bars, barSequence } from "@shared/schema";
import { eq, isNull } from "drizzle-orm";
import crypto from "crypto";

async function backfillProofData() {
  console.log("Starting proof data backfill...");

  const barsWithoutProof = await db
    .select()
    .from(bars)
    .where(isNull(bars.proofBarId));

  console.log(`Found ${barsWithoutProof.length} bars without proof data`);

  if (barsWithoutProof.length === 0) {
    console.log("No bars need backfilling. Done!");
    return;
  }

  let [sequenceRow] = await db.select().from(barSequence);
  if (!sequenceRow) {
    await db.insert(barSequence).values({ id: "singleton", currentValue: 0 });
    [sequenceRow] = await db.select().from(barSequence);
  }

  let currentNumber = sequenceRow!.currentValue;

  for (const bar of barsWithoutProof) {
    currentNumber++;
    const proofBarId = `orphanbars-#${currentNumber.toString().padStart(5, "0")}`;
    
    const hashInput = `${bar.content}|${bar.createdAt.toISOString()}|${bar.userId}|${proofBarId}`;
    const proofHash = crypto.createHash("sha256").update(hashInput).digest("hex");

    await db
      .update(bars)
      .set({ proofBarId, proofHash })
      .where(eq(bars.id, bar.id));

    console.log(`Updated bar ${bar.id} with proofBarId: ${proofBarId}`);
  }

  await db
    .update(barSequence)
    .set({ currentValue: currentNumber })
    .where(eq(barSequence.id, "singleton"));

  console.log(`Backfill complete! Updated ${barsWithoutProof.length} bars.`);
  console.log(`Next proof ID will be: orphanbars-#${(currentNumber + 1).toString().padStart(5, "0")}`);
}

backfillProofData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
