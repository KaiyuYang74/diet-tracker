package com.example.diettracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food_nutrition")
public class Food {

    @Id
    // Automatically generate primary key in database
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String food;
    // @Column(name = "Caloric_Value") add this if the case change gives errors
    private int caloricValue;
    private double fat;
    private double saturatedFats;
    private double monounsaturatedFats;
    private double polyunsaturatedFats;
    private double carbohydrates;
    private double sugars;
    private double protein;
    private double dietaryFiber;
    private double cholesterol;
    private double sodium;
    private double water;
    private double vitaminA;
    private double vitaminB1;
    private double vitaminB11;
    private double vitaminB12;
    private double vitaminB2;
    private double vitaminB3;
    private double vitaminB5;
    private double vitaminB6;
    private double vitaminC;
    private double vitaminD;
    private double vitaminE;
    private double vitaminK;
    private double calcium;
    private double copper;
    private double iron;
    private double magnesium;
    private double manganese;
    private double phosphorus;
    private double potassium;
    private double selenium;
    private double zinc;
    private double nutritionDensity;
    private String category;

    public Food() {
    }

    public Food(String name, int caloricValue, double fat, double saturatedFats, double monounsaturatedFats,
            double polyunsaturatedFats,
            double carbohydrates, double sugars, double protein, double dietaryFiber, double cholesterol, double sodium,
            double water, double vitaminA, double vitaminB1, double vitaminB11, double vitaminB12, double vitaminB2,
            double vitaminB3,
            double vitaminB5, double vitaminB6, double vitaminC, double vitaminD, double vitaminE, double vitaminK,
            double calcium,
            double copper, double iron, double magnesium, double manganese, double phosphorus, double potassium,
            double selenium,
            double zinc, double nutritionDensity, String category) {
        this.food = name;
        this.caloricValue = caloricValue;
        this.fat = fat;
        this.saturatedFats = saturatedFats;
        this.monounsaturatedFats = monounsaturatedFats;
        this.polyunsaturatedFats = polyunsaturatedFats;
        this.carbohydrates = carbohydrates;
        this.sugars = sugars;
        this.protein = protein;
        this.dietaryFiber = dietaryFiber;
        this.cholesterol = cholesterol;
        this.sodium = sodium;
        this.water = water;
        this.vitaminA = vitaminA;
        this.vitaminB1 = vitaminB1;
        this.vitaminB11 = vitaminB11;
        this.vitaminB12 = vitaminB12;
        this.vitaminB2 = vitaminB2;
        this.vitaminB3 = vitaminB3;
        this.vitaminB5 = vitaminB5;
        this.vitaminB6 = vitaminB6;
        this.vitaminC = vitaminC;
        this.vitaminD = vitaminD;
        this.vitaminE = vitaminE;
        this.vitaminK = vitaminK;
        this.calcium = calcium;
        this.copper = copper;
        this.iron = iron;
        this.magnesium = magnesium;
        this.manganese = manganese;
        this.phosphorus = phosphorus;
        this.potassium = potassium;
        this.selenium = selenium;
        this.zinc = zinc;
        this.nutritionDensity = nutritionDensity;
        this.category = category;

    }

    // add more getter and setter if I missed some

    public Long getId() {
        return id;
    }

    public String getFood() {
        return food;
    }

    public int getCaloricValue() {
        return caloricValue;
    }

    public void setCaloricValue(int caloricValue) {
        this.caloricValue = caloricValue;
    }

    public double getNutritionDensity() {
        return nutritionDensity;
    }

    public void setNutritionDensity(double nutritionDensity) {
        this.nutritionDensity = nutritionDensity;
    }

    public void setFood(String name) {
        this.food = name;
    }

    public double getFat() {
        return fat;
    }

    public void setFat(double fat) {
        this.fat = fat;
    }

    public double getSaturatedFats() {
        return saturatedFats;
    }

    public void setSaturatedFats(double saturatedFats) {
        this.saturatedFats = saturatedFats;
    }

    public double getMonounsaturatedFats() {
        return monounsaturatedFats;
    }

    public void setMonounsaturatedFats(double monounsaturatedFats) {
        this.monounsaturatedFats = monounsaturatedFats;
    }

    public double getPolyunsaturatedFats() {
        return polyunsaturatedFats;
    }

