import { Hono } from 'hono';

// ─── Schema Metadata ───

interface FieldDef {
  name: string;
  type: string;
  description: string;
}

interface SchemaDef {
  name: string;
  description: string;
  version: string;
  fields: FieldDef[];
}

const SCHEMAS: SchemaDef[] = [
  {
    name: 'product',
    description: 'Structured product data from e-commerce product pages',
    version: '1.0.0',
    fields: [
      { name: 'name', type: 'string | null', description: 'Product name' },
      { name: 'brand', type: 'string | null', description: 'Brand or manufacturer' },
      { name: 'price', type: 'number | null', description: 'Product price as a number' },
      { name: 'currency', type: 'string | null', description: 'Currency code (USD, EUR, GBP, etc.)' },
      { name: 'in_stock', type: 'boolean | null', description: 'Whether the product is in stock' },
      { name: 'rating', type: 'number | null', description: 'Average customer rating (out of 5)' },
      { name: 'review_count', type: 'number | null', description: 'Total number of customer reviews' },
      { name: 'description', type: 'string | null', description: 'Product description text' },
      { name: 'image', type: 'string | null', description: 'Main product image URL' },
      { name: 'specs', type: 'Record<string, string>', description: 'Product specifications as key-value pairs' },
      { name: 'availability', type: 'string | null', description: 'Availability status (e.g. "In Stock, Ships in 24h")' },
    ],
  },
  {
    name: 'article',
    description: 'Structured article data from blog posts, news, and editorial content',
    version: '1.0.0',
    fields: [
      { name: 'title', type: 'string | null', description: 'Article headline' },
      { name: 'author', type: 'string | null', description: 'Author name' },
      { name: 'date', type: 'string | null', description: 'Publication date' },
      { name: 'reading_time', type: 'number | null', description: 'Estimated reading time in minutes' },
      { name: 'excerpt', type: 'string | null', description: 'Short summary or excerpt' },
      { name: 'content_summary', type: 'string | null', description: 'Summarised article body text' },
      { name: 'topics', type: 'string[]', description: 'Detected topics or tags' },
    ],
  },
  {
    name: 'company',
    description: 'Company and organisation data from corporate websites and profiles',
    version: '1.0.0',
    fields: [
      { name: 'name', type: 'string | null', description: 'Company name' },
      { name: 'description', type: 'string | null', description: 'Company description or tagline' },
      { name: 'founded', type: 'string | null', description: 'Founding year or date' },
      { name: 'size', type: 'string | null', description: 'Employee count range' },
      { name: 'funding_total', type: 'string | null', description: 'Total funding raised' },
      { name: 'industry', type: 'string | null', description: 'Industry sector' },
      { name: 'location', type: 'string | null', description: 'Headquarters location' },
      { name: 'competitors', type: 'string[]', description: 'List of competitor names' },
    ],
  },
];

// ─── Routes ───

const router = new Hono();

router.get('/', (c) => {
  return c.json({
    schemas: SCHEMAS.map((s) => ({
      name: s.name,
      description: s.description,
      version: s.version,
      fields: s.fields.map((f) => ({
        name: f.name,
        type: f.type,
        description: f.description,
      })),
    })),
  });
});

export { router as schemasRoutes };
