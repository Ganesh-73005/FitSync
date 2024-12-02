package com.fitnessapp;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.bson.Document;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;

import spark.Request;
import spark.Response;
import static spark.Spark.after;
import static spark.Spark.exception;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;

public class App {

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private static MongoCollection<Document> posts;
    private static MongoClient mongoClient;

    public static void main(String[] args) {
        port(8080);
    }

    public static void init(MongoDatabase database) {

        posts = database.getCollection("posts");

        if (!database.listCollectionNames().into(new ArrayList<>()).contains("posts")) {
            database.createCollection("posts");
            System.out.println("Collection 'posts' created.");
        }

        get("/posts", App::getPosts);
        post("/posts", App::createPost);
        post("/posts/:id/like", App::likePost);
        post("/posts/:id/comment", App::commentOnPost);

        after((req, res) -> res.type("application/json"));

        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.body(gson.toJson(new ErrorResponse("Internal server error: " + e.getMessage())));
        });
    }

    private static String getPosts(Request req, Response res) {
        List<Document> postList = posts.find().into(new ArrayList<>());
        return gson.toJson(postList);
    }

    private static String createPost(Request req, Response res) {
        Document requestBody = gson.fromJson(req.body(), Document.class);

        String id = requestBody.getString("id");
        String text = requestBody.getString("text");
        String mediaUrl = Optional.ofNullable(requestBody.getString("mediaUrl")).orElse("");
        String email = requestBody.getString("email");

        if (id == null || id.trim().isEmpty() || text == null || text.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            res.status(400);
            return gson.toJson(new ErrorResponse("ID, text, and email are required for creating a post."));
        }

        Document post = new Document("id", id)
                .append("text", text)
                .append("mediaUrl", mediaUrl)
                .append("email", email)
                .append("likes", new ArrayList<String>())
                .append("comments", new ArrayList<Document>());

        posts.insertOne(post);

        res.status(201);
        return gson.toJson(post);
    }

    private static String likePost(Request req, Response res) {
        String id = req.params(":id");
        Document requestBody = gson.fromJson(req.body(), Document.class);
        String email = requestBody.getString("email");

        if (email == null || email.trim().isEmpty()) {
            res.status(400);
            return gson.toJson(new ErrorResponse("Email is required for liking a post."));
        }

        Document post = posts.find(Filters.eq("id", id)).first();

        if (post != null) {
            List<String> likes = post.getList("likes", String.class);
            if (!likes.contains(email)) {
                likes.add(email);
                posts.updateOne(Filters.eq("id", id), Updates.set("likes", likes));
                post.put("likes", likes);
            }
            return gson.toJson(post);
        } else {
            res.status(404);
            return gson.toJson(new ErrorResponse("Post not found."));
        }
    }

    private static String commentOnPost(Request req, Response res) {
        String id = req.params(":id");
        Document requestBody = gson.fromJson(req.body(), Document.class);
        String commentText = requestBody.getString("text");
        String email = requestBody.getString("email");

        if (commentText == null || commentText.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            res.status(400);
            return gson.toJson(new ErrorResponse("Comment text and email are required."));
        }

        Document post = posts.find(Filters.eq("id", id)).first();

        if (post != null) {
            List<Document> comments = post.getList("comments", Document.class);
            Document comment = new Document("id", java.util.UUID.randomUUID().toString())
                    .append("text", commentText)
                    .append("email", email)
                    .append("timestamp", System.currentTimeMillis());
            comments.add(comment);
            posts.updateOne(Filters.eq("id", id), Updates.set("comments", comments));
            post.put("comments", comments);
            return gson.toJson(post);
        } else {
            res.status(404);
            return gson.toJson(new ErrorResponse("Post not found."));
        }
    }

    private static class ErrorResponse {

        private final String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
