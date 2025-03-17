package com.ece651.diettracker.recommender

import com.google.ortools.linearsolver.{
  MPSolver,
  MPVariable,
  MPConstraint,
  MPObjective
}
import scala.collection.mutable
import scala.util.Random

// If you need other libraries (e.g. scala-csv), import them here

object MealPlanner {

  // If you haven't loaded the OR-Tools dynamic library elsewhere, load it here
  // System.loadLibrary("jniortools")

  /** Simple data structure corresponding to the Food entity in Java side Can be
    * defined directly here, and convert JPA Food in the service layer
    */
  case class FoodItem(
      id: Long, // Optional
      foodName: String,
      caloricValue: Double,
      nutritionDensity: Double,
      category: String
  )

  /** Build MIP model for three meal planning
    * @param noRepeat
    *   Whether to add hard constraint to prevent the same food in multiple
    *   meals
    * @param addRepeatPenalty
    *   Whether to add penalty for repeated foods in the objective function
    * @return
    *   Mappings for (x_meats, x_vegs, x_carbs) variables
    */
  private def buildDailyMealProblem(
      solver: MPSolver,
      dfMeats: Seq[FoodItem],
      dfVegs: Seq[FoodItem],
      dfCarbs: Seq[FoodItem],
      calorieTarget: Double,
      noRepeat: Boolean,
      addRepeatPenalty: Boolean
  ): (
      Map[(Int, Int), MPVariable],
      Map[(Int, Int), MPVariable],
      Map[(Int, Int), MPVariable]
  ) = {

    val meals = Seq(0, 1, 2) // 0=breakfast, 1=lunch, 2=dinner

    // Define binary variables x_meats[(i,m)], x_vegs[(i,m)], x_carbs[(i,m)]
    val xMeats = dfMeats.indices.flatMap { i =>
      meals.map { m =>
        val v = solver.makeBoolVar(s"x_meats_${i}_$m")
        ((i, m), v)
      }
    }.toMap

    val xVegs = dfVegs.indices.flatMap { i =>
      meals.map { m =>
        val v = solver.makeBoolVar(s"x_vegs_${i}_$m")
        ((i, m), v)
      }
    }.toMap

    val xCarbs = dfCarbs.indices.flatMap { i =>
      meals.map { m =>
        val v = solver.makeBoolVar(s"x_carbs_${i}_$m")
        ((i, m), v)
      }
    }.toMap

    // 每餐 1 肉 + 1 菜 + 1 碳水
    meals.foreach { m =>
      val ctMeats = solver.makeConstraint(1, 1, s"One_meat_$m")
      dfMeats.indices.foreach { i =>
        ctMeats.setCoefficient(xMeats((i, m)), 1.0)
      }

      val ctVegs = solver.makeConstraint(1, 1, s"One_veg_$m")
      dfVegs.indices.foreach { i => ctVegs.setCoefficient(xVegs((i, m)), 1.0) }

      val ctCarbs = solver.makeConstraint(1, 1, s"One_carb_$m")
      dfCarbs.indices.foreach { i =>
        ctCarbs.setCoefficient(xCarbs((i, m)), 1.0)
      }
    }

    // 若不重复，则同一食物在3餐只能出现 <=1次
    if (noRepeat) {
      dfMeats.indices.foreach { i =>
        val c = solver.makeConstraint(0, 1, s"No_repeat_meats_$i")
        meals.foreach(m => c.setCoefficient(xMeats((i, m)), 1.0))
      }
      dfVegs.indices.foreach { i =>
        val c = solver.makeConstraint(0, 1, s"No_repeat_vegs_$i")
        meals.foreach(m => c.setCoefficient(xVegs((i, m)), 1.0))
      }
      dfCarbs.indices.foreach { i =>
        val c = solver.makeConstraint(0, 1, s"No_repeat_carbs_$i")
        meals.foreach(m => c.setCoefficient(xCarbs((i, m)), 1.0))
      }
    }

    // 三餐卡路里 = 0.3:0.4:0.3
    def mealCal(m: Int): Double = {
      var expr = 0.0
      dfMeats.indices.foreach { i =>
        expr += dfMeats(i).caloricValue * xMeats((i, m)).solutionValue()
      }
      // 这里 solutionValue() 只有求解后才能读，但我们需要Constraint:
      // => 要用 solver.makeLinearExpr() + setCoefficient 来表达, 见下写法
      expr
    }

    // 实际上 OR-Tools 里要构造 constraint: mealCal(0) = 0.3 * calorieTarget
    // 所以做一个小函数:
    def buildMealCalConstraint(
        m: Int,
        ratio: Double,
        name: String
    ): MPConstraint = {
      val ct = solver.makeConstraint(
        ratio * calorieTarget,
        ratio * calorieTarget,
        name
      )
      // meats
      dfMeats.indices.foreach { i =>
        ct.setCoefficient(xMeats((i, m)), dfMeats(i).caloricValue)
      }
      // vegs
      dfVegs.indices.foreach { i =>
        ct.setCoefficient(xVegs((i, m)), dfVegs(i).caloricValue)
      }
      // carbs
      dfCarbs.indices.foreach { i =>
        ct.setCoefficient(xCarbs((i, m)), dfCarbs(i).caloricValue)
      }
      ct
    }

    buildMealCalConstraint(0, 0.3, "Cal_breakfast")
    buildMealCalConstraint(1, 0.4, "Cal_lunch")
    buildMealCalConstraint(2, 0.3, "Cal_dinner")

    // 定义目标函数
    val objective = solver.objective()
    objective.setMaximization()

    // sum of nutritionDensity
    dfMeats.indices.foreach { i =>
      meals.foreach { m =>
        objective.setCoefficient(
          xMeats((i, m)),
          dfMeats(i).nutritionDensity
        )
      }
    }
    dfVegs.indices.foreach { i =>
      meals.foreach { m =>
        objective.setCoefficient(
          xVegs((i, m)),
          dfVegs(i).nutritionDensity
        )
      }
    }
    dfCarbs.indices.foreach { i =>
      meals.foreach { m =>
        objective.setCoefficient(
          xCarbs((i, m)),
          dfCarbs(i).nutritionDensity
        )
      }
    }

    // 若要惩罚重复，则每使用一次扣 alpha
    if (addRepeatPenalty) {
      val alpha = 0.1
      dfMeats.indices.foreach { i =>
        meals.foreach { m =>
          val oldCoef = objective.getCoefficient(xMeats((i, m)))
          objective.setCoefficient(xMeats((i, m)), oldCoef - alpha)
        }
      }
      dfVegs.indices.foreach { i =>
        meals.foreach { m =>
          val oldCoef = objective.getCoefficient(xVegs((i, m)))
          objective.setCoefficient(xVegs((i, m)), oldCoef - alpha)
        }
      }
      dfCarbs.indices.foreach { i =>
        meals.foreach { m =>
          val oldCoef = objective.getCoefficient(xCarbs((i, m)))
          objective.setCoefficient(xCarbs((i, m)), oldCoef - alpha)
        }
      }
    }

    (xMeats, xVegs, xCarbs)
  }

