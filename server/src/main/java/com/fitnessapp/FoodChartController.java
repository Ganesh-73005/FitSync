package com.fitnessapp;

import java.util.ArrayList;
import java.util.List;

import org.bson.Document;

import com.google.gson.Gson;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import spark.Request;
import spark.Response;
import static spark.Spark.get;
import static spark.Spark.port;

public class FoodChartController {

    private static MongoCollection<Document> foodCollection;
    private static MongoClient mongoClient;

    public static void main(String[] args) {
        port(8080);
    }

    public static void init(MongoDatabase database) {

        get("/food-chart", FoodChartController::show);

        foodCollection = database.getCollection("foodchart");
    }

    public static Object show(Request req, Response res) {
        res.status(200);
        res.type("application/json");
        List<FoodItem> foodChart = getFoodChart();
        return new Gson().toJson(foodChart);

    }

    private static List<FoodItem> getFoodChart() {
        List<FoodItem> foodChart = new ArrayList<>();

        for (Document doc : foodCollection.find()) {
            String bmiRange = doc.getString("BMI Range");
            String bmiCategory = doc.getString("BMI Category");
            String mealType = doc.getString("Meal Type");
            String foodsList = doc.getString("Foods List");
            int caloriesPerServing = doc.getInteger("Calories per Serving");
            String nutritionInfo = doc.getString("Nutrition Information");
            int proteinContent = doc.getInteger("Protein Content (g)");
            int monthsToFollow = doc.getInteger("Months to Follow");

            FoodItem foodItem = new FoodItem(bmiRange, bmiCategory, mealType, foodsList,
                    caloriesPerServing, nutritionInfo, proteinContent, monthsToFollow);

            foodChart.add(foodItem);
        }

        return foodChart;
    }

    private static class FoodItem {

        String bmiRange;
        String bmiCategory;
        String mealType;
        String foodsList;
        String nutritionInfo;
        int caloriesPerServing;
        int proteinContent;
        int monthsToFollow;

        FoodItem(String bmiRange, String bmiCategory, String mealType, String foodsList,
                int caloriesPerServing, String nutritionInfo, int proteinContent, int monthsToFollow) {
            this.bmiRange = bmiRange;
            this.bmiCategory = bmiCategory;
            this.mealType = mealType;
            this.foodsList = foodsList;
            this.caloriesPerServing = caloriesPerServing;
            this.nutritionInfo = nutritionInfo;
            this.proteinContent = proteinContent;
            this.monthsToFollow = monthsToFollow;
        }
    }
}
