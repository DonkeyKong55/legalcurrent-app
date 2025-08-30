import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const messageId = params.id;
    const body = await request.json();
    const { status, admin_notes } = body;

    // Validate the message ID
    if (!messageId || isNaN(parseInt(messageId))) {
      return Response.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['new', 'responded', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return Response.json(
        { error: 'Invalid status. Must be one of: new, responded, archived' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      
      // If marking as responded, set responded_at timestamp
      if (status === 'responded') {
        paramCount++;
        updateFields.push(`responded_at = $${paramCount}`);
        values.push(new Date().toISOString());
      }
    }

    if (admin_notes !== undefined) {
      paramCount++;
      updateFields.push(`admin_notes = $${paramCount}`);
      values.push(admin_notes);
    }

    if (updateFields.length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add message ID and WHERE clause
    paramCount++;
    values.push(messageId);

    const query = `
      UPDATE contact_messages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, subject, status, created_at, responded_at
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Contact message updated successfully',
      data: result[0]
    });

  } catch (error) {
    console.error('Failed to update contact message:', error);
    return Response.json(
      { error: 'Failed to update contact message' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const messageId = params.id;

    if (!messageId || isNaN(parseInt(messageId))) {
      return Response.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT id, name, email, subject, message, message_type, status, created_at, responded_at, admin_notes
      FROM contact_messages 
      WHERE id = ${messageId}
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: result[0]
    });

  } catch (error) {
    console.error('Failed to fetch contact message:', error);
    return Response.json(
      { error: 'Failed to fetch contact message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const messageId = params.id;

    if (!messageId || isNaN(parseInt(messageId))) {
      return Response.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM contact_messages 
      WHERE id = ${messageId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete contact message:', error);
    return Response.json(
      { error: 'Failed to delete contact message' },
      { status: 500 }
    );
  }
}