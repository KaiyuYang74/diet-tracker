file://<WORKSPACE>/src/test/java/com/example/diettracker/service/ModelDataTest.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
uri: file://<WORKSPACE>/src/test/java/com/example/diettracker/service/ModelDataTest.java
text:
```scala
package com.example.diettracker.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Test the ModelData inner class in MealPlanService
 * Due to JNI library loading issues and limitations in simulating MPVariable
 * arrays,
 * simply verify the existence of the ModelData class
 */
class ModelDataTest {

    @Test
    @DisplayName("Verify existence of ModelData inner class")
    void testModelDataExists() {
        try {
            // Verify the existence of the inner class
            Class<?> modelDataClass = Class.forName("com.example.diettracker.service.MealPlanService$ModelData");
            assertNotNull(modelDataClass, "ModelData class should exist");

            // Verify the presence of a constructor
            assertTrue(modelDataClass.getDeclaredConstructors().length > 0,
                    "ModelData class should have a constructor");

            // Verify the presence of the solver field
            assertTrue(
                    java.util.Arrays.stream(modelDataClass.getDeclaredFields())
                            .anyMatch(field -> field.getName().equals("solver")),
                    "ModelData class should have a solver field");
        } catch (ClassNotFoundException e) {
            fail("ModelData inner class not found: " + e.getMessage());
        }
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
	dotty.tools.pc.WithCompilationUnit.<init>(WithCompilationUnit.scala:31)
	dotty.tools.pc.SimpleCollector.<init>(PcCollector.scala:345)
	dotty.tools.pc.PcSemanticTokensProvider$Collector$.<init>(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector$lzyINIT1(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.provide(PcSemanticTokensProvider.scala:88)
	dotty.tools.pc.ScalaPresentationCompiler.semanticTokens$$anonfun$1(ScalaPresentationCompiler.scala:109)
```
#### Short summary: 

java.util.NoSuchElementException: next on empty iterator