// scripts/update-berita.js
import fs from "fs";
import path from "path";
import RSSParser from "rss-parser";

// RSS sepak bola ESPN
// (headline sepak bola dunia, cukup rame dan update terus)
const FEED_URL = "https://www.espn.com/espn/rss/soccer/news";

const parser = new RSSParser();

// helper: format tanggal ke gaya Indonesia singkat
function formatDate(pubDate) {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// helper: bersihin teks & potong jadi ringkasan pendek
function makeExcerpt(text, max = 180) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max) + "…";
}

async function run() {
  console.log("Mengambil RSS dari:", FEED_URL);
  const feed = await parser.parseURL(FEED_URL);

  // Ambil misal 15 berita terbaru
  const items = (feed.items || []).slice(0, 15);

  const articles = items.map((item, index) => {
    const id = `espn-${item.guid || item.id || index}`;
    const date = formatDate(item.pubDate);
    const excerpt =
      makeExcerpt(
        item.contentSnippet || item.summary || item.content || ""
      );

    return {
      id,
      title: item.title || "",
      category: "Internasional",       // kamu bisa ganti kalau mau
      tag: "ESPN",                     // tampil di chip
      date,
      views: "",                       // kalau mau bisa diisi random nanti
      readingTime: "3 menit baca",     // kira-kira saja
      excerpt,
      content: "",                     // kita sengaja kosongkan, baca penuh di sumber
      source: "ESPN",
      sourceUrl: item.link || ""
    };
  });

  const filePath = path.join(process.cwd(), "berita.json");
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), "utf8");

  console.log(`Berhasil update ${filePath} dengan ${articles.length} berita.`);
}

run().catch((err) => {
  console.error("Gagal update berita:", err);
  process.exit(1);
});
