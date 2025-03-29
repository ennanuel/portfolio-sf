import { MongoClient } from "mongodb";


const handler = async () => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const collection = database.collection("robertprofilepictures");
        const profilePicture = await collection.findOne({}, { projection: { _id: 1, image: { publicUrl: 2 } } });

        response = new Response(JSON.stringify({ profilePicture }), { status: 200 });

        console.log("profile picture fetched");
    } catch (error) {
        console.error(error);
        response = new Response(JSON.stringify({ message: error.message }), { status: 500 });
    } finally {
        await client.close();

        response.headers.append('Access-Control-Allow-Origin', process.env.ROBERT_FRONTEND_URI);
        return response;
    }
}

export default handler 

export const config = {
    path: "/robert/profile-picture"
}