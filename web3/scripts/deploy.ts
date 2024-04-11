
import { ethers } from "hardhat";
import console from "console";
import { emailExistsInVisitors } from 'database/visitors';

function validateEmail(email: string): boolean {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}

async function checkEmailExists(email: string): Promise<boolean> {
  return emailExistsInVisitors(email);
}

const _metadataUri =
  "https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi";

async function deploy(name: string, ...params: [string]) {
  const contractFactory = await ethers.getContractFactory(name);

  return await contractFactory.deploy(...params).then((f) => f.deployed());
}

async function main() {
  const email = "example@example.com"; // Placeholder for the email to be validated

  if (!validateEmail(email)) {
    throw new Error('Invalid email format.');
  }

  if (await checkEmailExists(email)) {
    throw new Error('Email is already in use.');
  }

  const [admin] = await ethers.getSigners();

  console.log(`Deploying a smart contract...`);

  const AVAXGods = (await deploy("AVAXGods", _metadataUri)).connect(admin);

  console.log({ AVAXGods: AVAXGods.address });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
