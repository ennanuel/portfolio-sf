import { MongoClient } from "mongodb";


const handler = async () => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const collection = database.collection("ezemasocials");
        const socials = await collection.find({ platform: { $ne: "Email" } }, { projections: { _id: 1, platform: 2, url_link: 3 } }).toArray();

        response = new Response(JSON.stringify({ socials }), { status: 200 });

        console.log("socials fetched %d", socials.length);
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
    path: "/ezema/socials"
}