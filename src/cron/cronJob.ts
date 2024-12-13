import cron from "node-cron";
import { generateDailyQuestion } from "../services/openaiService";
import pool from "../models/db";

// Schedule a task to run every minute
const task = cron.schedule("* * * * *", async () => {
  try {
    const conversations = await pool.query("SELECT id FROM conversations");
    for (const conversation of conversations.rows) {
      const question = await generateDailyQuestion();

      await pool.query(
        "INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, 'AI-BOT, $2)",
        [conversation.id, question]
      );

      console.log("Daily question added to conversation:", conversation.id);
    }
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});

// Start the task
// task.start();

// To stop the task, you can call
// task.stop();
