
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { error, info, path } = body;
    const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL;

    if (!webhookUrl) {
        // If no webhook is configured, just log the error to the console.
        console.error("Caught client-side error, but no error webhook is configured.", { error, info, path });
        return NextResponse.json({ message: 'Error logged to server console.' });
    }

    const embed = {
        title: '🚨 Client-Side Error Report',
        description: `An error occurred on the page: \`${path}\``,
        color: 15158332, // Red
        fields: [
            {
                name: 'Error Message',
                value: `\`\`\`${typeof error === 'string' ? error : JSON.stringify(error, null, 2)}\`\`\``,
            },
            {
                name: 'Component Stack',
                value: `\`\`\`${info?.componentStack || 'Not available'}\`\`\``,
            },
        ],
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
            console.error("Failed to send error report to Discord:", errorText);
            return NextResponse.json({ error: 'Failed to send error report.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Error report sent successfully!' });
    } catch (e) {
        console.error("Error sending error report to Discord:", e);
        return NextResponse.json({ error: 'An unexpected error occurred while sending the report.' }, { status: 500 });
    }
}
