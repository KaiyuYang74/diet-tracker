package com.example.diettracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;                // 对应 "food"
    private double caloricValue;        // 对应 "Caloric Value"
    private double fat;                 // 对应 "Fat"
    private double saturatedFats;       // 对应 "Saturated Fats"
    private double monounsaturatedFats; // 对应 "Monounsaturated Fats"
    private double polyunsaturatedFats; // 对应 "Polyunsaturated Fats"
    private double carbohydrates;       // 对应 "Carbohydrates"
    private double sugars;              // 对应 "Sugars"
    private double protein;             // 对应 "Protein"
    private double dietaryFiber;        // 对应 "Dietary Fiber"
    private double cholesterol;         // 对应 "Cholesterol"
    private double sodium;              // 对应 "Sodium"
    private double nutritionDensity;    // 对应 "Nutrition Density"
    //todo: other fields like vitamins
  
    public Food() {}

    public Food(String name, double caloricValue, double fat, double saturatedFats, // ...
                double nutritionDensity) {
        this.name = name;
        this.caloricValue = caloricValue;
        this.fat = fat;
        this.saturatedFats = saturatedFats;
        // ... etc ...
        this.nutritionDensity = nutritionDensity;
    }

    // ====== Getter / Setter ======
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getCaloricValue() {
        return caloricValue;
    }

    public void setCaloricValue(double caloricValue) {
        this.caloricValue = caloricValue;
    }


    
    public double getNutritionDensity() {
        return nutritionDensity;
    }

    public void setNutritionDensity(double nutritionDensity) {
        this.nutritionDensity = nutritionDensity;
    }
}

