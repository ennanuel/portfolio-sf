import { MongoClient } from "mongodb";


const handler = async () => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const collection = database.collection("ezematestimonials");
        const testimonials = await collection.find({}, { projection: { _id: 1, verdict: 2, services: 3, client_name: 4, client_role: 5, client_company: 6, client_image: { _id: 5, image: { publicUrl: 7 } } } }).toArray();

        response = new Response(JSON.stringify({ testimonials }), { status: 200 });

        console.log("projects fetched %d", testimonials.length);
    } catch (error) {
        console.error(error);
        response = new Response(JSON.stringify({ message: error.message }), { status: 500 });
    } finally {
        await client.close();

        console.log(process.env);

        response.headers.append('Access-Control-Allow-Origin', process.env.EZEMA_FRONTEND_URI);
        return response;
    }
}

export default handler 

export const config = {
    path: "/ezema/testimonials"
}