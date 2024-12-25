import express from 'express'
import { deleteSelectedProduct, getAllProducts, getSelectedProduct, postProduct, updateSelectedProduct } from './menuServices.js';
const router = express.Router();

router.get('/', getAllProducts);
router.post('/creatmenu', postProduct)
router.get('/:id', getSelectedProduct);
router.put('/:id', updateSelectedProduct);
router.delete('/:id', deleteSelectedProduct)

export default router;