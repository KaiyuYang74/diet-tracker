# Diet Tracker Application

A Java Spring Boot web application for tracking user diets and providing intelligent meal recommendations based on nutritional goals.

## Features

-   Track daily food intake
-   Set nutritional goals and calorie targets
-   Get AI-powered meal recommendations
-   Monitor progress over time
-   Personalized feedback and suggestions

## Meal Recommendation Algorithm

The application utilizes a sophisticated two-stage optimization algorithm to recommend balanced meals.

### Algorithm Flow

```
┌─────────────────────┐
│ Database Read &     │
│ Food Classification │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐     ┌───────────────────────┐
│  Stage 1: Calorie   │     │ Nutrition Targets:    │
│  Optimization       │     │ - Protein: 30%        │
│                     │     │ - Carbs: 20%          │
│ ┌─────────────────┐ │     │ - Fat: 50%            │
│ │ Build Simplified│ │     └───────────────────────┘
│ │ LP Problem      │ │
│ └────────┬────────┘ │
│          │          │
│          v          │
│ ┌─────────────────┐ │
│ │Find 3 Calorie   │ │
│ │Feasible Solution│ │
│ └────────┬────────┘ │
└──────────┬──────────┘
           │
           v                 Fallback Path
┌─────────────────────┐     ┌───────────────────────┐
│ Stage 2: Nutrient   │     │ Fallback Strategy:    │
│ Optimization        │     │ 1. Hard no-repeat     │
│                     │     │ 2. Soft repeat penalty│
│ ┌─────────────────┐ │     │ 3. Allow repeats      │
│ │Optimize Nutrient│ │     └──────────┬────────────┘
│ │Ratios Based on  │ │                │
│ │Baseline Solution│ │                │
│ └────────┬────────┘ │                │
│          │          │                │
│          v          │                │
│ ┌─────────────────┐ │                │
│ │Generate Final   │ │                │
│ │Candidate Plans  │ │                │
│ └────────┬────────┘ │                │
└──────────┬──────────┘                │
           │                           │
           │<───────────────────────────
           │
           v
┌─────────────────────┐
│ Randomly Select     │
│ One Final Plan      │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ Return Three-Meal   │
│ Recommendation      │
└─────────────────────┘
```

### AOP-Based Diet Recommendation UML

```
┌─────────────────────┐
│RecommendationService│  <-- Core diet recommendation interface
└──────────┬──────────┘
           │
           │ implements
           v
┌─────────────────────┐         ┌────────────────┐
│RecommendServiceImpl │         │  <<Aspect>>    │
│                     │<--------│ DietGoalAspect │  <-- Handles nutrition ratios for different diet goals
└─────────┬───────────┘         └────────────────┘
          │                             ^
          │                             │
          │                     ┌────────────────┐
          └---------------------│  <<Aspect>>    │
                                │OptimizationAsp │  <-- Handles optimization constraints for different goals
                                └────────────────┘

┌─────────────────────┐         ┌────────────────┐
│    DietGoalType     │         │RecommendRequest│
│(Weight Loss/Muscle  │<--------│(Contains goal  │
│ Gain/Weight Gain)   │         │ type)          │
└─────────────────────┘         └────────────────┘
```

### Key Optimization Constraints

#### Diet formation Constraints

1. Each meal must include one meat item.
2. Each meal must include one vegetable item.
3. Each meal must include one carbohydrate item.
4. Lunch has more diverse choices.

#### Calories Constraints

5. Total calories from all selected foods must be within ±10% of the target.

#### Nutrition balance Constraints

6. Protein ratio must be tracked against the target of 30%.
7. Carbohydrate ratio must be tracked against the target of 20%.
8. Fat ratio must be tracked against the target of 50%.

#### Food Repetition Constraints

9. Repeative food appreance will be penalized

#### Solution Enumeration Constraints

16. Previously found solutions must be excluded when searching for multiple solutions.

### Algorithm Highlights

-   **Divide and Conquer Approach**: Splits complex optimization into simpler subproblems
-   **Two-Stage Optimization**: First ensures calorie requirements, then optimizes nutrient ratios
-   **Multiple Solution Generation**: Creates diverse meal plan options
-   **Fallback Strategy**: Ensures robustness by progressively relaxing constraints if needed
-   **Linear Programming**: Uses Google OR-Tools for efficient optimization

## Technical Stack

-   Java Spring Boot backend
-   React frontend
-   MySQL database for food nutrition data
-   Google OR-Tools for optimization algorithms

## API Endpoints

-   `GET /api/food`: Get food and nutrition infomation
-   `GET /api/recommend`: Get meal plan recommendation using ML
-   `GET /api/user`: Get user information
-   `POST /api/track`: Record actual daily food intake
-   `POST /api/goals`: User set calorie goals
-   `POST /api/auth/register`: User registration
-   `POST /api/auth/login`: User login
-   `POST /api/auth/logout`: User logout
-   `POST /api/auth/token/refresh`: Refresh authentication token
-   `PUT /api/user/password`: Change user password

## Setup and Installation

[Installation instructions to be added]
