// const { Router } = require('express');
// const router = Router();
// const fs = require('fs');
// const path = require('path');

// const mysqlConnection = require('../database/database');
// const { userInfo } = require('os');
// const { error } = require('console');

// router.post('/reports', async function (req, res, next) {
//     const sql = "SELECT * FROM mapping.map_report;";
//     const params = [];

//     try {
//         const [rows] = await mysqlConnection.promise().query(sql, params);

//         if (rows.length === 0) {
//             res.status(404).json({ error: 'No data found' });
//             return;
//         }

//         const result = rows.map(row => ({
//             id: row.PK_report,
//             coor_lat: row.coor_lat,
//             coor_lon: row.coor_lon,
//             description: row.description,
//             user: row.FK_user,
//         }));

//         res.json(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// router.put('/upload', async function (req, res, next) {
//     try {
//         const sql = "INSERT INTO mapping.map_report (`coor_lat`, `coor_lon`, `description`, `FK_user`) VALUES (?, ?, ?, ?);";
//         const params = [req.body.coor_lat, req.body.coor_lon, req.body.description, req.body.FK_user];

//         const [pk, message] = await mysqlConnection.promise().query(sql, params);

//         const result = {
//             issucces: (pk == 0 ? 0 : 1),
//             primarykey: pk,
//             error: message
//         };

//         res.send(result);

//     } catch (error) {
//         // Always send a response on error
//         res.status(500).send({ issucces: 0, error: error.message });
//     }
// });

// module.exports = router;

const { Router } = require("express");
const router = Router();

const Report = require("../models/report");
const Image = require("../models/image");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Get all reports
router.post("/reports", async function (req, res) {
  try {
    const { city } = req.body;
    const query = city ? { city: city } : {};
    const reports = await Report.find(query);

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    const result = await Promise.all(
      reports.map(async (row) => {
        const images = await Image.find({ reportId: row._id });

        return {
          id: row._id,
          coor_lat: row.coor_lat,
          coor_lon: row.coor_lon,
          description: row.description,
          brgy: row.brgy,
          city: row.city,
          user: row.user,
          // just send image IDs, Flutter will build the URL
          imageIds: images.map((img) => img._id.toString()),
        };
      }),
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // Insert a new report
// router.put('/upload', async function (req, res) {
//     try {
//         const { coor_lat, coor_lon, description, FK_user } = req.body;

//         const newReport = new Report({
//             coor_lat,
//             coor_lon,
//             description,
//             user: FK_user
//         });

//         const saved = await newReport.save();

//         res.json({
//             issuccess: 1,
//             primarykey: saved._id,
//             error: null
//         });
//     } catch (error) {
//         res.status(500).json({ issuccess: 0, error: error.message });
//     }
// });

// Upload report with multiple images
router.put("/upload", upload.array("images", 5), async function (req, res) {
  try {
    const { coor_lat, coor_lon, description, brgy, city, FK_user } = req.body;

    // 1. Save report
    const newReport = new Report({
      coor_lat,
      coor_lon,
      description,
      brgy,
      city,
      user: FK_user,
    });

    const savedReport = await newReport.save();

    // 2. Save images linked to the report
    const imageDocs = req.files.map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      data: file.buffer, // storing BLOB
      reportId: savedReport._id,
    }));

    await Image.insertMany(imageDocs);

    res.json({
      issuccess: 1,
      primarykey: savedReport._id,
      error: null,
    });
  } catch (error) {
    res.status(500).json({ issuccess: 0, error: error.message });
  }
});

router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: { "User-Agent": "YourAppName/1.0" },
      },
    );
    const data = await response.json();
    res.json(data); // your backend adds CORS automatically
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve single image by its ID
router.get("/image/:id", async function (req, res) {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.set("Content-Type", image.mimetype);
    res.send(image.data); // send raw buffer
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
