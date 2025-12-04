const mongoose = require('mongoose')
const validator = require('validator')

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name Is Required'],
        unique: true,
        minLength:[2,"Name must be 2 or more characters"],
        trim: true,
        validate: [validator.isAlphanumeric,"Name should only contain alphabets and numbers"]
    },
    description: String,
    duration: {
        type: Number,
        required: [true, 'duration is Required']
    },
    rating: {
        type: Number,
        default: 1.0,
        min:1,
        max:5
    },
    totalRating:{
        type: Number
    },
    releaseYear:{
        type: Number,
        required: [true, 'Release Year is Required']
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    createdBy:{
        type:String
    },
    genres:{
        type: [String],
        required: [true, 'Genre is Required'],
        enum:{
            values:["Action","Adventure","Animation","Comedy","Crime","Drama","Fantasy","Historical","Horror","Mystery","Romance","Sci-Fi","Thriller","Western","Documentary","Family","Musical","War","Sport"],
            message:"Genre does not exist"
        }
    },
    coverImage:{
        type: String,
        required: [true, 'Cover Image is Required']
    },
    actors: {
        type: [String],
        required:[true,'actor is Required']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

movieSchema.pre('save',function(next){
    this.createdBy = "AhmedGoda"
    next();
})

movieSchema.post('save',function(doc,next){
    console.log(doc)
    next()
})

movieSchema.pre('aggregate',function(next){
    console.log(this.pipeline())
    next();
})

movieSchema.virtual("durationInHours").get(function(){
    return this.duration /60;
})

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie