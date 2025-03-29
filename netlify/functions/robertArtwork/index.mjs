import { MongoClient } from "mongodb";


const handler = async (req, context) => {
    let response;
    const { artwork_id } = context.params;
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const database = client.db("projects");

        const artworkCollection = database.collection("robertartworks");
        const artworkImageCollection = database.collection("robertartworkimages");
        const artworkCategoryCollection = database.collection("robertcategories");

        const artwork = await artworkCollection.findOne({ _id: artwork_id }, { projection: { _id: 1, title: 2, desc: 3, name: 4, role: 5, platform: 6, url_link: 7, createdAt: 8, categories: 9, images: 10 }});

        const artworkImagesArray = await artworkImageCollection.find({ _id: { $in: artwork.images } }, { projection: { _id: 1, image: { publicUrl: 2 } } }).toArray();
        const artworkImages = artworkImagesArray.reduce((images, artworkImage) => ({ ...images, [artworkImage._id]: { ...artworkImage } }), {});

        const artworkCategoriesArray = await artworkCategoryCollection.find({ _id: { $in: artwork.categories } }, { projection: { _id: 1, name: 2 } }).toArray();
        const artworkCategories = artworkCategoriesArray.reduce((categories, artworkCategory) => ({ ...categories, [artworkCategory._id]: { ...artworkCategory } }), {});

        const expandedArtwork = { 
            ...artwork, 
            images: artwork.images.map((imageId) => artworkImages[imageId]),
            categories: artwork.categories.map((categoryId) => artworkCategories[categoryId])
        };

        response = new Response(JSON.stringify({ artwork: expandedArtwork }), { status: 200 });

        console.log("artwork fetched");
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
    path: "/robert/artwork/:artwork_id"
}