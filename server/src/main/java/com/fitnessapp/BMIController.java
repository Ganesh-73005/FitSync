package com.fitnessapp;

import java.time.LocalDateTime;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import static spark.Spark.port;
import static spark.Spark.post;

public class BMIController {

    private static MongoCollection<Document> bmiCollection;
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        port(8080);
    }

    public static void init(MongoDatabase database) {

        bmiCollection = database.getCollection("BMI");

        post("/bmi", (req, res) -> {

            BMIInput input = gson.fromJson(req.body(), BMIInput.class);

            if (!isValidInput(input)) {
                res.status(400);
                return "Invalid input";
            }

            // Calculate BMI
            double bmi = calculateBMI(input.weight, input.height);
            String category = getBMICategory(bmi);
            String recommendation = getRecommendation(bmi, input.age, input.gender);

            // Create result object
            BMIResult result = new BMIResult(bmi, category, recommendation);

            // Save to MongoDB
            Document document = new Document()
                    .append("user", input.user)
                    .append("weight", input.weight)
                    .append("height", input.height)
                    .append("age", input.age)
                    .append("gender", input.gender)
                    .append("bmi", bmi)
                    .append("category", category)
                    .append("timestamp", LocalDateTime.now().toString());

            bmiCollection.insertOne(document);

            // Return result as JSON
            return gson.toJson(result);

        });
    }

    private static boolean isValidInput(BMIInput input) {
        return input.weight > 0 && input.height > 0 && input.age > 0
                && (input.gender.equals("male") || input.gender.equals("female"));
    }

    // Calculate BMI using the formula: weight / (height in meters)^2
    private static double calculateBMI(double weight, double height) {
        return weight / Math.pow(height / 100, 2); // height is in cm, convert to meters
    }

    private static String getBMICategory(double bmi) {
        if (bmi < 18.5) {
            return "Underweight";
        }
        if (bmi < 25) {
            return "Normal Weight";
        }
        if (bmi < 30) {
            return "Overweight";
        }
        return "Obese";
    }

    private static String getRecommendation(double bmi, int age, String gender) {
        StringBuilder recommendation = new StringBuilder();

        if (bmi < 18.5) {
            recommendation.append("Consider increasing your caloric intake with nutrient-rich foods. ");
            if (age < 30) {
                recommendation.append("Focus on strength training to build muscle mass. ");
            }
        } else if (bmi < 25) {
            recommendation.append("Maintain your healthy lifestyle with regular exercise and balanced diet. ");
        } else if (bmi < 30) {
            recommendation.append("Consider reducing caloric intake and increasing physical activity. ");
            if (gender.equals("male")) {
                recommendation.append("Incorporate more cardio exercises. ");
            } else {
                recommendation.append("Include both cardio and strength training. ");
            }
        } else {
            recommendation.append("Consult with a healthcare provider for a personalized weight management plan. ");
            recommendation.append("Start with low-impact exercises and gradual dietary changes. ");
        }

        return recommendation.toString();
    }

    private static class BMIInput {

        double weight;
        double height;
        int age;
        String gender;
        String user;
    }

    private static class BMIResult {

        double bmi;
        String category;
        String recommendation;

        BMIResult(double bmi, String category, String recommendation) {
            this.bmi = bmi;
            this.category = category;
            this.recommendation = recommendation;
        }
    }
}
