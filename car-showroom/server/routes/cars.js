import express from 'express';
import { fetchThirdPartyCarCatalog } from '../services/carApiService.js';

export const carsRouter = express.Router();

// GET /api/cars - Paginated Car Catalog with Search, Filters & Sorting
carsRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const search = String(req.query.search || '').toLowerCase().trim();
    const bodyStyle = String(req.query.bodyStyle || '').toLowerCase().trim();
    const sort = String(req.query.sort || 'default');

    const rawCatalog = await fetchThirdPartyCarCatalog();
    let allCars = Array.isArray(rawCatalog) ? [...rawCatalog] : [];

    // 1. Search Filter
    if (search) {
      allCars = allCars.filter(c =>
        String(c.name || '').toLowerCase().includes(search) ||
        String(c.series || '').toLowerCase().includes(search) ||
        String(c.engine || '').toLowerCase().includes(search) ||
        String(c.tagline || '').toLowerCase().includes(search) ||
        String(c.badge || '').toLowerCase().includes(search)
      );
    }

    // 2. Body Style Category Filter
    if (bodyStyle && bodyStyle !== 'all') {
      allCars = allCars.filter(c => String(c.bodyStyle || '').toLowerCase() === bodyStyle);
    }

    // 3. Sorting
    if (sort === 'price-asc') {
      allCars.sort((a, b) => (a.basePriceRaw || 0) - (b.basePriceRaw || 0));
    } else if (sort === 'price-desc') {
      allCars.sort((a, b) => (b.basePriceRaw || 0) - (a.basePriceRaw || 0));
    } else if (sort === 'hp-desc') {
      allCars.sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0));
    } else if (sort === 'speed-desc') {
      allCars.sort((a, b) => (a.zeroToSixty || 9) - (b.zeroToSixty || 9));
    }

    // 4. Pagination Math
    const totalCount = allCars.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedCars = allCars.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      page,
      limit,
      totalCount,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      data: paginatedCars
    });
  } catch (error) {
    console.error('Cars Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inventory', error: error.message });
  }
});

// GET /api/cars/:id - Fetch single vehicle by carId
carsRouter.get('/:id', async (req, res) => {
  try {
    const rawCatalog = await fetchThirdPartyCarCatalog();
    const allCars = Array.isArray(rawCatalog) ? rawCatalog : [];
    const car = allCars.find(c => c.carId === req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: car });
  } catch (error) {
    console.error('Car ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vehicle details', error: error.message });
  }
});
