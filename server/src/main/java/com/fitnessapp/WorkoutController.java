package com.fitnessapp;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import static spark.Spark.port;
import static spark.Spark.post;

public class WorkoutController {

    private static MongoCollection<Document> workoutsCollection;

    public static void main(String[] args) {
        port(8080);
    }

    public static void init(MongoDatabase database) {

        workoutsCollection = database.getCollection("workouts");

        
        post("/workouts/start", (req, res) -> {
            Workout workout = new Workout("Push-up Session");  // Can be dynamically set
            return new Gson().toJson(workout);
        });

        post("/workouts/end", (req, res) -> {
            Gson gson = new Gson();
            WorkoutResult result = gson.fromJson(req.body(), WorkoutResult.class);

            saveWorkoutResult(result);

            return gson.toJson(new WorkoutResponse("Workout ended successfully"));
        });

        post("/workouts/next", (req, res) -> {
            Workout nextWorkout = new Workout("Squat Session");
            return new Gson().toJson(nextWorkout);
        });
    }

    private static void saveWorkoutResult(WorkoutResult result) {
        try {
            Document workoutDoc = new Document("email", result.email)
                    .append("duration", result.duration)
                    .append("caloriesBurned", result.caloriesBurned)
                    .append("timestamp", System.currentTimeMillis());
            workoutsCollection.insertOne(workoutDoc);
            System.out.println("Workout saved to database.");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to save workout to database.");
        }
    }

    private static class Workout {

        String name;

        Workout(String name) {
            this.name = name;
        }
    }

    private static class WorkoutResult {

        String email;
        int duration;
        double caloriesBurned;
    }

    private static class WorkoutResponse {

        String message;

        WorkoutResponse(String message) {
            this.message = message;
        }
    }
}
