import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // Method Not Allowed
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await axios.post("https://test.stytch.com/v1/crypto_wallets/authenticate/start",
      req.body,
      {
        auth: {
          username: process.env.STYTCH_PROJECT_ID!,
          password: process.env.STYTCH_SECRET!
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response.data });
  }
};
