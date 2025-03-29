import { MongoClient } from "mongodb";


const handler = async () => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const collection = database.collection("ezemaprojects");
        const projects = await collection.find({}, { projection: { _id: 10, title: 1, desc: 2, demo_url: 3, code_url: 4, category: 5, tags: 6, image_url: 7, video_url: 8, createdAt: 9 } }).toArray();

        response = new Response(JSON.stringify({ projects }), { status: 200 });

        console.log("projects fetched %d", projects.length);
    } catch (error) {
        console.error(error);
        response = new Response(JSON.stringify({ message: error.message }), { status: 500 });
    } finally {
        await client.close();
        
        response.headers.append('Access-Control-Allow-Origin', process.env.EZEMA_FRONTEND_URI);
        return response;
    }
}

export default handler 

export const config = {
    path: "/ezema/projects"
}