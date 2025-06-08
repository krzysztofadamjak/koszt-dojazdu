const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio"); // Do scrapowania HTML

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/ceny-paliw", async (req, res) => {
  const woj = req.query.wojewodztwo;
  try {
    // PRZYKŁAD: Scrapowanie danych z autocentrum.pl (tylko jeśli dozwolone)
    const url = "https://www.autocentrum.pl/paliwa/ceny-paliw/";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const ceny = {};
    $("table.fuel-price-table tbody tr").each((_, row) => {
      const wojewodztwo = $(row).find("td").eq(0).text().trim().toLowerCase();
      if (wojewodztwo.includes(woj.toLowerCase())) {
        ceny["95"] = parseFloat($(row).find("td").eq(1).text().replace(",", "."));
        ceny["98"] = parseFloat($(row).find("td").eq(2).text().replace(",", "."));
        ceny["ON"] = parseFloat($(row).find("td").eq(3).text().replace(",", "."));
        ceny["LPG"] = parseFloat($(row).find("td").eq(4).text().replace(",", "."));
      }
    });

    if (!ceny["95"]) {
      return res.status(404).json({ error: "Nie znaleziono cen dla tego województwa." });
    }

    return res.json({ ...ceny, aktualizacja: new Date().toLocaleDateString("pl-PL") });
