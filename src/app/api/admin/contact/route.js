import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    
    let query;
    let params = [];
    
    if (status === 'all') {
      query = `
        SELECT id, name, email, subject, message, message_type, status, created_at, responded_at
        FROM contact_messages 
        ORDER BY created_at DESC
      `;
    } else {
      query = `
        SELECT id, name, email, subject, message, message_type, status, created_at, responded_at
        FROM contact_messages 
        WHERE status = $1
        ORDER BY created_at DESC
      `;
      params = [status];
    }

    const messages = await sql(query, params);

    // Get summary stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'responded') as responded_count
      FROM contact_messages
    `;

    return Response.json({
      messages,
      stats: stats[0] || { total: 0, new_count: 0, responded_count: 0 }
    });

  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return Response.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}