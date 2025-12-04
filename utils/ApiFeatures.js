class ApiFeatures{
    constructor(query,req){
        this.query = query;
        this.req = req;
    }

    filter(){
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        let queryString = JSON.stringify(this.req.query);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`)
        const queryObj = JSON.parse(queryString)
        excludeFields.forEach(el => delete queryObj[el])
        this.query = this.query.find(queryObj)
        
        return this;
    }
    sort(){
        if (this.req.query.sort) {
            const sortBy = this.req.query.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        }
        else {
            if (this.req.sort) {
                this.query = this.query.sort(this.req.sort)
            }
            else {
                this.query = this.query.sort('-createdAt');
            }
        }
        return this;
    }

    limitFields(){
        if (this.req.query.fields) {
            const fields = this.req.query.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }
        else {
            this.query = this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        const page = this.req.query.page * 1 || 1
                const limit = this.req.limit || this.req.query.limit * 1 || 3;
                const skip = (page - 1) * limit
        
                this.query = this.query.skip(skip).limit(limit)
        
                // if (this.req.query.page) {
                //     const count = await Movie.countDocuments()
                //     if (skip >= count) {
                //         throw new Error("This Page Does Not Exist")
                //     }
                // }

            return this;
        }


}

module.exports = ApiFeatures