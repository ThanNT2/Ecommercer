const ProductCategory = require('../models/productCategory')
const asyncHandler = require('express-async-handler')

//create
const createCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.create(req.body)
    return res.json({
        success: response ? true : false,
        createdCategory: response ? response : 'cannot create new product-category'
    })
})
//get all
const getCategories = asyncHandler(async (req, res) => {
    const response = await ProductCategory.find().select('title _id')
    return res.json({
        success: response ? true : false,
        prodCategories: response ? response : 'cannot get new product-category'
    })
})
//update
const updateCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.json({
        success: response ? true : false,
        updateCategory: response ? response : 'cannot updated new product-category'
    })
})
//delete
const deleteCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndDelete(pcid)
    return res.json({
        success: response ? true : false,
        deletedCategory: response ? response : 'cannot delete new product-category'
    })
})



module.exports = {
    createCategory,
    getCategories,
    deleteCategory,
    updateCategory
}