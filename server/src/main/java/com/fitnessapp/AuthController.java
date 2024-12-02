package com.fitnessapp;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.gson.Gson;

import spark.Request;
import spark.Response;
import static spark.Spark.post;

public class AuthController {

    private static final Gson gson = new Gson();

    public static void init() {
        post("/signup", AuthController::signUp);
        post("/signin", AuthController::signIn);
        post("/signout", AuthController::signOut);
    }

    private static Object signUp(Request req, Response res) {
        try {
            UserCredentials credentials = gson.fromJson(req.body(), UserCredentials.class);
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(credentials.email)
                    .setPassword(credentials.password);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            res.status(200);
            return gson.toJson(new AuthResponse(userRecord.getUid(), userRecord.getEmail(), true));
        } catch (FirebaseAuthException e) {
            res.status(400);
            return gson.toJson(new ErrorResponse(e.getMessage()));
        }
    }

    private static Object signIn(Request req, Response res) {
        try {
            UserCredentials credentials = gson.fromJson(req.body(), UserCredentials.class);
            String uid = FirebaseAuth.getInstance().getUserByEmail(credentials.email).getUid();
            res.status(200);
            Boolean success = true;
            return gson.toJson(new AuthResponse(uid, credentials.email, success));
        } catch (FirebaseAuthException e) {
            res.status(400);
            return gson.toJson(new ErrorResponse("Invalid email or password"));
        }
    }

    private static Object signOut(Request req, Response res) {
        // Firebase doesn't have a server-side sign-out mechanism
        // Client-side sign-out is sufficient
        res.status(200);
        return gson.toJson(new SuccessResponse("Signed out successfully"));
    }

    private static class UserCredentials {

        String email;
        String password;
    }

    private static class AuthResponse {

        String uid;
        String email;
        Boolean success;

        AuthResponse(String uid, String email, Boolean success) {
            this.uid = uid;
            this.email = email;
            this.success = success;
        }
    }

    private static class ErrorResponse {

        String error;

        ErrorResponse(String error) {
            this.error = error;
        }
    }

    private static class SuccessResponse {

        String message;

        SuccessResponse(String message) {
            this.message = message;
        }
    }
}
