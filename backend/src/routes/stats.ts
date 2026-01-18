// src/routes/stats.ts
// Statistics routes

import { Router } from 'express';
import {
    getPlatformStats,
    getColleges,
    getSubjects,
    getBranches,
    getSemesters,
    getTrending,
} from '../controllers/statsController';

const router = Router();

// All routes are public
router.get('/', getPlatformStats);
router.get('/colleges', getColleges);
router.get('/subjects', getSubjects);
router.get('/branches', getBranches);
router.get('/semesters', getSemesters);
router.get('/trending', getTrending);

export default router;
