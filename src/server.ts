import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
	// Init the Express application
	const app = express();

	// Set the network port
	const port = process.env.PORT || 8082;

	// Use the body parser middleware for post requests
	app.use(bodyParser.json());

	// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
	// GET /filteredimage?image_url={{URL}}
	// endpoint to filter an image from a public url.
	// IT SHOULD
	//    1
	//    1. validate the image_url query
	//    2. call filterImageFromURL(image_url) to filter the image
	//    3. send the resulting file in the response
	//    4. deletes any files on the server on finish of the response
	// QUERY PARAMATERS
	//    image_url: URL of a publicly accessible image
	// RETURNS
	//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

	/**************************************************************************** */
	app.get("/filteredimage", async (req: Request, res: Response) => {
		const validateImageUrl = (url: string) => {
			const expression =
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
			const regex = new RegExp(expression);

			return url.match(regex);
		};

		const { image_url } = req.query;

		if (
			!image_url ||
			typeof image_url !== "string" ||
			!validateImageUrl(image_url.toString())
		) {
			return res.status(400).json({
				statusCode: 400,
				message: "image_url param is missed or invalid",
			});
		}

		try {
			const imagePath = await filterImageFromURL(image_url);

			res.status(200).sendFile(imagePath, () => deleteLocalFiles([imagePath]));
		} catch (error: any) {
			return res.status(400).json({
				statusCode: 400,
				message: error.message,
			});
		}
	});
	//! END @TODO1

	// Root Endpoint
	// Displays a simple message to the user
	app.get("/", async (req, res) => {
		res.send("try GET /filteredimage?image_url={{}}");
	});

	// Start the Server
	app.listen(port, () => {
		console.log(`server running http://localhost:${port}`);
		console.log(`press CTRL+C to stop server`);
	});
})();
