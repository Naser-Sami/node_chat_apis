import { Request, Response } from "express";
import pool from "../models/db";

export const fetchContacts = async (
  req: Request,
  res: Response
): Promise<any> => {
  let userId = null;
  if (req.user) {
    console.log("User ID from req.user:", req.user.userId);
    userId = req.user.userId;
  }

  try {
    const result = await pool.query(
      `
        SELECT u.id AS contact_id, u.username, u.email
        FROM contacts c
        JOIN users u ON u.id = c.contact_id
        WHERE c.user_id = $1
        ORDER BY u.username ASC;
        `,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    res.status(500).json({
      message: "Internal server error: Failed to fetch contacts",
    });
  }
};

export const addContact = async (req: Request, res: Response): Promise<any> => {
  let userId = null;
  if (req.user) {
    console.log("User ID from req.user:", req.user.userId);
    userId = req.user.userId;
  }

  const { contactEmail } = req.body;

  try {
    const contactExists = await pool.query(
      ` SELECT id FROM users WHERE email = $1`,
      [contactEmail]
    );

    if (contactExists.rowCount === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const contactId = contactExists.rows[0].id;
    console.log("Contact Id = ", contactId);

    await pool.query(
      `
        INSERT INTO contacts (user_id, contact_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
      [userId, contactId]
    );

    return res.status(201).json({ message: "Contact added successfully" });
  } catch (error) {
    console.error("Failed to add contact:", error);
    return res.status(500).json({
      message: "Internal server error: Failed to add contact",
    });
  }
};
