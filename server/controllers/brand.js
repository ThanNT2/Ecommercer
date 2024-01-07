const Brand = require('../models/brand')
const asyncHandler = require('express-async-handler')

//create
const createBrand = asyncHandler(async (req, res) => {
    const response = await Brand.create(req.body)
    return res.json({
        success: response ? true : false,
        createdBrand: response ? response : 'cannot create new Brand'
    })
})
//get all
const getBrand = asyncHandler(async (req, res) => {
    const response = await Brand.find()
    return res.json({
        success: response ? true : false,
        brands: response ? response : 'cannot get new brand'
    })
})
//update
const updateBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Brand.findByIdAndUpdate(bid, req.body, { new: true })
    return res.json({
        success: response ? true : false,
        updatedBrand: response ? response : 'cannot updated new Brand'
    })
})
//delete
const deleteBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params
    console.log("delete Category =", req.params)
    const response = await Brand.findByIdAndDelete(bid)
    return res.json({
        success: response ? true : false,
        deleteBrand: response ? response : 'cannot delete new Brand'
    })
})



module.exports = {
    createBrand,
    getBrand,
    deleteBrand,
    updateBrand
}