console.clear();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
//middleware
app.use(express.json());
app.use(cors());
const verifyAdmin = async (req, res, next) => {
	const { email } = req?.headers;
	console.log(email);
	if (email) {
		const usersCollection = client.db("assignment-12").collection("users");
		const result = await usersCollection.findOne({ email });
		if (result?.role === "admin") {
			next();
		} else {
			res.status(401).send({ message: "unauthorized access" });
		}
	} else {
		res.status(401).send({ message: "unauthorized access" });
	}
};
app.use("/admin", verifyAdmin);
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
		app.post("/parts", async (req, res) => {
			// console.log(req?.body);

			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection.insertOne(req?.body);
			console.log(result);
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
		app.post("/orders", async (req, res) => {
			const order = req?.body;
			const ordersCollection = client.db("assignment-12").collection("orders");

			const result = await ordersCollection.insertOne(order);
			res.send(result);
		});
		app.get("/orders/:email", async (req, res) => {
			const { email } = req?.params;
			const ordersCollection = client.db("assignment-12").collection("orders");
			const result = await ordersCollection.find({ email }).toArray();
			res.send(result);
		});

		app.delete("/orders/:id", async (req, res) => {
			const { id } = req?.params;
			const ordersCollection = client.db("assignment-12").collection("orders");
			const result = await ordersCollection.deleteOne({
				_id: ObjectId(id),
			});

			res.send(result);
		});
		app.post("/reviews", async (req, res) => {
			const review = req?.body;

			const reviewsCollection = client
				.db("assignment-12")
				.collection("reviews");
			const result = await reviewsCollection.insertOne(review);

			res.send(result);
		});
		app.get("/reviews", async (req, res) => {
			const reviewsCollection = client
				.db("assignment-12")
				.collection("reviews");
			const result = await reviewsCollection.find({}).toArray();

			res.send(result);
		});
		app.post("/users", async (req, res) => {
			const usersCollection = client.db("assignment-12").collection("users");
			const result = await usersCollection.insertOne(req?.body);

			res.send(result);
		});
		app.get("/users/:email", async (req, res) => {
			const { email } = req?.params;
			const usersCollection = client.db("assignment-12").collection("users");
			const result = await usersCollection.findOne({ email });
			console.log(result);
			res.send(result);
		});
		app.put("/users/:email", async (req, res) => {
			const { email } = req?.params;
			const profile = req?.body;
			const { name, location, social, institution, phone } = profile;
			const usersCollection = client.db("assignment-12").collection("users");
			const updateDoc = {
				$set: {
					name,
					location,
					social,
					institution,
					phone,
				},
			};
			const result = await usersCollection.updateOne({ email }, updateDoc);
			console.log(result);
			res.send(result);
		});
		app.post("/login", async (req, res) => {
			const data = req?.body;
			const token = jwt.sign(data, process.env.ACCESS_TOKEN);
			res.send({ token });
		});
		app.get("/users", async (req, res) => {
			const usersCollection = client.db("assignment-12").collection("users");
			const result = await usersCollection.find().toArray();
			console.log(result);
			res.send(result);
		});
		app.put("/admin/:email", async (req, res) => {
			const { email } = req?.params;
			const usersCollection = client.db("assignment-12").collection("users");
			const updateDoc = {
				$set: {
					role: "admin",
				},
			};
			const result = await usersCollection.updateOne({ email }, updateDoc);
			console.log(result);
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
