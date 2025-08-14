
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { isPositive, feedback, reasons, pathname } = body;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error("Discord webhook URL not set in environment variables.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const fields = [];
    if (reasons && reasons.length > 0) {
        fields.push({
            name: "Reasons:",
            value: reasons.join('\n'),
        });
    }

    if (pathname) {
        fields.push({
            name: "Page",
            value: `\`${pathname}\``,
            inline: true,
        })
    }


    const embed = {
        title: `New Feedback Received: ${isPositive ? "Positive" : "Negative"}`,
        description: feedback || "No detailed feedback provided.",
        color: isPositive ? 3066993 : 15158332, // Green for positive, Red for negative
        fields: fields,
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to send feedback to Discord:", errorText);
            return NextResponse.json({ error: 'Failed to send feedback.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
