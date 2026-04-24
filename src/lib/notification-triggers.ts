import { supabase } from "@/lib/supabase";
import type { NotificationType } from "@/contexts/NotificationContext";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, any> = {}
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    data,
  });

  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function notifyNewModel(modelName: string, organization: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await createNotification(
    user.id,
    "NEW_MODEL",
    "New Model Released",
    `${modelName} by ${organization} has been added to the platform.`,
    { modelName, organization }
  );
}

export async function notifyBenchmarkUpdate(
  modelName: string,
  benchmarkName: string,
  oldScore: number,
  newScore: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const change = newScore - oldScore;
  const direction = change > 0 ? "increased" : "decreased";

  await createNotification(
    user.id,
    "BENCHMARK_UPDATE",
    "Benchmark Score Updated",
    `${modelName}'s score on ${benchmarkName} has ${direction} from ${oldScore} to ${newScore}.`,
    { modelName, benchmarkName, oldScore, newScore, change }
  );
}

export async function notifyTopModelChange(
  modelName: string,
  oldRank: number,
  newRank: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const change = oldRank - newRank;
  const direction = change > 0 ? "improved" : "declined";

  await createNotification(
    user.id,
    "TOP_MODEL_CHANGE",
    "Leaderboard Position Changed",
    `${modelName} has ${direction} from rank ${oldRank} to rank ${newRank}.`,
    { modelName, oldRank, newRank, change }
  );
}

export async function notifyPriceChange(
  modelName: string,
  oldPrice: number,
  newPrice: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const change = newPrice - oldPrice;
  const direction = change > 0 ? "increased" : "decreased";

  await createNotification(
    user.id,
    "PRICE_CHANGE",
    "Price Updated",
    `${modelName}'s cost per 1K tokens has ${direction} from $${oldPrice.toFixed(4)} to $${newPrice.toFixed(4)}.`,
    { modelName, oldPrice, newPrice, change }
  );
}

export async function notifyMilestone(
  modelName: string,
  milestone: string,
  score: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await createNotification(
    user.id,
    "MILESTONE",
    "Milestone Achieved",
    `${modelName} has achieved a milestone: ${milestone} with a score of ${score}.`,
    { modelName, milestone, score }
  );
}

export async function notifyCustom(
  title: string,
  message: string,
  data: Record<string, any> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await createNotification(user.id, "CUSTOM", title, message, data);
}
