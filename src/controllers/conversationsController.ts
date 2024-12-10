import { Request, Response } from "express";
import pool from "../models/db";

export const fetchAllConversationsByUserId = async (
  req: Request,
  res: Response
) => {
  let userId = null;

  if (req.user) {
    console.log("User ID from req.user:", req.user.userId);
    userId = req.user.userId;
  }

  console.log("User ID :", userId);

  try {
    const result = await pool.query(
      `
 SELECT 
    c.id AS conversation_id,
    CASE 
        WHEN u1.id = $1 THEN u2.username
        ELSE u1.username
    END AS participant_name,
    m.content AS last_message,
    m.created_at AS last_message_time
FROM conversations c
JOIN users u1 ON u1.id = c.participant_one
JOIN users u2 ON u2.id = c.participant_two
LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages
    WHERE conversation_id = c.id  
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON TRUE
WHERE c.participant_one = $1 OR c.participant_two = $1
ORDER BY m.created_at DESC;
        `,
      [userId]
    );

    console.log("Fetched conversations:", result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    res.status(500).json({
      message: "Internal server error: Failed to fetch conversations",
    });
  }
};
