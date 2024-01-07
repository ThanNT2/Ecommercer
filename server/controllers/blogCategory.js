const blogCategory = require('../models/blogCategory')
const asyncHandler = require('express-async-handler')

//create
const createCategory = asyncHandler(async (req, res) => {
    const response = await blogCategory.create(req.body)
    return res.json({
        success: response ? true : false,
        createdCategory: response ? response : 'cannot create new blog-category'
    })
})
//get all
const getCategories = asyncHandler(async (req, res) => {
    const response = await blogCategory.find().select('title _id')
    return res.json({
        success: response ? true : false,
        blogCategories: response ? response : 'cannot get new blog-category'
    })
})
//update
const updateCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params
    const response = await blogCategory.findByIdAndUpdate(bcid, req.body, { new: true })
    return res.json({
        success: response ? true : false,
        updateCategory: response ? response : 'cannot updated new blog-category'
    })
})
//delete
const deleteCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params
    console.log("delete Category =", req.params)
    const response = await blogCategory.findByIdAndDelete(bcid)
    return res.json({
        success: response ? true : false,
        deleteCategory: response ? response : 'cannot delete new blog-category'
    })
})



module.exports = {
    createCategory,
    getCategories,
    deleteCategory,
    updateCategory
}