
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { isPositive, feedback, reasons, pathname } = body;
    const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error("Discord feedback webhook URL not set in environment variables.");
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
        });
    }

    const dateString = new Date().toISOString().split('T')[0];
    const randomString = Array.from({ length: 5 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const feedbackText = feedback || 'No detailed feedback provided.';
    const githubUrl = `https://github.com/b00skit/mdc-panel-plus/issues/new?title=${encodeURIComponent(
        `Feedback ${dateString} [${randomString}]`
    )}&body=${encodeURIComponent(feedbackText)}`;

    fields.push({
        name: 'GitHub',
        value: `[Send to GitHub](${githubUrl})`,
    });

    const embed = {
        title: `New Feedback Received: ${isPositive ? 'Positive' : 'Negative'}`,
        description: feedbackText,
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
