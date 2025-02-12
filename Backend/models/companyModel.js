//Backend\models\companyModel.js
import mongoose from 'mongoose';

const companySchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        validate : {
            validator : (value) => {
                return /[a-zA-Z]/.test(value)
            },
            message : 'Invalid Name entry'
        } 
    },

    email : {
        type : String,
        required : true,
        unique : true,
        match : /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },

    phone : {
        type: Number,
        unique : true
    },

    role : {
        type : String,
        required : true,
        enum : ['Candidate' , 'Company']
    },

    password : {
        type : String,
        required : true,
    },

    isBlocked : {
        type : Boolean, 
        default : false 
    },

    verify : {
        type : Boolean , 
        default : false
    },

    location : String,

    headline : String,

    profileImage : {
        type : String,
        default : 'https://icons.veryicon.com/png/o/miscellaneous/zr_icon/company-23.png'
    },
    
    savedPosts : [{
        postId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'posts',
        },

        addedAt : {
            type : Date,
            default : Date.now,
        }
    }],

    followers : [{
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'users'
        },

        company : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'companies'
        }
    }],

    followingCompanies : [
        {
            company : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'companies'
            }
        }
    ],

    createdOn : {
        type : Date,
        default : Date.now
    },
});

const companyModel = mongoose.model('companies' , companySchema);

export default companyModel;