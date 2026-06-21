const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany({ include: { category: true }});
  console.log('Total items in DB:', items.length);
  if (items.length > 0) {
    const categories = new Set(items.map(i => i.category.categoryName));
    console.log('Categories found in DB:', Array.from(categories));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
