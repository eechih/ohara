public abstract class RowSourceConnector extends SourceConnector {
  /**
   * Returns the RowSourceTask implementation for this Connector.
   *
   * @return a RowSourceTask class
   */
  protected abstract Class<? extends RowSourceTask> taskClass();

  /**
   * Return the settings for source task.
   *
   * @param maxTasks number of tasks for this connector
   * @return a seq from settings
   */
  protected abstract List<TaskSetting> taskSetting(int maxTasks);

  /**
   * Start this Connector. This method will only be called on a clean Connector, i.e. it has either
   * just been instantiated and initialized or stop() has been invoked.
   *
   * @param taskSetting configuration settings
   */
  protected abstract void run(TaskSetting taskSetting);

  /** stop this connector */
  protected abstract void terminate();
}
