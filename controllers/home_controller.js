// Check if an admin user with the specified username already exists
const Admin =require('../models/Admin');
const Subscriber = require('../models/Subscriber');
const Api = require('../models/Api');

module.exports.home = async(req,res)=>{
    await checkAdmin();
    return res.status(200).render('home');
}

module.exports.createSession= (req,res)=>{

    if(req.isAuthenticated()){
    return res.redirect('/dashboard');
    }
    return res.redirect('/error')
}

module.exports.dashboard = async(req,res)=>{
    try{
        const subscribers = await Subscriber.find();
        return res.render('dashboard',{
            subscribers
        })

    }
    catch(err){
        console.error('error',err);
    }

}




// for deleting a subscriber
module.exports.deleteSubscriber = async(req,res)=>{
    const subscriber = await Subscriber.findByIdAndDelete(req.query.id);
    return res.json({
        id: req.query.id
    })
}

// for logout
module.exports.logout= (req,res)=>{
    
    if(req.admin){
        req.logout();
    }
    return res.redirect('/');
}


// /add-admin
module.exports.adminForm = (req,res)=>{
    return res.render('adminform');
}


module.exports.createAdmin= async(req,res)=>{
    const admin = await Admin.findById(req.user.id);
    if(admin.password == req.body.password){
        const isAdminPresent = await Admin.findOne({email:req.body.email});
        if(!isAdminPresent){
            const newAdmin = await Admin.create({
                email:req.body.email,
                name:req.body.name,
                isAdmin:true
            })
        }

    }
    else{
        return res.redirect('/error');
    }
    return res.redirect('/dashboard')

}



module.exports.api = async(req,res)=>{
    let apis = await Api.find();
    console.log(apis)
    return res.render('updateApi',{
        apis
    })
}



async function checkAdmin(){
    const isAdminPresent = await Admin.findOne({email:process.env.ADMIN_EMAIL});
    if(isAdminPresent){
        return ;
    }
    await Admin.create({
        email:process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        isAdmin:true,
        name:'Prashant'
    });
}