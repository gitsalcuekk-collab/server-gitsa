const MAXF = 1_500_000;
const STATUS = ["Menunggu verifikasi", "Sedang diproses", "Ditindaklanjuti", "Ditolak"];
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json;charset=utf-8" } });
const body = async (r) => { try { return await r.json(); } catch { return {}; } };
const t = (s, n) => String(s ?? "").trim().slice(0, n);
const COLS = `a.id,a.ticket,a.judul,a.kategori,a.uraian,a.lokasi,a.anonim,a.status,a.tanggapan,a.komentar,(a.foto!='') AS has_foto,
 CASE WHEN a.anonim=1 THEN 'Anonim' ELSE a.nama END AS nama,
 CASE WHEN a.anonim=1 THEN '' ELSE a.kelas END AS kelas,
 (SELECT COUNT(*) FROM votes v WHERE v.aspirasi_id=a.id) AS upvotes,
 EXISTS(SELECT 1 FROM votes v WHERE v.aspirasi_id=a.id AND v.client_id=?1) AS voted,
 (a.client_id=?1) AS mine`;
const map = (r) => ({ ...r, anonim: !!r.anonim, has_foto: !!r.has_foto, voted: !!r.voted, mine: !!r.mine, komentar: JSON.parse(r.komentar || "[]") });

export default {
  async fetch(req, env) {
    const u = new URL(req.url), p = u.pathname, M = req.method, db = env.DB;
    if (!p.startsWith("/api/")) return env.ASSETS.fetch(req);
    const dec = (x) => { try { return decodeURIComponent(x || ""); } catch { return ""; } };
    const adm = !!env.ADMIN_PIN && dec(req.headers.get("x-admin-pin")) === env.ADMIN_PIN &&
      (!env.ADMIN_USER || dec(req.headers.get("x-admin-user")).toLowerCase() === String(env.ADMIN_USER).toLowerCase());
    const cid = u.searchParams.get("cid") || "";
    const deny = () => J({ success: false, message: "Khusus guru" }, 403);
    try {
      let m;
      if (p === "/api/admin/login" && M === "POST") return adm ? J({ success: true }) : deny();

      if (p === "/api/aspirasi" && M === "GET") {
        const { results } = await db.prepare(`SELECT ${COLS} FROM aspirasi a ORDER BY a.id DESC`).bind(cid).all();
        return J(results.map(map));
      }
      if (p === "/api/aspirasi" && M === "POST") {
        const b = await body(req);
        const judul = t(b.judul, 120), uraian = t(b.uraian, 2000), kat = t(b.kategori, 40);
        if (!judul || !uraian || !kat || !b.cid) return J({ success: false, message: "Judul, kategori, dan uraian wajib diisi" }, 400);
        const foto = b.foto || "";
        if (foto && (foto.length > MAXF || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(foto)))
          return J({ success: false, message: "Foto tidak valid atau terlalu besar" }, 413);
        const id = Date.now(), ticket = "ASP-" + Math.floor(100 + Math.random() * 900);
        await db.prepare("INSERT INTO aspirasi (id,ticket,judul,kategori,uraian,lokasi,nama,kelas,anonim,client_id,foto) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
          .bind(id, ticket, judul, kat, uraian, t(b.lokasi, 100), t(b.nama, 60) || "Siswa", t(b.kelas, 30), b.anonim ? 1 : 0, String(b.cid).slice(0, 64), foto).run();
        return J({ success: true, data: { id, ticket } });
      }
      if ((m = p.match(/^\/api\/aspirasi\/(\d+)$/))) {
        const id = Number(m[1]);
        if (M === "GET") {
          const r = await db.prepare(`SELECT ${COLS},a.foto FROM aspirasi a WHERE a.id=?2`).bind(cid, id).first();
          return r ? J(map(r)) : J({ success: false }, 404);
        }
        if (M === "DELETE") {
          if (!adm) return deny();
          await db.batch([db.prepare("DELETE FROM votes WHERE aspirasi_id=?").bind(id), db.prepare("DELETE FROM aspirasi WHERE id=?").bind(id)]);
          return J({ success: true });
        }
      }
      if ((m = p.match(/^\/api\/aspirasi\/(\d+)\/upvote$/)) && M === "POST") {
        const b = await body(req), id = Number(m[1]);
        if (!b.cid) return J({ success: false }, 400);
        if (!(await db.prepare("SELECT 1 x FROM aspirasi WHERE id=?").bind(id).first())) return J({ success: false }, 404);
        const del = await db.prepare("DELETE FROM votes WHERE aspirasi_id=? AND client_id=?").bind(id, String(b.cid)).run();
        const had = del.meta.changes > 0;
        if (!had) await db.prepare("INSERT INTO votes VALUES (?,?)").bind(id, String(b.cid)).run();
        const c = await db.prepare("SELECT COUNT(*) n FROM votes WHERE aspirasi_id=?").bind(id).first();
        return J({ success: true, upvotes: c.n, voted: !had });
      }
      if ((m = p.match(/^\/api\/aspirasi\/(\d+)\/komentar$/)) && M === "POST") {
        const b = await body(req), id = Number(m[1]), teks = t(b.teks, 500);
        if (!teks) return J({ success: false }, 400);
        const r = await db.prepare("SELECT komentar FROM aspirasi WHERE id=?").bind(id).first();
        if (!r) return J({ success: false }, 404);
        const list = JSON.parse(r.komentar || "[]");
        if (list.length >= 100) return J({ success: false, message: "Komentar penuh" }, 400);
        list.push({ n: t(b.nama, 60) || "Siswa", t: teks, w: Date.now() });
        await db.prepare("UPDATE aspirasi SET komentar=? WHERE id=?").bind(JSON.stringify(list), id).run();
        return J({ success: true });
      }
      if (p === "/api/admin/tanggapi" && M === "POST") {
        if (!adm) return deny();
        const b = await body(req);
        if (!STATUS.includes(b.status)) return J({ success: false, message: "Status tidak valid" }, 400);
        const r = await db.prepare("UPDATE aspirasi SET status=?, tanggapan=? WHERE id=?").bind(b.status, t(b.tanggapan, 1000), Number(b.id)).run();
        return r.meta.changes ? J({ success: true }) : J({ success: false }, 404);
      }
      if (p === "/api/agenda" && M === "GET") {
        const { results } = await db.prepare("SELECT * FROM agenda ORDER BY tanggal ASC").all();
        return J(results);
      }
      if (p === "/api/agenda" && M === "POST") {
        if (!adm) return deny();
        const b = await body(req), judul = t(b.judul, 120);
        if (!judul || !/^\d{4}-\d{2}-\d{2}$/.test(b.tanggal || "")) return J({ success: false, message: "Judul dan tanggal wajib" }, 400);
        await db.prepare("INSERT INTO agenda (id,judul,tanggal,tempat) VALUES (?,?,?,?)").bind(Date.now(), judul, b.tanggal, t(b.tempat, 100)).run();
        return J({ success: true });
      }
      if ((m = p.match(/^\/api\/agenda\/(\d+)$/)) && M === "DELETE") {
        if (!adm) return deny();
        await db.prepare("DELETE FROM agenda WHERE id=?").bind(Number(m[1])).run();
        return J({ success: true });
      }
      return J({ success: false, message: "Not found" }, 404);
    } catch (e) {
      console.error(e);
      return J({ success: false, message: "Server error" }, 500);
    }
  },
};