    public void setPolyunsaturatedFats(double polyunsaturatedFats) {
        this.polyunsaturatedFats = polyunsaturatedFats;
    }

    public double getCarbohydrates() {
        return carbohydrates;
    }

    public void setCarbohydrates(double carbohydrates) {
        this.carbohydrates = carbohydrates;
    }

    public double getSugars() {
        return sugars;
    }

    public void setSugars(double sugars) {
        this.sugars = sugars;
    }

    public double getProtein() {
        return protein;
    }

    public void setProtein(double protein) {
        this.protein = protein;
    }

    public double getDietaryFiber() {
        return dietaryFiber;
    }

    public void setDietaryFiber(double dietaryFiber) {
        this.dietaryFiber = dietaryFiber;
    }

    public double getCholesterol() {
        return cholesterol;
    }

    public void setCholesterol(double cholesterol) {
        this.cholesterol = cholesterol;
    }

    public double getSodium() {
        return sodium;
    }

    public void setSodium(double sodium) {
        this.sodium = sodium;
    }

    public double getWater() {
        return water;
    }

    public void setWater(double water) {
        this.water = water;
    }

    public double getVitaminA() {
        return vitaminA;
    }

    public void setVitaminA(double vitaminA) {
        this.vitaminA = vitaminA;
    }

    public double getVitaminB1() {
        return vitaminB1;
    }

    public void setVitaminB1(double vitaminB1) {
        this.vitaminB1 = vitaminB1;
    }

    public double getVitaminB11() {
        return vitaminB11;
    }

    public void setVitaminB11(double vitaminB11) {
        this.vitaminB11 = vitaminB11;
    }

    public double getVitaminB12() {
        return vitaminB12;
    }

    public void setVitaminB12(double vitaminB12) {
        this.vitaminB12 = vitaminB12;
    }

    public double getVitaminB2() {
        return vitaminB2;
    }

    public void setVitaminB2(double vitaminB2) {
        this.vitaminB2 = vitaminB2;
    }

    public double getVitaminB3() {
        return vitaminB3;
    }

    public void setVitaminB3(double vitaminB3) {
        this.vitaminB3 = vitaminB3;
    }

    public double getVitaminB5() {
        return vitaminB5;
    }

    public void setVitaminB5(double vitaminB5) {
        this.vitaminB5 = vitaminB5;
    }

    public double getVitaminB6() {
        return vitaminB6;
    }

    public void setVitaminB6(double vitaminB6) {
        this.vitaminB6 = vitaminB6;
    }

    public double getVitaminC() {
        return vitaminC;
    }

    public void setVitaminC(double vitaminC) {
        this.vitaminC = vitaminC;
    }

    public double getVitaminD() {
        return vitaminD;
    }

    public void setVitaminD(double vitaminD) {
        this.vitaminD = vitaminD;
    }

    public double getVitaminE() {
        return vitaminE;
    }

    public void setVitaminE(double vitaminE) {
        this.vitaminE = vitaminE;
    }

    public double getVitaminK() {
        return vitaminK;
    }

    public void setVitaminK(double vitaminK) {
        this.vitaminK = vitaminK;
    }

    public double getCalcium() {
        return calcium;
    }

    public void setCalcium(double calcium) {
        this.calcium = calcium;
    }

    public double getCopper() {
        return copper;
    }

    public void setCopper(double copper) {
        this.copper = copper;
    }

    public double getIron() {
        return iron;
    }

    public void setIron(double iron) {
        this.iron = iron;
    }

    public double getMagnesium() {
        return magnesium;
    }

    public void setMagnesium(double magnesium) {
        this.magnesium = magnesium;
    }

    public double getManganese() {
        return manganese;
    }

    public void setManganese(double manganese) {
        this.manganese = manganese;
    }

    public double getPhosphorus() {
        return phosphorus;
    }

    public void setPhosphorus(double phosphorus) {
        this.phosphorus = phosphorus;
    }

    public double getPotassium() {
        return potassium;
    }

    public void setPotassium(double potassium) {
        this.potassium = potassium;
    }

    public double getSelenium() {
        return selenium;
    }

    public void setSelenium(double selenium) {
        this.selenium = selenium;
    }

    public double getZinc() {
        return zinc;
    }

    public void setZinc(double zinc) {
        this.zinc = zinc;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

}
