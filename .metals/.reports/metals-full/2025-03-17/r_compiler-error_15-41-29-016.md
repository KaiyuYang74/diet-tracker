file://<WORKSPACE>/src/main/java/com/example/diettracker/model/SetGoal.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
offset: 309
uri: file://<WORKSPACE>/src/main/java/com/example/diettracker/model/SetGoal.java
text:
```scala
package com.example.diettracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "SetGoal")
public class SetGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer goalID;

    @Column(nullable = false)
    private String goalType;

    private Integer formulaI@@D;

    @ManyToOne
    @JoinColumn(name = "goalID", insertable = false, updatable = false)
    private User user;

    // Default constructor
    public SetGoal() {
    }

    // Constructor with fields
    public SetGoal(String goalType, Integer formulaID) {
        this.goalType = goalType;
        this.formulaID = formulaID;
    }

    // Getters and Setters
    public Integer getGoalID() {
        return goalID;
    }

    public void setGoalID(Integer goalID) {
        this.goalID = goalID;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }

    public Integer getFormulaID() {
        return formulaID;
    }

    public void setFormulaID(Integer formulaID) {
        this.formulaID = formulaID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
```



#### Error stacktrace:

```
scala.collection.Iterator$$anon$19.next(Iterator.scala:973)
	scala.collection.Iterator$$anon$19.next(Iterator.scala:971)
	scala.collection.mutable.MutationTracker$CheckedIterator.next(MutationTracker.scala:76)
	scala.collection.IterableOps.head(Iterable.scala:222)
	scala.collection.IterableOps.head$(Iterable.scala:222)
	scala.collection.AbstractIterable.head(Iterable.scala:935)
	dotty.tools.dotc.interactive.InteractiveDriver.run(InteractiveDriver.scala:164)
	dotty.tools.pc.MetalsDriver.run(MetalsDriver.scala:45)
	dotty.tools.pc.HoverProvider$.hover(HoverProvider.scala:40)
	dotty.tools.pc.ScalaPresentationCompiler.hover$$anonfun$1(ScalaPresentationCompiler.scala:376)
```
#### Short summary: 

java.util.NoSuchElementException: next on empty iterator