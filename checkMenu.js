const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const p = new PrismaClient();

async function main() {
  const items = await p.menuItem.findMany({
    select: { itemID: true, itemName: true, imageURL: true, categoryID: true }
  });
  console.log(JSON.stringify(items, null, 2));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
