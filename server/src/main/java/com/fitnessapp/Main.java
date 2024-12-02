package com.fitnessapp;

import java.io.FileInputStream;
import java.io.IOException;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import static spark.Spark.ipAddress;
import static spark.Spark.port;

public class Main {

    public static void main(String[] args) throws IOException {
        ipAddress("0.0.0.0");
        port(8080);

        FileInputStream serviceAccount = new FileInputStream("src/main/resources/google-services.json");
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        FirebaseApp.initializeApp(options);

        MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017/");
        MongoDatabase database = mongoClient.getDatabase("fitnessApp");

        AuthController.init();
        BMIController.init(database);

        WaterReminderController.init(database);
        FoodChartController.init(database);
        WorkoutController.init(database);

        App.init(database);
    }
}
