error id: NlNrQb8wXQbLpdbMCr/DpA==
### Bloop error:

Unexpected error when compiling diet_tracker: java.io.FileNotFoundException: <WORKSPACE>/src/main/java/com/example/diettracker/controller/FoodRestController.java (No such file or directory)
	at java.base/java.io.RandomAccessFile.open0(Native Method)
	at java.base/java.io.RandomAccessFile.open(RandomAccessFile.java:356)
	at java.base/java.io.RandomAccessFile.<init>(RandomAccessFile.java:273)
	at java.base/java.io.RandomAccessFile.<init>(RandomAccessFile.java:223)
	at bloop.io.ByteHasher$.hashFileContents(ByteHasher.scala:19)
	at bloop.io.SourceHasher$.$anonfun$findAndHashSourcesInProject$16(SourceHasher.scala:148)
	at monix.eval.internal.TaskRunLoop$.startFull(TaskRunLoop.scala:81)
	at monix.eval.internal.TaskRestartCallback.syncOnSuccess(TaskRestartCallback.scala:101)
	at monix.eval.internal.TaskRestartCallback.onSuccess(TaskRestartCallback.scala:74)
	at monix.eval.internal.TaskShift$Register$$anon$1.run(TaskShift.scala:65)
	at monix.execution.internal.InterceptRunnable.run(InterceptRunnable.scala:27)
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144)
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642)
	at java.base/java.lang.Thread.run(Thread.java:1583)
#### Short summary: 

Unexpected error when compiling diet_tracker: java.io.FileNotFoundException: <WORKSPACE>/src/main/ja...