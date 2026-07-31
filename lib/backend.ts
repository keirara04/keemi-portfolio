const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export async function submitContactForm(payload: {
  fromName: string;
  subject: string;
  body: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from_name: payload.fromName,
      subject: payload.subject,
      body: payload.body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Contact submission failed with status ${response.status}`);
  }
}
