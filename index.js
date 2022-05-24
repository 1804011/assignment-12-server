console.clear();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
//middleware
app.use(express.json());
app.use(cors());

//database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g5amp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
async function run() {
	try {
		await client.connect();
		app.get("/parts", async (req, res) => {
			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection.find().toArray();

			res.send(result);
		});
		app.get("/parts/:id", async (req, res) => {
			const { id } = req?.params;
			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection.findOne({
				_id: ObjectId(id),
			});

			res.send(result);
		});
	} finally {
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("welcome to server");
});
app.listen(port, () => {
	console.log("listening to", port);
});
