import { MongoClient } from "mongodb";


const handler = async () => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const collection = database.collection("robertabouts");
        const abouts = await collection.find({}, { projection: { _id: 1, title: 2, text: 3 } }).toArray();

        response = new Response(JSON.stringify({ abouts }), { status: 200 });

        console.log("abouts fetched %d", abouts.length);
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
    path: "/robert/abouts"
}