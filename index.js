const MAX_FOTO = 1_500_000; // batas D1 per baris ~2 MB

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const toItem = (r) => ({ ...r, komentar: JSON.parse(r.komentar || "[]") });

async function body(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;
    const db = env.DB;

    if (!pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      // GET semua aspirasi
      if (pathname === "/api/aspirasi" && method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM aspirasi ORDER BY id DESC")
          .all();
        return json(results.map(toItem));
      }

      // POST aspirasi baru
      if (pathname === "/api/aspirasi" && method === "POST") {
        const { kategori, urgensi, pesan, foto } = await body(request);
        if (!pesan)
          return json({ success: false, message: "Pesan wajib diisi" }, 400);
        if (foto && foto.length > MAX_FOTO)
          return json(
            { success: false, message: "Foto terlalu besar, kompres dulu (maks ~1 MB)" },
            413
          );

        const item = {
          id: Date.now(),
          ticket: "ASP-" + Math.floor(100 + Math.random() * 900),
          kategori: kategori || "Umum",
          urgensi: urgensi || "Biasa",
          pesan,
          status: "Menunggu",
          tanggapan: "",
          foto: foto || "",
          upvotes: 0,
          komentar: [],
          tanggal: new Date().toISOString().split("T")[0],
        };

        await db
          .prepare(
            `INSERT INTO aspirasi
             (id, ticket, kategori, urgensi, pesan, status, tanggapan, foto, upvotes, komentar, tanggal)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`
          )
          .bind(
            item.id, item.ticket, item.kategori, item.urgensi, item.pesan,
            item.status, item.tanggapan, item.foto, item.upvotes, "[]", item.tanggal
          )
          .run();

        return json({ success: true, data: item });
      }

      // Upvote
      let m = pathname.match(/^\/api\/aspirasi\/(\d+)\/upvote$/);
      if (m && method === "POST") {
        const row = await db
          .prepare("UPDATE aspirasi SET upvotes = upvotes + 1 WHERE id = ? RETURNING upvotes")
          .bind(m[1])
          .first();
        if (!row) return json({ success: false }, 404);
        return json({ success: true, upvotes: row.upvotes });
      }

      // Tambah komentar
      m = pathname.match(/^\/api\/aspirasi\/(\d+)\/komentar$/);
      if (m && method === "POST") {
        const { teks } = await body(request);
        const row = await db
          .prepare("SELECT komentar FROM aspirasi WHERE id = ?")
          .bind(m[1])
          .first();
        if (!row) return json({ success: false }, 404);
        const list = JSON.parse(row.komentar || "[]");
        list.push(teks);
        await db
          .prepare("UPDATE aspirasi SET komentar = ? WHERE id = ?")
          .bind(JSON.stringify(list), m[1])
          .run();
        return json({ success: true });
      }

      // Tanggapi (guru/admin)
      if (pathname === "/api/admin/tanggapi" && method === "POST") {
        const { id, status, tanggapan } = await body(request);
        const row = await db
          .prepare("SELECT id FROM aspirasi WHERE id = ?")
          .bind(id)
          .first();
        if (!row) return json({ success: false }, 404);
        if (status)
          await db.prepare("UPDATE aspirasi SET status = ? WHERE id = ?").bind(status, id).run();
        if (tanggapan !== undefined)
          await db.prepare("UPDATE aspirasi SET tanggapan = ? WHERE id = ?").bind(tanggapan, id).run();
        return json({ success: true });
      }

      // Hapus
      m = pathname.match(/^\/api\/aspirasi\/(\d+)$/);
      if (m && method === "DELETE") {
        await db.prepare("DELETE FROM aspirasi WHERE id = ?").bind(m[1]).run();
        return json({ success: true });
      }

      return json({ success: false, message: "Not found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ success: false, message: "Server error" }, 500);
    }
  },
};