  /** 从求解结果读取三餐组合 */
  private def readSolution(
      solver: MPSolver,
      xMeats: Map[(Int, Int), MPVariable],
      xVegs: Map[(Int, Int), MPVariable],
      xCarbs: Map[(Int, Int), MPVariable],
      dfMeats: Seq[FoodItem],
      dfVegs: Seq[FoodItem],
      dfCarbs: Seq[FoodItem]
  ): Option[Seq[Seq[String]]] = {

    val status = solver.solve()
    if (status != MPSolver.ResultStatus.OPTIMAL) {
      return None
    }

    val meals = Seq(0, 1, 2)
    val plan = meals.map { m =>
      val meatIdx =
        dfMeats.indices.find(i => xMeats((i, m)).solutionValue() > 0.5)
      val vegIdx = dfVegs.indices.find(i => xVegs((i, m)).solutionValue() > 0.5)
      val carbIdx =
        dfCarbs.indices.find(i => xCarbs((i, m)).solutionValue() > 0.5)

      val mealItems = Seq(
        meatIdx.map(i => dfMeats(i).foodName),
        vegIdx.map(i => dfVegs(i).foodName),
        carbIdx.map(i => dfCarbs(i).foodName)
      ).flatten

      mealItems
    }

    Some(plan)
  }

