// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TaxReportAttestation} from "../src/TaxReportAttestation.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerKey);

        TaxReportAttestation attestation = new TaxReportAttestation();
        console.log("TaxReportAttestation:", address(attestation));

        AgentRegistry registry = new AgentRegistry();
        console.log("AgentRegistry:", address(registry));

        // Register Celalyze itself as first agent on-chain
        uint256 agentId = registry.registerAgent(
            "Celalyze",
            "1.0.0",
            "Onchain Tax & Portfolio Agent for Celo. Read-only AI agent for PnL calculation, tax classification, and natural language portfolio insights.",
            "https://celalyze.vercel.app",
            "tax,pnl,chat,attestation"
        );
        console.log("Celalyze registered as agentId:", agentId);

        vm.stopBroadcast();
    }
}
