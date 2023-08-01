const { execSync } = require("child_process");

export class AWSAccount {
  /**
   * TODO: Add property description
   */
  private name: string;

  /**
   * TODO: Add property description
   */
  private region: string;

  /**
   * TODO: Add property description
   */
  private stackNamesList: Array<string>;

  constructor(region: string) {
    if (region === null) throw new Error("Regions should not be null");
    this.region = region;
  }

  /**
   * TODO: Add method description
   * @returns
   */
  public fetchStackList(): string {
    const command = `aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE ROLLBACK_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE --region eu-west-1 --query 'sort_by(StackSummaries, &StackName)[*].[StackName, StackStatus, DriftInformation.StackDriftStatus, DriftInformation.LastCheckTimestamp]' --output table`;
    return execSync(command, { encoding: "utf-8" });
  }

  /**
   * TODO: Add method description
   * @returns
   */
  public getStackNamesFromStackList(): boolean {
    try {
      const stackNames: string = this.fetchStackList();
      this.stackNamesList = stackNames
        .trim()
        .split(/\r?\n/)
        .slice(3)
        .map((row) => row.split(/\s+/)[1]);
      return true;
    } catch (error: unknown) {
      console.error("An error occurred while retrieving the stacks:", error);
      return false;
    }
  }

  /**
   * TODO: Add method description
   * @returns
   */
  public getStackNameList(): Array<string> {
    return this.stackNamesList;
  }

  /**
   * TODO: Add method description
   */
  public checkAllStacks(): boolean {
    if (this.getStackNamesFromStackList()) {
      for (let i = 0; i < this.stackNamesList.length - 1; i++) {
        const stackName = this.stackNamesList[i];
        const command = `aws cloudformation detect-stack-drift --stack-name ${stackName} --region eu-west-1`;
        console.log(
          `[Stack ${i + 1} / ${this.stackNamesList.length}] - ${command}`
        );
        execSync(command, { encoding: "utf-8" });
      }
    } else {
      console.log("The operation should not be executed.");
      return false;
    }

    return true;
  }

  public getAllDriftedStack(): string {
    const command = `aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE ROLLBACK_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE --region eu-west-1 --query 'sort_by(StackSummaries, &StackName)[*].[StackName, StackStatus, DriftInformation.StackDriftStatus, DriftInformation.LastCheckTimestamp]' --output table | grep DRIFTED`;
    return execSync(command, { encoding: "utf-8" });
  }
}