  /** 枚举最多maxSolutions个可行解 不要求同等最优, 只要解出就添加"排除本解"约束, 再求下一解
    */
  private def enumerateSolutions(
      solver: MPSolver,
      xMeats: Map[(Int, Int), MPVariable],
      xVegs: Map[(Int, Int), MPVariable],
      xCarbs: Map[(Int, Int), MPVariable],
      dfMeats: Seq[FoodItem],
      dfVegs: Seq[FoodItem],
      dfCarbs: Seq[FoodItem],
      maxSolutions: Int
  ): Seq[Seq[Seq[String]]] = {

    val solutions = mutable.Buffer[Seq[Seq[String]]]()

    while (solutions.size < maxSolutions) {
      val status = solver.solve()
      if (status != MPSolver.ResultStatus.OPTIMAL) {
        // 无可行解 or 求解失败
        return solutions.toSeq
      }
      // 读取当前解
      val planOpt =
        readSolution(solver, xMeats, xVegs, xCarbs, dfMeats, dfVegs, dfCarbs)
      planOpt match {
        case None => return solutions.toSeq
        case Some(plan) =>
          solutions.append(plan)

          // 构建"排除本解"的剪切约束
          val ctCut = solver.makeConstraint(
            1,
            Double.PositiveInfinity,
            s"Cut_${solutions.size}"
          )

          // meats
          dfMeats.indices.foreach { i =>
            Seq(0, 1, 2).foreach { m =>
              val v = xMeats((i, m)).solutionValue()
              if (v > 0.5) {
                ctCut.setCoefficient(xMeats((i, m)), -1.0)
                ctCut.setConstantOffset(ctCut.getConstantOffset + 1.0)
              } else {
                ctCut.setCoefficient(xMeats((i, m)), 1.0)
              }
            }
          }
          // vegs
          dfVegs.indices.foreach { i =>
            Seq(0, 1, 2).foreach { m =>
              val v = xVegs((i, m)).solutionValue()
              if (v > 0.5) {
                ctCut.setCoefficient(xVegs((i, m)), -1.0)
                ctCut.setConstantOffset(ctCut.getConstantOffset + 1.0)
              } else {
                ctCut.setCoefficient(xVegs((i, m)), 1.0)
              }
            }
          }
          // carbs
          dfCarbs.indices.foreach { i =>
            Seq(0, 1, 2).foreach { m =>
              val v = xCarbs((i, m)).solutionValue()
              if (v > 0.5) {
                ctCut.setCoefficient(xCarbs((i, m)), -1.0)
                ctCut.setConstantOffset(ctCut.getConstantOffset + 1.0)
              } else {
                ctCut.setCoefficient(xCarbs((i, m)), 1.0)
              }
            }
          }
      }
    }

    solutions.toSeq
  }

  /** 主函数: 先用硬不重复尝试, 无解则放宽(加重复惩罚), 都找最多10个解, 然后随机选一个
    * @param dfMeats
    *   / dfVegs / dfCarbs 是你从数据库(JPA)筛选好的该类别食物列表
    * @return
    *   Option(三餐列表)
    */
  def mealPlanRecommendation(
      calorieTarget: Double,
      dfMeats: Seq[FoodItem],
      dfVegs: Seq[FoodItem],
      dfCarbs: Seq[FoodItem]
  ): Option[Seq[Seq[String]]] = {

    // (1) 先硬约束
    val solver1 = new MPSolver(
      "MealPlan_HardNoRepeat",
      MPSolver.OptimizationProblemType.CBC_MIXED_INTEGER_PROGRAMMING
    )
    val (xm1, xv1, xc1) = buildDailyMealProblem(
      solver1,
      dfMeats,
      dfVegs,
      dfCarbs,
      calorieTarget,
      noRepeat = true,
      addRepeatPenalty = false
    )
    val solutions1 = enumerateSolutions(
      solver1,
      xm1,
      xv1,
      xc1,
      dfMeats,
      dfVegs,
      dfCarbs,
      maxSolutions = 10
    )
    if (solutions1.nonEmpty) {
      // 若有解, 随机选一个
      Some(solutions1(Random.nextInt(solutions1.size)))
    } else {
      // (2) 放宽: 不硬约束, 改加重复惩罚
      val solver2 = new MPSolver(
        "MealPlan_RepeatPenalty",
        MPSolver.OptimizationProblemType.CBC_MIXED_INTEGER_PROGRAMMING
      )
      val (xm2, xv2, xc2) = buildDailyMealProblem(
        solver2,
        dfMeats,
        dfVegs,
        dfCarbs,
        calorieTarget,
        noRepeat = false,
        addRepeatPenalty = true
      )
      val solutions2 = enumerateSolutions(
        solver2,
        xm2,
        xv2,
        xc2,
        dfMeats,
        dfVegs,
        dfCarbs,
        maxSolutions = 10
      )
      if (solutions2.nonEmpty) {
        Some(solutions2(Random.nextInt(solutions2.size)))
      } else {
        None
      }
    }
  }
}
