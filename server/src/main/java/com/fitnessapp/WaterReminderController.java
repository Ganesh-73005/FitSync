package com.fitnessapp;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import static com.mongodb.client.model.Filters.eq;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;

public class WaterReminderController {

    public static void main(String[] args) {
        port(8080);
    }
    private static MongoCollection<Document> waterCollection;

    public static void init(MongoDatabase database) {

        waterCollection = database.getCollection("waterIntakes");

        post("/water", (req, res) -> {
            Gson gson = new Gson();
            WaterInput input = gson.fromJson(req.body(), WaterInput.class);

            Document userRecord = waterCollection.find(eq("email", input.email)).first();
            int waterLevel = (userRecord != null) ? userRecord.getInteger("waterLevel", 0) : 0;
            waterLevel += input.amount;

            if (userRecord != null) {

                waterCollection.updateOne(
                        eq("email", input.email),
                        new Document("$set", new Document("waterLevel", waterLevel).append("timestamp", System.currentTimeMillis()))
                );
            } else {

                Document newRecord = new Document("email", input.email)
                        .append("waterLevel", waterLevel)
                        .append("timestamp", System.currentTimeMillis());
                waterCollection.insertOne(newRecord);
            }

            return gson.toJson(new WaterResult(waterLevel));
        });

        get("/water", (req, res) -> {
            String email = req.queryParams("email");
            Document userRecord = waterCollection.find(eq("email", email)).first();
            int waterLevel = (userRecord != null) ? userRecord.getInteger("waterLevel", 0) : 0;

            return new Gson().toJson(new WaterResult(waterLevel));
        });

        post("/water/reset", (req, res) -> {
            Gson gson = new Gson();
            WaterInput input = gson.fromJson(req.body(), WaterInput.class);

            if (waterCollection.find(eq("email", input.email)).first() != null) {

                waterCollection.updateOne(
                        eq("email", input.email),
                        new Document("$set", new Document("waterLevel", 0).append("timestamp", System.currentTimeMillis()))
                );
            } else {
                Document resetRecord = new Document("email", input.email)
                        .append("waterLevel", 0)
                        .append("timestamp", System.currentTimeMillis());
                waterCollection.insertOne(resetRecord);
            }

            return gson.toJson(new WaterResult(0));
        });
    }

    private static class WaterInput {

        String email;
        int amount;
    }

    private static class WaterResult {

        int waterLevel;

        WaterResult(int waterLevel) {
            this.waterLevel = waterLevel;
        }
    }
}
