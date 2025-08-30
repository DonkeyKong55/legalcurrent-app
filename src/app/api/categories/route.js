import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const categories = await sql`
      SELECT id, name, description, created_at
      FROM categories
      ORDER BY name
    `;

    return Response.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return Response.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await sql`
      SELECT id FROM categories WHERE name = ${name}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    // Insert new category
    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}