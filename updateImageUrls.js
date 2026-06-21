const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const p = new PrismaClient();

// Map đầy đủ tất cả item -> file ảnh local trong /img/
// Dựa trên danh sách file thực tế trong assets/img
const fullImageMap = {
  // Khai vị (C01) - đã đúng, xác nhận lại
  'M003': '/img/SupMangTayCua.png',
  'M004': '/img/NomHoaChuoi.png',
  'M005': '/img/SaladUcGa.png',

  // Món chính (C02) - đã đúng
  'M006': '/img/BoKhoBanhMi.png',
  'M007': '/img/GaKhoXaOt.png',
  'M008': '/img/CaKhoTo.png',
  'M009': '/img/ComChienHaiSan.png',
  'M010': '/img/BunBoHue.png',

  // Đồ ăn kèm (C03) - đã đúng
  'M011': '/img/KimChiHanQuoc.png',
  'M012': '/img/DuaGopChuaNgot.png',
  'M013': '/img/RauMuongXaoToi.png',
  'M014': '/img/DauChienXaOt.png',
  'M015': '/img/TrungOpLa.png',

  // Tráng miệng (C04) - đã đúng + cập nhật M020
  'M016': '/img/CheDuongNhan.png',
  'M017': '/img/RauCauDua.png',
  'M018': '/img/TraiCayDia.png',
  'M019': '/img/SuaChuaNepCam.png',
  'M020': '/img/BanhFlan.png',           // ✅ Có ảnh chính xác

  // Đồ uống (C05)
  'M021': '/img/CocaCola.png',           // ✅ Có ảnh chính xác
  'M022': '/img/Pepsi.png',              // ✅ Có ảnh chính xác
  'M023': '/img/NuocCamEp.png',          // ✅ Có ảnh chính xác
  'M024': '/img/NuocSuoiAquafina.png',   // ✅ Có ảnh chính xác
  'M025': '/img/TraChanhSa.png',         // ✅ Có ảnh chính xác

  // Cà phê (C06)
  'M026': '/img/CafeDenDa.png',          // ✅ Có ảnh chính xác
  'M027': '/img/CafeSuaDa.png',          // ✅ Có ảnh chính xác
  'M028': '/img/BacXiu.png',             // ✅ Có ảnh chính xác
  'M029': '/img/CafeMuoi.png',           // ✅ Có ảnh chính xác
  'M030': '/img/Capuccino.png',          // ✅ Có ảnh chính xác

  // Bánh ngọt (C07)
  'M031': '/img/Tiramisu.png',           // ✅ Có ảnh chính xác
  'M032': '/img/ChesecakeChanhDay.png',  // ✅ Có ảnh chính xác
  'M033': '/img/BanhSungBo.png',         // ✅ Có ảnh chính xác
  'M034': '/img/MuffinSocola.png',       // ✅ Có ảnh chính xác
  'M035': '/img/BanhRedVelvet.png',      // ✅ Có ảnh chính xác

  // Danh mục cũ (CAT_*)
  'M02':  '/img/TraSenVangMacchiato.png', // ✅ Có ảnh chính xác
  'M05':  '/img/TraLaiLaDua.png',         // ✅ Có ảnh chính xác
};

async function main() {
  let updatedCount = 0;

  for (const [itemID, imageURL] of Object.entries(fullImageMap)) {
    try {
      await p.menuItem.update({
        where: { itemID },
        data: { imageURL }
      });
      console.log(`✅ ${itemID} -> ${imageURL}`);
      updatedCount++;
    } catch (e) {
      console.warn(`⚠️  Skipped ${itemID}: record not found`);
    }
  }

  console.log(`\n✅ Done! Updated ${updatedCount} / ${Object.keys(fullImageMap).length} items.`);
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => p.$disconnect());
