import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class TrainingAppEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // それぞれのIDを定義
    const vpcId = "vpc-0d0ff7575f61e8f66";
    const securityGroupId = "sg-03002474e0e88cb02";
    const keyPairName = "TrainingKeyPair";

    // 既存のVPCを参照
    const vpc = ec2.Vpc.fromLookup(this, "ExistingVPC", {
      vpcId: vpcId,
    });

    // 既存のセキュリティグループを参照
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ExistingSecurityGroup",
      securityGroupId
    );

    const keyPair = ec2.KeyPair.fromKeyPairName(this, "ExistingKeyPair", keyPairName);

    const ec2Instance = new ec2.Instance(this, "MyEC2Instance", {
      vpc: vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: securityGroup,
      keyPair: keyPair,
      vpcSubnets: {
        subnets: [vpc.publicSubnets[0]],
      },
      associatePublicIpAddress: true,
    });
  }
}