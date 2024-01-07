const { json, response } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot create new Product'
    })
})

//get detail Product
const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get Product'
    })
})
//get all Product
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    // //tach cac truong dac biet ra khoi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    // //xoa cac truong ko thuoc excludeFields
    excludeFields.forEach(el => delete queries[el])

    // //format lai cac operato dung mongo
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, macthedEl => `$${macthedEl}`)
    const formatedQeries = JSON.parse(queryString)

    // //Filtering
    if (queries?.title) formatedQeries.title = { $regex: queries.title, $options: 'i' }
    let queryCommand = Product.find(formatedQeries) // o trang thai cho, doi khi nao co kq

    //sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    // fields limiting 
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    // pagination
    // limit: so object lay ve 1 lan goi api
    // skip: 2 eg 1, 2, 3... 19 thi bo qua 1,2 lay sau 3..10
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCT
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)


    // //Executy query
    // // so luong sp thoa man dieu kien khac so luong sp tra ve 1 lan goi API
    queryCommand.exec(async (err, response) => {
        if (err) throw new Error(err.message)
        const counts = await Product.find(formatedQeries).countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : 'Cannot get Products',

        })
    })
})
//get all Product chua them tim kiem
// const getProducts = asyncHandler(async (req, res) => {
//     const products = await Product.find()
//     return res.status(200).json({
//         success: products ? true : false,
//         productDatas: products ? products : 'Cannot get Products'
//     })
// })
//Update Product
const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update Product'
    })
})
//delete Product
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        DeletedProduct: deletedProduct ? deletedProduct : 'Cannot update Product'
    })
})

//rating
const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid } = req.body
    if (!star || !pid) throw new Error('Missing inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    // console.log(alreadyRating)
    if (alreadyRating) {
        console.log("dkm sua rating 1")
        // update star & comment
        await Product.updateOne({
            ratings: { $elemMatch: alreadyRating }
        }, {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment }
        }, { new: true })
    } else {
        console.log("dkm sua rating 2")
        // danh gia lan dau tien
        await Product.findByIdAndUpdate(pid, {
            $push: { ratings: { star, comment, postedBy: _id } }
        }, { new: true })
    }
    //sum ratings
    const updatedProduct = await Product.findById(pid)

    const ratingCount = updatedProduct.ratings.length
    const sumratins = updatedProduct.ratings.reduce((sum, el) => sum + +el.star, 0)
    updatedProduct.totalRatings = Math.round(sumratins * 10 / ratingCount) / 10
    await updatedProduct.save()


    return res.status(200).json({
        status: true,
        updatedProduct
    })
})

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings
}