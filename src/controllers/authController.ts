import { Request, Response } from "express";
import pool from "../models/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "node_chat_secret_key";

/**
 * Handles the registration of a new user.
 *
 * This function performs the following steps:
 * 1. Extracts the username, email, and password from the request body.
 * 2. Checks if the username or email already exists in the database.
 * 3. If the username or email already exists, returns a 400 Bad Request response.
 * 4. If the username and email are unique, hashes the password and inserts the new user into the database.
 * 5. Generates a JWT token for the new user and returns a 201 Created response with the user data and token.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const register = async (req: Request, res: Response) => {
  // 1. get username, email, password from req.body
  const { username, email, password } = req.body;

  // 2. check if username or email already exists
  const existingUser = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $2",
    [username, email]
  );

  if (existingUser.rows.length > 0) {
    return res
      .status(400)
      .json({ message: "Username or email already exists" });
  }

  // check if username and email are not empty
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("Hashed password:", hashedPassword);

    // Insert user into the database
    const insertQuery =
      "INSERT INTO users (username, email, password, token) VALUES ($1, $2, $3, $4) RETURNING *";
    const newUserResult = await pool.query(insertQuery, [
      username,
      email,
      hashedPassword,
      "",
    ]);

    if (newUserResult.rows.length === 0) {
      throw new Error("Failed to insert user into the database.");
    }

    const user = newUserResult.rows[0];
    console.log("Inserted user:", user);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "10h",
    });
    console.log("Generated token:", token);

    // Update user with the token
    const updateQuery = "UPDATE users SET token = $1 WHERE id = $2 RETURNING *";
    const updatedUserResult = await pool.query(updateQuery, [token, user.id]);

    if (updatedUserResult.rows.length === 0) {
      throw new Error("Failed to update the user token.");
    }

    const updatedUser = updatedUserResult.rows[0];
    console.log("Updated user with token:", updatedUser);

    res.status(201).json({ user: updatedUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  // 1. get email, password from req.body
  const { email, password } = req.body;

  try {
    // 2. check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    // 4. generate jwt token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "10h",
    });

    // 5. return success message with jwt token
    let finalResult = { ...user, token };
    res.status(200).json({ user: finalResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
