// Vercel Serverless Function: /api/submit-coaching.js
// This runs on Vercel's servers and keeps the Brevo API key secret

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, phone, instagram, goal, level, challenge, budget } = req.body;

    // Validate required fields
    if (!email || !name || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or update contact in Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          VORNAME: name,
          PHONE: phone || '',
          INSTAGRAM: instagram || '',
          GOAL: goal,
          LEVEL: level,
          CHALLANGE: challenge,
          BUDGET: budget
        },
        listIds: [8], // Brick by Brik Coaching Leads list
        updateEnabled: true // If contact exists, update them
      })
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      // Still return success to user even if Brevo fails — we have Formspree as backup
      console.error('Brevo error:', errorData);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    // Return success anyway — Formspree has the data
    return res.status(200).json({ success: true });
  }
}
