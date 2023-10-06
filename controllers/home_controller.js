// Check if an admin user with the specified username already exists
const Admin =require('../models/Admin');


module.exports.home = async(req,res)=>{
    
    await checkAdmin();
    return res.render('home');
}

 async function checkAdmin(){
    const isAdminPresent = await Admin.findOne({email:process.env.ADMIN_EMAIL});
    if(isAdminPresent){
        return ;
    }
    await Admin.create({
        email:process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    });

}