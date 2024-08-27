const express = require("express")



const router = express.Router()





router.post("/", async(request,response)=> {
    console.log(`Request body`, JSON.stringify(request.body))
    
    const {name,population,country,latitude,longitude} = request.body


    

    const uploadCity = `INSERT INTO city (name,population,country,latitude,longitude)
    VALUES ('${name}', ${population},'${country}',${latitude}, ${longitude} ) ;`; 
    
    try {
    const dbResponse = await request.app.locals.dbObject.run(uploadCity) ;
    response.status(201).json({message:"City uploaded successfully", 
        cityDetails : {name,population,country,latitude,longitude}
    })
    }
    catch(error) {
        if (error){
            if (error.message.includes("UNIQUE constraint failed")) {
                return response.status(400).json({error :"City name should be unique"})
            }
            console.log("error in upload")
            response.status(500).json({error: error.message})
        }
        
    }


});


router.get("/", async (request, response) => {

    const {search,page = 1, limit = 10, projection = "*",filter} = request.query
   
    try {
        let filterCondition 
        if (filter) {
            const filterObject = JSON.parse(filter)
            const filterQuerries = Object.entries(filterObject).map(([key,value])=>`${key} = '${value}'`).join("AND")
            filterCondition = `where ${filterQuerries}`
        }

        let cities  
        let offset = (page-1) * limit 

        const handleProjection = projection==="*" ? "*" : projection.split(",").join(", ")
        console.log(handleProjection)

        let searchCondition = ""
        if (search) {

            searchCondition = `name like '%${search}%'`;
            filterCondition = filterCondition ? `${filterCondition} AND ${searchCondition}` : `WHERE ${searchCondition}`
            } 
            console.log(filterCondition)
            
            cities =  await request.app.locals.dbObject.all(`SELECT ${handleProjection}  FROM city 
                ${filterCondition}
                limit ${limit} offset ${offset}
                
                `) ;
            
        
        const getTotatlCount = search ? 
         `SELECT count(*) as totalCount FROM city WHERE name like '%{search}%' `
         : 
         `SELECT count(*) as totalCount FROM city `

         const totalCount = await request.app.locals.dbObject.get(getTotatlCount) 
         totalPages = Math.floor(totalCount.totalCount/limit)
         totalPages === 0 ? 1 : totalPages
         console.log(totalPages)
        
        console.log(totalCount)
        response.json({
            data:cities , 
            page:parseInt(page), 
            limit :parseInt(limit), 
            totalCount, 
            totalPages 

        });
        
       
        



    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});


router.delete ("/:name", async(request,response) => {
    const {name} = request.params
    console.log(null)
    const deltedQueery = `DELETE FROM city where name = ${name}` 
    await request.app.locals.dbObject.run(deltedQueery)
    console.log("City deleted successfully")
} );



router.put("/:name" , async(request,response)=> {
    const {population,country,latitude,longitude} = request.body 
    const {name} = request.params
    const updateCityDetails = `Update city  
                SET 
                   population =${population}, 
                    country = '${country}', 
                    latitude  = ${latitude}, 
                    longitude = ${longitude}

                where name = '${name}';

                   `; 
            await request.app.locals.dbObject.run(updateCityDetails)
            response.send("details have been upadated")
})


module.exports = router



 