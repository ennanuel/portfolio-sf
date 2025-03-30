import { MongoClient } from "mongodb";


const getRequestQuery = (url, field) => new URL(url).searchParams.get(field);

const convertQueryToNumber = (str, fallback) => {
    if(!(str >= 0 && str !== undefined && str !== null)) return fallback;
    return Number(str);
}

const handler = async (req, context) => {
    let response;
    const client = new MongoClient(process.env.MONGODB_URI);

    const artworkId = context.params.artwork_id;
    const limitQuery = getRequestQuery(req.url, 'limit');
    const pageQuery = getRequestQuery(req.url, 'page');

    try {
        const limit = convertQueryToNumber(limitQuery, 6);
        const page = convertQueryToNumber(pageQuery, 0);
        const skip = limit * page;

        const database = client.db("projects");

        const artworkCollection = database.collection("robertartworks");
        const artworkImageCollection = database.collection("robertartworkimages");
        const artworkCategoryCollection = database.collection("robertcategories");

        const artwork = await artworkCollection.findOne({ _id: artworkId });

        const query = {
            _id: { $ne: artworkId },
            categories: !artwork.categories.length ? { $size: 0 } : { $in: artwork.categories }
        };

        const artworks = await artworkCollection.find(query, { limit, skip, projection: { _id: 1, title: 2, categories: 3, images: 4 }}).toArray();
        const artworksCount = await artworkCollection.countDocuments(query);
        const artworkImageIds = artworks.reduce((imageIds, artwork) => [...imageIds, ...artwork.images], []);
        const artworkCategoryIds = artworks.reduce((categoryIds, artwork) => [...categoryIds, ...artwork.categories.slice(0, 3)], []);

        const artworkImagesArray = await artworkImageCollection.find({ _id: { $in: artworkImageIds } }, { projection: { _id: 1, image: { publicUrl: 2 } } }).toArray();
        const artworkImages = artworkImagesArray.reduce((images, artworkImage) => ({ ...images, [artworkImage._id]: { ...artworkImage } }), {});

        const artworkCategoriesArray = await artworkCategoryCollection.find({ _id: { $in: artworkCategoryIds } }, { projection: { _id: 1, name: 2 } }).toArray();
        const artworkCategories = artworkCategoriesArray.reduce((categories, artworkCategory) => ({ ...categories, [artworkCategory._id]: { ...artworkCategory } }), {});

        const expandedArtworks = artworks.map((artwork) => ({ 
            ...artwork, 
            images: artwork.images.map((imageId) => artworkImages[imageId]),
            categories: `${artwork.categories.slice(0, 3).map((categoryId) => artworkCategories[categoryId]?.name).join(', ')}${artwork.categories?.length > 3 ? '...' : ''}`
        }));

        response = new Response(JSON.stringify({ 
            limit, 
            page, 
            total: artworksCount,
            artworks: expandedArtworks, 
        }), { status: 200 });

        console.log("related artworks fetched %d", artworks.length);
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
    path: "/robert/artworks/related/:artwork_id"
}