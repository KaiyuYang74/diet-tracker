# Diet Tracker API Documentation

This document provides information about the RESTful API endpoints available in the Diet Tracker application.

## Table of Contents

-   [Authentication](#authentication)
-   [Users](#users)
-   [Foods](#foods)
-   [Goals](#goals)
-   [Meal Plans](#meal-plans)

## Authentication

### Register a new user

-   **URL**: `/api/auth/register`
-   **Method**: `POST`
-   **Request Body**: User object
    ```json
    {
        "username": "string",
        "password": "string",
        "email": "string"
    }
    ```
-   **Response**: JWT token as string
-   **Description**: Registers a new user and returns a JWT token for authentication.

### Login

-   **URL**: `/api/auth/login`
-   **Method**: `POST`
-   **Request Body**: User credentials
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```
-   **Response**: JWT token as string
-   **Description**: Authenticates a user and returns a JWT token.

## Users

### Get all users

-   **URL**: `/api/users`
-   **Method**: `GET`
-   **Response**: List of User objects
-   **Description**: Retrieves all users in the system.

### Get user by ID

-   **URL**: `/api/users/{id}`
-   **Method**: `GET`
-   **URL Parameters**: `id=[Long]` - User ID
-   **Response**: User object
-   **Description**: Retrieves a specific user by their ID.

### Get user by username

-   **URL**: `/api/users/username/{username}`
-   **Method**: `GET`
-   **URL Parameters**: `username=[String]` - Username
-   **Response**: User object
-   **Description**: Retrieves a specific user by their username.

### Get user by email

-   **URL**: `/api/users/email/{email}`
-   **Method**: `GET`
-   **URL Parameters**: `email=[String]` - Email address
-   **Response**: User object
-   **Description**: Retrieves a specific user by their email address.

### Create user

-   **URL**: `/api/users`
-   **Method**: `POST`
-   **Request Body**: User object
    ```json
    {
        "username": "string",
        "password": "string",
        "email": "string"
    }
    ```
-   **Response**: Created User object
-   **Description**: Creates a new user.

### Update user

-   **URL**: `/api/users/{id}`
-   **Method**: `PUT`
-   **URL Parameters**: `id=[Long]` - User ID
-   **Request Body**: Updated User object
    ```json
    {
        "username": "string",
        "password": "string",
        "email": "string"
    }
    ```
-   **Response**: Updated User object
-   **Description**: Updates an existing user.

### Delete user

-   **URL**: `/api/users/{id}`
-   **Method**: `DELETE`
-   **URL Parameters**: `id=[Long]` - User ID
-   **Response**: No content (HTTP 204)
-   **Description**: Deletes a user by their ID.

## Foods

### Get all foods

-   **URL**: `/api/foods/all`
-   **Method**: `GET`
-   **Response**: List of Food objects
-   **Description**: Retrieves all foods in the system.

### Get food by ID

-   **URL**: `/api/foods/{id}`
-   **Method**: `GET`
-   **URL Parameters**: `id=[Long]` - Food ID
-   **Response**: Food object
-   **Description**: Retrieves a specific food by its ID.

### Get foods by name

-   **URL**: `/api/foods/name/{name}`
-   **Method**: `GET`
-   **URL Parameters**: `name=[String]` - Food name
-   **Response**: List of Food objects
-   **Description**: Retrieves all foods matching the specified name.

### Create food

-   **URL**: `/api/foods`
-   **Method**: `POST`
-   **Request Body**: Food object
    ```json
    {
      "food": "string",
      "caloricValue": number,
      "protein": number,
      "carbohydrates": number,
      "fat": number
    }
    ```
-   **Response**: Created Food object
-   **Description**: Creates a new food item.

### Update food

-   **URL**: `/api/foods/{id}`
-   **Method**: `PUT`
-   **URL Parameters**: `id=[Long]` - Food ID
-   **Request Body**: Updated Food object
    ```json
    {
      "food": "string",
      "caloricValue": number,
      "protein": number,
      "carbohydrates": number,
      "fat": number
    }
    ```
-   **Response**: Updated Food object
-   **Description**: Updates an existing food item.

### Delete food

-   **URL**: `/api/foods/{id}`
-   **Method**: `DELETE`
-   **URL Parameters**: `id=[Long]` - Food ID
-   **Response**: No content
-   **Description**: Deletes a food item by its ID.

## Goals

### Get all goals

-   **URL**: `/api/goals`
-   **Method**: `GET`
-   **Response**: List of SetGoal objects
-   **Description**: Retrieves all diet goals in the system.

### Get goal by ID

-   **URL**: `/api/goals/{id}`
-   **Method**: `GET`
-   **URL Parameters**: `id=[Integer]` - Goal ID
-   **Response**: SetGoal object
-   **Description**: Retrieves a specific goal by its ID.

### Get goals by user ID

-   **URL**: `/api/goals/user/{userId}`
-   **Method**: `GET`
-   **URL Parameters**: `userId=[Integer]` - User ID
-   **Response**: List of SetGoal objects
-   **Description**: Retrieves all goals for a specific user.

### Create goal

-   **URL**: `/api/goals`
-   **Method**: `POST`
-   **Request Body**: SetGoal object
    ```json
    {
      "userID": number,
      "goalType": "string",
      "targetCalories": number,
      "targetProtein": number,
      "targetCarbohydrates": number,
      "targetFat": number
    }
    ```
-   **Response**: Created SetGoal object
-   **Description**: Creates a new diet goal.

### Update goal

-   **URL**: `/api/goals/{id}`
-   **Method**: `PUT`
-   **URL Parameters**: `id=[Integer]` - Goal ID
-   **Request Body**: Updated SetGoal object
    ```json
    {
      "userID": number,
      "goalType": "string",
      "targetCalories": number,
      "targetProtein": number,
      "targetCarbohydrates": number,
      "targetFat": number
    }
    ```
-   **Response**: Updated SetGoal object
-   **Description**: Updates an existing diet goal.

### Delete goal

-   **URL**: `/api/goals/{id}`
-   **Method**: `DELETE`
-   **URL Parameters**: `id=[Integer]` - Goal ID
-   **Response**: No content (HTTP 204)
-   **Description**: Deletes a diet goal by its ID.

## Meal Plans

### Get meal plan recommendation (GET method)

-   **URL**: `/api/recommend` or `/api/meal/recommend`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `weight=[double]` - User weight in kg
    -   `height=[double]` - User height in cm
    -   `age=[int]` - User age
    -   `type=[string]` - Diet type (options: "loss", "gain", "muscle"; defaults to "loss")
-   **Response**: Meal plan object
    ```json
    {
      "breakfast": ["string", "string", ...],
      "lunch": ["string", "string", ...],
      "dinner": ["string", "string", ...]
    }
    ```
-   **Description**: Generates a meal plan recommendation based on user parameters.

### Get meal plan recommendation (POST method)

-   **URL**: `/api/recommend` or `/api/meal/recommend`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "weight": number,
      "height": number,
      "age": number,
      "type": "string"  // options: "loss", "gain", "muscle"; defaults to "loss"
    }
    ```
-   **Response**: Meal plan object
    ```json
    {
      "breakfast": ["string", "string", ...],
      "lunch": ["string", "string", ...],
      "dinner": ["string", "string", ...]
    }
    ```
-   **Description**: Generates a meal plan recommendation based on user parameters.

### Test API

-   **URL**: `/api/recommend/test`
-   **Method**: `GET`
-   **Response**: String message
-   **Description**: Tests if the meal plan API is running correctly.
