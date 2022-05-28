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
const verifyJwt = (req, res, next) => {
	const email = req?.headers?.authorization;
	if (!email) {
		res.status(401).send({ message: "unauthorized access" });
	}

	const token = email?.split(" ")[1];
	// console.log(token);

	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		if (err) {
			res.send(403).status({ message: "forbidden access" });
		}
		req.decoded = decoded;
		next();
	});
};
const verifyAdmin = async (req, res, next) => {
	const { email } = req?.headers;
	//console.log(email);
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
			const { limit } = req?.query;

			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection
				.find()
				.limit(parseInt(limit))
				.toArray();
			// console.log(result);
			res.send(result);
		});
		app.post("/parts", async (req, res) => {
			// //console.log(req?.body);

			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection.insertOne(req?.body);
			//console.log(result);
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
		app.put("/parts/:id", async (req, res) => {
			const { id } = req?.params;
			//console.log(req?.body?.orderQuantity);
			const partsCollection = client.db("assignment-12").collection("parts");
			const part = await partsCollection.findOne({ _id: ObjectId(id) });
			const stock = part?.stock;
			const updateDoc = {
				$set: {
					stock: stock - parseInt(req?.body?.orderQuantity) || 0,
				},
			};
			const result = await partsCollection.updateOne(
				{ _id: ObjectId(id) },
				updateDoc
			);
			//console.log(result);
			res.send(result);
		});
		app.post("/orders", async (req, res) => {
			const order = req?.body;
			const ordersCollection = client.db("assignment-12").collection("orders");

			const result = await ordersCollection.insertOne(order);
			res.send(result);
		});
		app.get("/orders/:email", verifyJwt, async (req, res) => {
			const { email } = req?.params;
			if (req?.decoded?.email != email) {
				res.status(403).send({ message: "forbidden access" });
			}
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
		app.put("/users", async (req, res) => {
			//console.log(req?.body);
			const usersCollection = client.db("assignment-12").collection("users");
			const filter = { email: req.body?.email };
			const option = { upsert: true };
			const updateDoc = {
				$set: {
					email: req?.body?.email,
					name: req?.body?.name,
				},
			};
			const result = await usersCollection.updateOne(filter, updateDoc, option);
			//console.log(result);
			res.send(result);
		});
		app.get("/users/:email", verifyJwt, async (req, res) => {
			const { email } = req?.params;
			if (req?.decoded?.email != email) {
				res.status(403).send({ message: "forbidden access" });
			}
			const usersCollection = client.db("assignment-12").collection("users");
			const result = await usersCollection.findOne({ email });

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
			res.send(result);
		});
		app.post("/login", async (req, res) => {
			const data = req?.body;
			console.log(data);
			const token = jwt.sign(data, process.env.ACCESS_TOKEN);
			res.send({ token });
		});
		app.get("/users", async (req, res) => {
			const usersCollection = client.db("assignment-12").collection("users");
			const result = await usersCollection.find().toArray();
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
			res.send(result);
		});
		app.delete("/parts/:id", async (req, res) => {
			const { id } = req?.params;
			const partsCollection = client.db("assignment-12").collection("parts");
			const result = await partsCollection.deleteOne({ _id: ObjectId(id) });

			res.send(result);
		});
	} finally {
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("welcome to assignment-12 server");
});
app.listen(port, () => {
	console.log("listening to", port);
});
